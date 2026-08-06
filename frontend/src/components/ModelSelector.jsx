import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Bot, Zap } from "lucide-react";

const ICONS = {
  openai: <Bot size={14} strokeWidth={1.5} />,
  anthropic: <Zap size={14} strokeWidth={1.5} />,
  gemini: <Bot size={14} strokeWidth={1.5} />,
};

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
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#14141E] border border-white/10 hover:bg-white/[0.06] hover:text-white text-white transition-colors text-sm font-medium"
      >
        <span className="text-cyan-400">{ICONS[current?.provider] || <Bot size={14} />}</span>
        <span>{current?.label || "Choose model"}</span>
        <ChevronDown size={14} strokeWidth={1.5} className={open ? "rotate-180 transition-transform" : "transition-transform"} />
      </button>

      {open && (
        <div
          data-testid="model-selector-menu"
          className="absolute top-full mt-2 left-0 min-w-[260px] rounded-2xl border border-white/10 bg-[#0A0A10]/95 backdrop-blur-2xl shadow-2xl overflow-hidden z-50"
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
                    ? "bg-cyan-400/10 text-cyan-300"
                    : "text-[#a1a1aa] hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="text-cyan-400">{ICONS[m.provider]}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{m.label}</div>
                  <div className="text-[10px] uppercase tracking-widest text-[#52525B]">
                    {m.provider}
                    {m.supports_files && " · files"}
                    {m.supports_web && " · web"}
                    {m.supports_vision && " · vision"}
                  </div>
                </div>
                {m.id === selected && <Check size={14} strokeWidth={2} className="text-cyan-400" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
