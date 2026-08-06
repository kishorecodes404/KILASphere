import { motion, AnimatePresence } from "framer-motion";
import { Plus, MessageSquare, Trash2, Pencil, Sparkles, X } from "lucide-react";
import { useState } from "react";

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
        <motion.aside
          data-testid="sidebar"
          initial={{ x: -320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -320, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 30 }}
          className="fixed lg:relative z-40 h-screen w-72 shrink-0 border-r border-white/5 bg-[#05050A] flex flex-col"
        >
          {/* Brand */}
          <div className="p-6 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-orange-500 glow-cyan flex items-center justify-center">
                <Sparkles size={16} strokeWidth={2} className="text-black" />
              </div>
              <div>
                <div className="font-display text-lg font-bold tracking-tight">
                  KILA<span className="text-cyan-400">Sphere</span>
                </div>
                <div className="overline text-[#52525B]">AI · Cosmos</div>
              </div>
            </div>
            <button
              data-testid="sidebar-close-btn"
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-full hover:bg-white/5 text-[#a1a1aa] hover:text-white transition-colors"
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>

          {/* New chat */}
          <div className="px-4 pb-4">
            <button
              data-testid="new-chat-btn"
              onClick={onCreate}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-cyan-400/40 text-cyan-400 hover:bg-cyan-400 hover:text-[#05050A] transition-colors duration-300 text-xs font-bold uppercase tracking-widest"
            >
              <Plus size={14} strokeWidth={2} /> New Chat
            </button>
          </div>

          <div className="px-6 pb-2 overline text-[#52525B]">History</div>

          {/* List */}
          <div className="flex-1 overflow-y-auto scrollbar-thin px-2 pb-4">
            {conversations.length === 0 && (
              <div className="text-xs text-[#52525B] px-4 py-3">
                No conversations yet.
              </div>
            )}
            {conversations.map((c) => (
              <div
                key={c.id}
                data-testid={`conv-item-${c.id}`}
                onClick={() => onSelect(c.id)}
                className={`group relative flex items-center gap-2 px-3 py-2.5 my-0.5 rounded-xl cursor-pointer transition-colors ${
                  activeId === c.id
                    ? "bg-white/[0.06] text-white"
                    : "text-[#a1a1aa] hover:bg-white/[0.03] hover:text-white"
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
                    className="flex-1 bg-transparent border-b border-cyan-400/40 text-sm outline-none"
                  />
                ) : (
                  <span className="flex-1 text-sm truncate">{c.title}</span>
                )}
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                  <button
                    data-testid={`rename-btn-${c.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(c);
                    }}
                    className="p-1 rounded hover:bg-white/10 hover:text-white"
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
                  >
                    <Trash2 size={12} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/5 text-[10px] uppercase tracking-widest text-[#52525B]">
            Universal · Free · Open Access
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
