import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Menu, Settings as SettingsIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import Sidebar from "@/components/Sidebar";
import ModelSelector from "@/components/ModelSelector";
import MessageBubble from "@/components/MessageBubble";
import InputDock from "@/components/InputDock";
import EmptyState from "@/components/EmptyState";
import {
  listModels,
  listConversations,
  createConversation,
  deleteConversation,
  updateConversation,
  listMessages,
  streamChat,
  generateImage,
} from "@/lib/api";

const LS_MODEL = "kilasphere.model";
const LS_CONV = "kilasphere.activeConv";
const LS_WEB = "kilasphere.web";

export default function Chat() {
  const [models, setModels] = useState([]);
  const [modelKey, setModelKey] = useState(
    localStorage.getItem(LS_MODEL) || "gpt-5.6-terra"
  );
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(localStorage.getItem(LS_CONV) || null);
  const [messages, setMessages] = useState([]);
  const [streaming, setStreaming] = useState(false);
  const [streamId, setStreamId] = useState(null);
  const [useWeb, setUseWeb] = useState(localStorage.getItem(LS_WEB) === "true");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const scrollRef = useRef(null);

  const currentModel = useMemo(
    () => models.find((m) => m.id === modelKey),
    [models, modelKey]
  );

  useEffect(() => {
    (async () => {
      try {
        const [mods, convs] = await Promise.all([listModels(), listConversations()]);
        setModels(mods);
        setConversations(convs);
        if (!activeId && convs.length > 0) setActiveId(convs[0].id);
      } catch {
        toast.error("Failed to load KILASphere");
      }
    })();
  }, []); // eslint-disable-line

  useEffect(() => localStorage.setItem(LS_MODEL, modelKey), [modelKey]);
  useEffect(() => {
    if (activeId) localStorage.setItem(LS_CONV, activeId);
  }, [activeId]);
  useEffect(() => localStorage.setItem(LS_WEB, useWeb ? "true" : "false"), [useWeb]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, []);

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    (async () => {
      try {
        const m = await listMessages(activeId);
        setMessages(m);
        requestAnimationFrame(() =>
          scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
        );
      } catch {
        toast.error("Could not load conversation");
      }
    })();
  }, [activeId]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  };

  const ensureConversation = useCallback(async () => {
    if (activeId) return activeId;
    const c = await createConversation();
    setConversations((prev) => [c, ...prev]);
    setActiveId(c.id);
    return c.id;
  }, [activeId]);

  const handleCreate = async () => {
    const c = await createConversation();
    setConversations((prev) => [c, ...prev]);
    setActiveId(c.id);
    setMessages([]);
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const handleDelete = async (id) => {
    await deleteConversation(id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) {
      setActiveId(null);
      setMessages([]);
    }
  };

  const handleRename = async (id, title) => {
    await updateConversation(id, title);
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, title } : c)));
  };

  const handleSend = async ({ text, images, files }) => {
    const convId = await ensureConversation();

    const optimistic = {
      id: `tmp-${Date.now()}`,
      conversation_id: convId,
      role: "user",
      content: text,
      kind: "text",
      attachments: [
        ...images.map((f) => ({ kind: "image", name: f.name, data_url: URL.createObjectURL(f) })),
        ...files.map((f) => ({ kind: "file", name: f.name })),
      ],
      created_at: new Date().toISOString(),
    };
    const asstId = `stream-${Date.now()}`;
    const asstMsg = {
      id: asstId,
      conversation_id: convId,
      role: "assistant",
      content: "",
      kind: "text",
      attachments: [],
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic, asstMsg]);
    setStreaming(true);
    setStreamId(asstId);
    scrollToBottom();

    try {
      await streamChat({
        conversationId: convId,
        modelKey,
        message: text,
        useWeb,
        images,
        files,
        onDelta: (chunk) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === asstId ? { ...m, content: (m.content || "") + chunk } : m
            )
          );
          scrollToBottom();
        },
        onTitle: (title) => {
          setConversations((prev) =>
            prev.map((c) => (c.id === convId ? { ...c, title } : c))
          );
        },
        onDone: () => {},
        onError: (err) => {
          toast.error(err.message || "Stream failed");
          setMessages((prev) =>
            prev.map((m) =>
              m.id === asstId
                ? { ...m, content: (m.content || "") + `\n\n*Error: ${err.message}*` }
                : m
            )
          );
        },
      });
    } finally {
      setStreaming(false);
      setStreamId(null);
      listConversations().then(setConversations).catch(() => {});
    }
  };

  const handleGenerateImage = async (prompt) => {
    if (!prompt.trim()) return;
    const convId = await ensureConversation();
    const optimistic = {
      id: `tmp-${Date.now()}`,
      conversation_id: convId,
      role: "user",
      content: `Imagine: ${prompt}`,
      kind: "text",
      attachments: [],
      created_at: new Date().toISOString(),
    };
    const placeholder = {
      id: `img-${Date.now()}`,
      conversation_id: convId,
      role: "assistant",
      content: "",
      kind: "text",
      attachments: [],
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic, placeholder]);
    setStreaming(true);
    setStreamId(placeholder.id);
    scrollToBottom();
    try {
      const finalMsg = await generateImage(convId, prompt);
      setMessages((prev) => prev.map((m) => (m.id === placeholder.id ? finalMsg : m)));
      listConversations().then(setConversations).catch(() => {});
    } catch {
      toast.error("Image generation failed");
      setMessages((prev) => prev.filter((m) => m.id !== placeholder.id));
    } finally {
      setStreaming(false);
      setStreamId(null);
      scrollToBottom();
    }
  };

  const handlePickPrompt = (p) => {
    if (p.imagine) handleGenerateImage(p.text);
    else handleSend({ text: p.text, images: [], files: [] });
  };

  const showEmpty = messages.length === 0 && !streaming;

  return (
    <div className="h-screen w-screen flex bg-[#0b0b0f] text-white overflow-hidden">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={(id) => {
          setActiveId(id);
          if (window.innerWidth < 1024) setSidebarOpen(false);
        }}
        onCreate={handleCreate}
        onDelete={handleDelete}
        onRename={handleRename}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <header className="sticky top-0 z-20 h-14 flex items-center gap-3 px-3 lg:px-6 bg-[#0b0b0f]/85 backdrop-blur-xl border-b border-white/5">
          <button
            data-testid="toggle-sidebar-btn"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Toggle sidebar"
            className="p-2 rounded-lg hover:bg-white/5 text-[#a1a1aa] hover:text-white transition-colors"
          >
            <Menu size={16} strokeWidth={1.5} />
          </button>

          <ModelSelector models={models} selected={modelKey} onChange={setModelKey} />

          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/settings"
              data-testid="header-settings-link"
              aria-label="Settings"
              className="p-2 rounded-lg hover:bg-white/5 text-[#a1a1aa] hover:text-white transition-colors"
            >
              <SettingsIcon size={16} strokeWidth={1.5} />
            </Link>
          </div>
        </header>

        {/* Chat area */}
        <div
          ref={scrollRef}
          data-testid="chat-scroll"
          className="flex-1 overflow-y-auto scrollbar-thin flex flex-col"
        >
          {showEmpty ? (
            <EmptyState onPick={handlePickPrompt} />
          ) : (
            <div className="w-full max-w-3xl mx-auto px-4 lg:px-6 py-8 flex flex-col gap-7">
              {messages.map((m) => (
                <MessageBubble
                  key={m.id}
                  message={m}
                  streaming={streaming && m.id === streamId}
                />
              ))}
            </div>
          )}
        </div>

        {/* Input dock */}
        <InputDock
          onSend={handleSend}
          onGenerateImage={handleGenerateImage}
          disabled={streaming}
          useWeb={useWeb}
          onToggleWeb={() => setUseWeb((w) => !w)}
          supportsFiles={!!currentModel?.supports_files}
          supportsWeb={!!currentModel?.supports_web}
        />
      </main>
    </div>
  );
}
