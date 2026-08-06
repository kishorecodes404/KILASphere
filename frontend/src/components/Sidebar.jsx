import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Plus,
  MessageSquare,
  Trash2,
  Pencil,
  Settings as SettingsIcon,
  X,
  Home,
} from "lucide-react";
import { useState } from "react";
import Logo from "@/components/Logo";

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onCreate,
  onDelete,
  onRename,
  open,
  onClose,
}) {
  const [editingId, setEditingId] = useState(null);
  const [tempTitle, setTempTitle] = useState("");

  const startEdit = (c) => {
    setEditingId(c.id);
    setTempTitle(c.title);
  };
  const commitEdit = async () => {
    if (editingId && tempTitle.trim()) {
      await onRename(editingId, tempTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Mobile backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="lg:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
          />
          <motion.aside
            data-testid="sidebar"
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed lg:relative z-40 h-screen w-72 shrink-0 border-r border-white/5 bg-[#09090B] flex flex-col"
          >
            {/* Brand */}
            <div className="p-5 flex items-center justify-between">
              <Logo to="/" size="md" />
              <button
                data-testid="sidebar-close-btn"
                onClick={onClose}
                className="lg:hidden p-1.5 rounded-lg hover:bg-white/5 text-[#a1a1aa] hover:text-white transition-colors"
              >
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>

            {/* New chat */}
            <div className="px-3 pb-3">
              <button
                data-testid="new-chat-btn"
                onClick={onCreate}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-500 transition-colors shadow-[0_0_16px_rgba(124,58,237,0.35)]"
              >
                <Plus size={14} strokeWidth={2.5} /> New chat
              </button>
            </div>

            <div className="px-5 pt-2 pb-1.5 text-[10px] uppercase tracking-widest text-[#52525b] font-semibold">
              History
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto scrollbar-thin px-2 pb-4">
              {conversations.length === 0 && (
                <div className="text-xs text-[#71717a] px-4 py-3">
                  No conversations yet.
                </div>
              )}
              {conversations.map((c) => (
                <div
                  key={c.id}
                  data-testid={`conv-item-${c.id}`}
                  onClick={() => onSelect(c.id)}
                  className={`group relative flex items-center gap-2 px-3 py-2 my-0.5 rounded-lg cursor-pointer transition-colors ${
                    activeId === c.id
                      ? "bg-white/[0.08] text-white"
                      : "text-[#a1a1aa] hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <MessageSquare size={14} strokeWidth={1.5} className="shrink-0" />
                  {editingId === c.id ? (
                    <input
                      data-testid="conv-title-input"
                      autoFocus
                      value={tempTitle}
                      onChange={(e) => setTempTitle(e.target.value)}
                      onBlur={commitEdit}
                      onKeyDown={(e) => e.key === "Enter" && commitEdit()}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 bg-transparent border-b border-violet-500/40 text-sm outline-none"
                    />
                  ) : (
                    <span className="flex-1 text-sm truncate">{c.title}</span>
                  )}
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                    <button
                      data-testid={`rename-btn-${c.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        startEdit(c);
                      }}
                      className="p-1 rounded hover:bg-white/10 hover:text-white"
                      aria-label="Rename"
                    >
                      <Pencil size={12} strokeWidth={1.5} />
                    </button>
                    <button
                      data-testid={`delete-btn-${c.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(c.id);
                      }}
                      className="p-1 rounded hover:bg-white/10 hover:text-red-400"
                      aria-label="Delete"
                    >
                      <Trash2 size={12} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-white/5 flex items-center gap-1">
              <Link
                to="/"
                data-testid="home-link"
                className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#a1a1aa] hover:bg-white/[0.04] hover:text-white transition-colors"
              >
                <Home size={14} strokeWidth={1.5} /> Home
              </Link>
              <Link
                to="/settings"
                data-testid="settings-link"
                className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#a1a1aa] hover:bg-white/[0.04] hover:text-white transition-colors"
              >
                <SettingsIcon size={14} strokeWidth={1.5} /> Settings
              </Link>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
