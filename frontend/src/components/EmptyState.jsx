import { motion } from "framer-motion";
import { Code2, ImageIcon, FileText, Compass, Sparkles } from "lucide-react";

const PROMPTS = [
  {
    icon: <Code2 size={14} strokeWidth={1.5} />,
    label: "Code",
    text: "Write a Python function that finds the longest palindromic substring.",
  },
  {
    icon: <ImageIcon size={14} strokeWidth={1.5} />,
    label: "Imagine",
    text: "A neon-lit space station orbiting Saturn, cinematic, ultra detailed",
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
    <div className="relative flex-1 flex flex-col items-center justify-center px-6 overflow-hidden">
      <div className="cosmic-sphere" />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center max-w-2xl"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-400/30 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 pulse-dot" />
          <span className="overline text-cyan-300">Online · Universal AI</span>
        </div>
        <h1
          data-testid="empty-title"
          className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]"
        >
          Welcome to <span className="text-cyan-400">KILASphere</span>
        </h1>
        <p className="mt-5 text-[#a1a1aa] text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
          A cosmic AI that chats, sees images, generates art, listens to your voice,
          reads your files, and browses the web — all in one place, free.
        </p>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
          {PROMPTS.map((p, i) => (
            <motion.button
              key={i}
              data-testid={`prompt-suggestion-${i}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06 }}
              onClick={() => onPick(p)}
              className="group text-left p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-cyan-400/30 hover:bg-white/[0.06] transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-cyan-400">{p.icon}</span>
                <span className="overline text-[#a1a1aa] group-hover:text-white">
                  {p.label}
                </span>
              </div>
              <div className="text-sm text-white leading-relaxed">{p.text}</div>
            </motion.button>
          ))}
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-[#52525B]">
          <Sparkles size={10} strokeWidth={2} />
          Powered by GPT · Claude · Gemini
        </div>
      </motion.div>
    </div>
  );
}
