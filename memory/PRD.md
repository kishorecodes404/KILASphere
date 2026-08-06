# KILASphere — AI Chatbot

## Problem Statement
"build an ai powered powerful chatbot for completely free and allow access to all features, it must be capable of doing anything and don't expect me to instruct you everything and do it on your own, name it something cool af"

## User Choices
- Name: **KILASphere**
- Emergent Universal LLM Key
- All features enabled
- Open access (no auth)

## Architecture
- **Backend**: FastAPI + Motor (MongoDB) + emergentintegrations
- **Frontend**: React + Framer Motion + react-markdown + react-syntax-highlighter + Tailwind
- **Streaming**: SSE via `fetch` reader
- **Design**: Deep cosmic dark mode (#05050A void, #00E5FF cyan, #FF5F1F orange), Unbounded / Manrope / JetBrains Mono fonts

## Features Implemented (Feb 2026)
- Multi-conversation sidebar with create / rename / delete
- Model selector: GPT 5.6 Terra, Claude Sonnet 5, Gemini 3.1 Pro, Gemini 3 Flash
- Streaming chat with in-thread history replay from Mongo
- Vision (image attachments as base64, cross-provider)
- File attachments (PDF/txt/csv/md/json/docx) — Gemini models only
- Image generation (Gemini Nano Banana `gemini-3.1-flash-image-preview`)
- Voice input via Whisper (`whisper-1`)
- Web search grounding (Anthropic web_search, Gemini googleSearch)
- Markdown rendering + code syntax highlighting + copy button
- Empty state with 4 tap-to-start prompts

## Data model (MongoDB)
- `conversations` { id, title, model, created_at, updated_at }
- `messages` { id, conversation_id, role, content, kind, image_data_url, attachments[], created_at }

## Backlog / Next
- P1: Conversation search
- P1: Regenerate response, stop generation
- P2: Export chat as markdown
- P2: System prompt customization
