"""KILASphere - AI Chatbot backend.

Provides streaming chat (multi-provider via Emergent Universal LLM),
image generation via Gemini Nano Banana, Whisper speech-to-text,
image + file attachments, and persistent conversation history.
"""

import asyncio
import base64
import io
import json
import logging
import os
import tempfile
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, ConfigDict, Field
from starlette.middleware.cors import CORSMiddleware

from emergentintegrations.llm.chat import (
    FileContentWithMimeType,
    ImageContent,
    LlmChat,
    StreamDone,
    TextDelta,
    UserMessage,
)
from emergentintegrations.llm.openai import OpenAISpeechToText

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# ---- Config ---------------------------------------------------------------
EMERGENT_LLM_KEY = os.environ["EMERGENT_LLM_KEY"]
MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="KILASphere API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("kilasphere")

# ---- Model registry ------------------------------------------------------
MODEL_REGISTRY = {
    "gpt-5.6-terra":  {"provider": "openai",    "model": "gpt-5.6-terra",  "label": "GPT 5.6 Terra",   "supports_files": False, "supports_vision": True,  "supports_web": False},
    "claude-sonnet-5": {"provider": "anthropic", "model": "claude-sonnet-5", "label": "Claude Sonnet 5", "supports_files": False, "supports_vision": True,  "supports_web": True},
    "gemini-3.1-pro": {"provider": "gemini",    "model": "gemini-3.1-pro-preview", "label": "Gemini 3.1 Pro", "supports_files": True,  "supports_vision": True,  "supports_web": True},
    "gemini-3-flash": {"provider": "gemini",    "model": "gemini-3-flash-preview", "label": "Gemini 3 Flash", "supports_files": True,  "supports_vision": True,  "supports_web": True},
}
DEFAULT_MODEL = "gpt-5.6-terra"
IMAGE_GEN_MODEL = "gemini-3.1-flash-image-preview"

SYSTEM_PROMPT = (
    "You are KILASphere, a brilliant, witty, cosmic AI assistant. "
    "You are helpful, curious, and give thoughtful, well-formatted answers. "
    "Use Markdown for structure. Use fenced code blocks with language tags for code. "
    "Keep responses concise unless the user asks for depth."
)

# ---- Models --------------------------------------------------------------
def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class ConversationCreate(BaseModel):
    title: Optional[str] = "New chat"


class ConversationUpdate(BaseModel):
    title: str


class Conversation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    title: str
    model: str
    created_at: str
    updated_at: str


class Message(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    conversation_id: str
    role: str  # "user" | "assistant"
    content: str
    kind: str = "text"  # "text" | "image"
    image_data_url: Optional[str] = None
    attachments: List[dict] = Field(default_factory=list)
    created_at: str


# ---- Routes: Conversations ----------------------------------------------
@api_router.get("/models")
async def list_models():
    return [
        {"id": k, "label": v["label"], "provider": v["provider"],
         "supports_files": v["supports_files"], "supports_vision": v["supports_vision"],
         "supports_web": v["supports_web"]}
        for k, v in MODEL_REGISTRY.items()
    ]


@api_router.get("/conversations")
async def list_conversations():
    cursor = db.conversations.find({}, {"_id": 0}).sort("updated_at", -1)
    return await cursor.to_list(500)


@api_router.post("/conversations")
async def create_conversation(payload: ConversationCreate):
    conv = {
        "id": str(uuid.uuid4()),
        "title": payload.title or "New chat",
        "model": DEFAULT_MODEL,
        "created_at": _now_iso(),
        "updated_at": _now_iso(),
    }
    await db.conversations.insert_one(conv)
    return {k: v for k, v in conv.items() if k != "_id"}


@api_router.patch("/conversations/{conv_id}")
async def update_conversation(conv_id: str, payload: ConversationUpdate):
    res = await db.conversations.update_one(
        {"id": conv_id},
        {"$set": {"title": payload.title, "updated_at": _now_iso()}},
    )
    if res.matched_count == 0:
        raise HTTPException(404, "Conversation not found")
    return {"ok": True}


@api_router.delete("/conversations/{conv_id}")
async def delete_conversation(conv_id: str):
    await db.conversations.delete_one({"id": conv_id})
    await db.messages.delete_many({"conversation_id": conv_id})
    return {"ok": True}


@api_router.get("/conversations/{conv_id}/messages")
async def list_messages(conv_id: str):
    cursor = db.messages.find({"conversation_id": conv_id}, {"_id": 0}).sort("created_at", 1)
    return await cursor.to_list(2000)


# ---- Helper: build LlmChat from stored history --------------------------
async def _hydrate_chat(conv_id: str, model_key: str, use_web: bool) -> LlmChat:
    if model_key not in MODEL_REGISTRY:
        model_key = DEFAULT_MODEL
    meta = MODEL_REGISTRY[model_key]

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=conv_id,
        system_message=SYSTEM_PROMPT,
    ).with_model(meta["provider"], meta["model"])

    if use_web and meta["supports_web"]:
        if meta["provider"] == "gemini":
            chat = chat.with_tools([{"googleSearch": {}}])
        elif meta["provider"] == "anthropic":
            chat = chat.with_tools([{"type": "web_search_20250305", "name": "web_search", "max_uses": 5}])

    # Replay prior messages into the in-memory thread
    prior = await db.messages.find(
        {"conversation_id": conv_id}, {"_id": 0}
    ).sort("created_at", 1).to_list(2000)

    # Skip the just-inserted user message (the caller will pass it again via UserMessage)
    prior = prior[:-1] if prior and prior[-1]["role"] == "user" else prior
    for m in prior:
        if m["role"] == "user":
            chat.messages.append({"role": "user", "content": m.get("content") or ""})
        elif m["role"] == "assistant" and m.get("kind") == "text":
            chat.messages.append({"role": "assistant", "content": m.get("content") or ""})
    return chat


# ---- Chat Streaming ------------------------------------------------------
@api_router.post("/chat/stream")
async def chat_stream(
    conversation_id: str = Form(...),
    model_key: str = Form(DEFAULT_MODEL),
    message: str = Form(""),
    use_web: bool = Form(False),
    images: List[UploadFile] = File(default=[]),
    files: List[UploadFile] = File(default=[]),
):
    """Streaming chat endpoint that returns SSE events."""
    conv = await db.conversations.find_one({"id": conversation_id}, {"_id": 0})
    if not conv:
        raise HTTPException(404, "Conversation not found")

    # Save user's image attachments as data URLs (small preview)
    stored_attachments = []
    image_contents: List[ImageContent] = []
    for up in images or []:
        raw = await up.read()
        mime = up.content_type or "image/png"
        if mime not in ("image/jpeg", "image/png", "image/webp"):
            mime = "image/png"
        b64 = base64.b64encode(raw).decode()
        image_contents.append(ImageContent(image_base64=b64))
        stored_attachments.append({
            "kind": "image",
            "name": up.filename,
            "mime": mime,
            "data_url": f"data:{mime};base64,{b64}",
        })

    # Save file attachments to temp paths for Gemini
    file_contents: List[FileContentWithMimeType] = []
    tmp_paths: List[str] = []
    for up in files or []:
        raw = await up.read()
        suffix = os.path.splitext(up.filename or "file")[1] or ".bin"
        tf = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
        tf.write(raw)
        tf.close()
        tmp_paths.append(tf.name)
        mime = up.content_type or "application/octet-stream"
        file_contents.append(FileContentWithMimeType(file_path=tf.name, mime_type=mime))
        stored_attachments.append({"kind": "file", "name": up.filename, "mime": mime})

    # Persist user message
    user_msg_doc = {
        "id": str(uuid.uuid4()),
        "conversation_id": conversation_id,
        "role": "user",
        "content": message,
        "kind": "text",
        "image_data_url": None,
        "attachments": stored_attachments,
        "created_at": _now_iso(),
    }
    await db.messages.insert_one(user_msg_doc)

    # If model doesn't support files, ignore silently
    meta = MODEL_REGISTRY.get(model_key, MODEL_REGISTRY[DEFAULT_MODEL])
    if not meta["supports_files"]:
        file_contents = []

    # Update conv model + timestamp
    await db.conversations.update_one(
        {"id": conversation_id},
        {"$set": {"model": model_key, "updated_at": _now_iso()}},
    )

    async def event_generator():
        assistant_id = str(uuid.uuid4())
        full_text_parts: List[str] = []
        try:
            chat = await _hydrate_chat(conversation_id, model_key, use_web)

            um = UserMessage(
                text=message or " ",
                file_contents=[*image_contents, *file_contents] or None,
            )

            async for ev in chat.stream_message(um):
                if isinstance(ev, TextDelta):
                    full_text_parts.append(ev.content)
                    payload = json.dumps({"type": "delta", "content": ev.content})
                    yield f"data: {payload}\n\n"
                elif isinstance(ev, StreamDone):
                    break

            final_text = "".join(full_text_parts).strip() or "(no response)"

            asst_doc = {
                "id": assistant_id,
                "conversation_id": conversation_id,
                "role": "assistant",
                "content": final_text,
                "kind": "text",
                "image_data_url": None,
                "attachments": [],
                "created_at": _now_iso(),
            }
            await db.messages.insert_one(asst_doc)

            # Auto-title new conversations
            if (conv.get("title") or "New chat") == "New chat" and message:
                new_title = message.strip().split("\n")[0][:60]
                await db.conversations.update_one(
                    {"id": conversation_id},
                    {"$set": {"title": new_title, "updated_at": _now_iso()}},
                )
                yield f"data: {json.dumps({'type': 'title', 'title': new_title})}\n\n"

            yield f"data: {json.dumps({'type': 'done', 'message_id': assistant_id})}\n\n"
        except Exception as e:
            logger.exception("chat_stream failed")
            yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"
        finally:
            for p in tmp_paths:
                try:
                    os.unlink(p)
                except OSError:
                    pass

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no", "Connection": "keep-alive"},
    )


# ---- Image generation ----------------------------------------------------
class ImageGenRequest(BaseModel):
    conversation_id: str
    prompt: str


@api_router.post("/image/generate")
async def generate_image(payload: ImageGenRequest):
    conv = await db.conversations.find_one({"id": payload.conversation_id}, {"_id": 0})
    if not conv:
        raise HTTPException(404, "Conversation not found")

    # Save user message
    user_doc = {
        "id": str(uuid.uuid4()),
        "conversation_id": payload.conversation_id,
        "role": "user",
        "content": f"/imagine {payload.prompt}",
        "kind": "text",
        "image_data_url": None,
        "attachments": [],
        "created_at": _now_iso(),
    }
    await db.messages.insert_one(user_doc)

    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"imggen-{uuid.uuid4()}",
            system_message="You are a creative image generation assistant.",
        ).with_model("gemini", IMAGE_GEN_MODEL).with_params(modalities=["image", "text"])

        text, images = await chat.send_message_multimodal_response(
            UserMessage(text=payload.prompt)
        )

        if not images:
            raise HTTPException(500, "No image generated")

        img = images[0]
        data_url = f"data:{img['mime_type']};base64,{img['data']}"
        asst_id = str(uuid.uuid4())
        asst_doc = {
            "id": asst_id,
            "conversation_id": payload.conversation_id,
            "role": "assistant",
            "content": text or f"Generated: {payload.prompt}",
            "kind": "image",
            "image_data_url": data_url,
            "attachments": [],
            "created_at": _now_iso(),
        }
        await db.messages.insert_one(asst_doc)

        if (conv.get("title") or "New chat") == "New chat":
            new_title = payload.prompt[:60]
            await db.conversations.update_one(
                {"id": payload.conversation_id},
                {"$set": {"title": new_title, "updated_at": _now_iso()}},
            )

        await db.conversations.update_one(
            {"id": payload.conversation_id},
            {"$set": {"updated_at": _now_iso()}},
        )
        return {"message": asst_doc}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("image gen failed")
        raise HTTPException(500, f"Image generation failed: {e}")


# ---- Voice transcription -------------------------------------------------
@api_router.post("/voice/transcribe")
async def transcribe(audio: UploadFile = File(...)):
    raw = await audio.read()
    # whisper accepts mp3, mp4, mpeg, mpga, m4a, wav, webm
    suffix = os.path.splitext(audio.filename or "audio.webm")[1] or ".webm"
    tf = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    tf.write(raw)
    tf.close()
    try:
        stt = OpenAISpeechToText(api_key=EMERGENT_LLM_KEY)
        with open(tf.name, "rb") as fh:
            resp = await stt.transcribe(file=fh, model="whisper-1", response_format="json")
        return {"text": getattr(resp, "text", "") or ""}
    except Exception as e:
        logger.exception("transcription failed")
        raise HTTPException(500, f"Transcription failed: {e}")
    finally:
        try:
            os.unlink(tf.name)
        except OSError:
            pass


@api_router.get("/")
async def root():
    return {"service": "KILASphere", "status": "online"}


# ---- App wiring ----------------------------------------------------------
app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def _shutdown():
    client.close()
