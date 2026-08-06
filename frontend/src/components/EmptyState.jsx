import { motion } from "framer-motion";
import { Code2, ImageIcon, FileText, Compass } from "lucide-react";

const PROMPTS = [
  {
    icon: <Code2 size={14} strokeWidth={1.5} />,
    label: "Code",
    text: "Write a Python function that finds the longest palindromic substring, with test cases.",
  },
  {
    icon: <ImageIcon size={14} strokeWidth={1.5} />,
    label: "Imagine",
    text: "A neon Tokyo alley at night, cinematic, rain-soaked reflections",
    imagine: true,
  },
  {
    icon: <FileText size={14} strokeWidth={1.5} />,
    label: "Explain",
    text: "Explain quantum entanglement like I'm 12, with a real-world analogy.",
  },
  {
    icon: <Compass size={14} strokeWidth={1.5} />,
    label: "Plan",
    text: "Plan a 3-day itinerary for solo travel in Kyoto in autumn.",
  },
];

export default function EmptyState({ onPick }) {
  return (
    <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl text-center"
      >
        <div className="mx-auto kila-mark w-14 h-14 mb-6" />
        <h1
          data-testid="empty-title"
          className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.05]"
        >
          What can I help with?
        </h1>
        <p className="mt-3 text-[#a1a1aa] text-base leading-relaxed max-w-lg mx-auto">
          Ask anything. Chat, code, generate images, transcribe voice, read files, or search the web.
        </p>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-xl mx-auto">
          {PROMPTS.map((p, i) => (
            <motion.button
              key={i}
              data-testid={`prompt-suggestion-${i}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + i * 0.05 }}
              onClick={() => onPick(p)}
              className="group text-left p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/15 hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center text-violet-400">
                  {p.icon}
                </span>
                <span className="text-[11px] uppercase tracking-widest text-[#a1a1aa] font-semibold">
                  {p.label}
                </span>
              </div>
              <div className="text-sm text-white leading-relaxed">{p.text}</div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
