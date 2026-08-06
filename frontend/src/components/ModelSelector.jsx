import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Bot } from "lucide-react";

export default function ModelSelector({ models, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const current = models.find((m) => m.id === selected);

  return (
    <div ref={ref} className="relative">
      <button
        data-testid="model-selector-btn"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-white/15 text-white transition-colors text-sm font-medium"
      >
        <Bot size={14} strokeWidth={1.5} className="text-violet-400" />
        <span>{current?.label || "Choose model"}</span>
        <ChevronDown
          size={14}
          strokeWidth={1.5}
          className={`text-[#a1a1aa] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          data-testid="model-selector-menu"
          className="absolute top-full mt-2 left-0 min-w-[280px] rounded-2xl border border-white/10 bg-[#18181B]/95 backdrop-blur-2xl shadow-2xl overflow-hidden z-50"
        >
          <div className="p-2">
            {models.map((m) => (
              <button
                key={m.id}
                data-testid={`model-option-${m.id}`}
                onClick={() => {
                  onChange(m.id);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-colors ${
                  m.id === selected
                    ? "bg-violet-500/10 text-violet-300"
                    : "text-[#ececf1] hover:bg-white/[0.06]"
                }`}
              >
                <Bot size={14} strokeWidth={1.5} className="text-violet-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white">{m.label}</div>
                  <div className="text-[10px] uppercase tracking-widest text-[#71717a] mt-0.5">
                    {m.provider}
                    {m.supports_files && " · files"}
                    {m.supports_web && " · web"}
                    {m.supports_vision && " · vision"}
                  </div>
                </div>
                {m.id === selected && (
                  <Check size={14} strokeWidth={2.5} className="text-violet-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
