import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

export async function listModels() {
  const { data } = await api.get("/models");
  return data;
}

export async function listConversations() {
  const { data } = await api.get("/conversations");
  return data;
}

export async function createConversation() {
  const { data } = await api.post("/conversations", { title: "New chat" });
  return data;
}

export async function updateConversation(id, title) {
  const { data } = await api.patch(`/conversations/${id}`, { title });
  return data;
}

export async function deleteConversation(id) {
  const { data } = await api.delete(`/conversations/${id}`);
  return data;
}

export async function listMessages(convId) {
  const { data } = await api.get(`/conversations/${convId}/messages`);
  return data;
}

export async function generateImage(conversation_id, prompt) {
  const { data } = await api.post("/image/generate", { conversation_id, prompt });
  return data.message;
}

export async function transcribeAudio(blob) {
  const fd = new FormData();
  fd.append("audio", blob, "voice.webm");
  const { data } = await api.post("/voice/transcribe", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.text;
}

/**
 * Streams a chat completion via SSE (fetch + reader).
 * @param {object} opts
 * @param {string} opts.conversationId
 * @param {string} opts.modelKey
 * @param {string} opts.message
 * @param {boolean} opts.useWeb
 * @param {File[]} opts.images
 * @param {File[]} opts.files
 * @param {function} opts.onDelta - (chunk) => void
 * @param {function} opts.onTitle - (title) => void
 * @param {function} opts.onDone
 * @param {function} opts.onError
 */
export async function streamChat({
  conversationId,
  modelKey,
  message,
  useWeb,
  images = [],
  files = [],
  onDelta,
  onTitle,
  onDone,
  onError,
}) {
  const fd = new FormData();
  fd.append("conversation_id", conversationId);
  fd.append("model_key", modelKey);
  fd.append("message", message);
  fd.append("use_web", useWeb ? "true" : "false");
  images.forEach((f) => fd.append("images", f));
  files.forEach((f) => fd.append("files", f));

  const res = await fetch(`${API}/chat/stream`, {
    method: "POST",
    body: fd,
  });
  if (!res.ok || !res.body) {
    onError?.(new Error(`HTTP ${res.status}`));
    return;
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop();
    for (const p of parts) {
      const line = p.trim();
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      try {
        const ev = JSON.parse(payload);
        if (ev.type === "delta") onDelta?.(ev.content);
        else if (ev.type === "title") onTitle?.(ev.title);
        else if (ev.type === "done") onDone?.(ev);
        else if (ev.type === "error") onError?.(new Error(ev.error));
      } catch {
        // ignore parse errors
      }
    }
  }
  onDone?.({});
}
