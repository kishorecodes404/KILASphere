import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  ImageIcon,
  Mic,
  FileText,
  Globe,
  Zap,
  Bot,
  Shield,
  Check,
} from "lucide-react";
import Logo from "@/components/Logo";

const FEATURES = [
  {
    icon: <Bot size={20} strokeWidth={1.5} />,
    title: "Multi-model intelligence",
    body: "Switch between GPT 5.6, Claude Sonnet 5, and Gemini 3.1 Pro mid-conversation. Pick the best brain for the task.",
  },
  {
    icon: <ImageIcon size={20} strokeWidth={1.5} />,
    title: "Studio-grade image generation",
    body: "Every prompt is auto-enhanced with camera angle, lighting, and lens, then rendered by Nano Banana.",
  },
  {
    icon: <Mic size={20} strokeWidth={1.5} />,
    title: "Voice in, thoughts out",
    body: "Tap the mic and speak. Whisper transcribes your voice into rich, well-formed queries.",
  },
  {
    icon: <FileText size={20} strokeWidth={1.5} />,
    title: "Read your files",
    body: "Drop in PDFs, CSVs, and docs. Ask questions across them with grounded, cited answers.",
  },
  {
    icon: <Globe size={20} strokeWidth={1.5} />,
    title: "Live web grounding",
    body: "Toggle web search to pull fresh, real-time information straight into any conversation.",
  },
  {
    icon: <Shield size={20} strokeWidth={1.5} />,
    title: "Free, fast, private",
    body: "No signup. No API keys. Your conversations stay on your device and in our secure store.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen ambient-bg text-white">
      {/* Nav */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#09090B]/70 border-b border-white/5">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <Logo to="/" />
          <nav className="hidden md:flex items-center gap-8 text-sm text-[#a1a1aa]">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#models" className="hover:text-white transition-colors">Models</a>
            <Link to="/settings" className="hover:text-white transition-colors">Settings</Link>
          </nav>
          <Link
            to="/chat"
            data-testid="nav-launch-btn"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-violet-600 text-white text-sm font-medium hover:bg-violet-500 transition-colors shadow-[0_0_16px_rgba(124,58,237,0.35)]"
          >
            Launch app <ArrowRight size={14} strokeWidth={2} />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-dots opacity-40 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 pt-24 pb-24 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-[#a1a1aa] mb-6">
              <Sparkles size={12} strokeWidth={2} className="text-violet-400" />
              A premium AI, made free
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight leading-[1.02]">
              One AI.
              <br />
              <span className="bg-gradient-to-r from-violet-300 via-white to-purple-400 bg-clip-text text-transparent">
                Every capability.
              </span>
            </h1>
            <p className="mt-6 text-lg text-[#a1a1aa] max-w-2xl mx-auto leading-relaxed">
              KILASphere is a premium AI assistant that chats, sees, listens, reads
              your files, browses the web, and generates studio-grade images —
              all in one clean, fast interface.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/chat"
                data-testid="hero-cta-btn"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-violet-500 text-black font-semibold hover:bg-violet-400 transition-colors shadow-[0_0_40px_rgba(0,229,255,0.25)]"
              >
                Start chatting free <ArrowRight size={16} strokeWidth={2} />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/10 text-white hover:bg-white/5 transition-colors"
              >
                Explore features
              </a>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[#71717a]">
              <span className="flex items-center gap-1.5"><Check size={12} className="text-violet-400" /> No signup</span>
              <span className="flex items-center gap-1.5"><Check size={12} className="text-violet-400" /> No API keys</span>
              <span className="flex items-center gap-1.5"><Check size={12} className="text-violet-400" /> All features unlocked</span>
            </div>
          </motion.div>
        </div>

        {/* Preview mockup */}
        <div className="max-w-5xl mx-auto px-6 pb-16 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border border-white/10 bg-[#18181B]/80 backdrop-blur-xl overflow-hidden shadow-2xl"
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
              <div className="ml-4 text-xs text-[#71717a]">kilasphere.app / chat</div>
            </div>
            <div className="p-6 md:p-10 space-y-6">
              <div className="flex items-start gap-3">
                <div className="kila-mark w-7 h-7 shrink-0 mt-1" />
                <div className="rounded-2xl bg-white/[0.03] border border-white/5 px-4 py-3 text-sm text-[#ececf1]">
                  Hi, I'm KILASphere. Ask me anything — I can chat, code, see, generate images, transcribe voice, read documents, and search the web.
                </div>
              </div>
              <div className="flex items-start gap-3 justify-end">
                <div className="rounded-2xl bg-violet-500 text-black px-4 py-3 text-sm font-medium">
                  Generate: a neon Tokyo alley at night, cinematic
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="kila-mark w-7 h-7 shrink-0 mt-1" />
                <div className="flex flex-col gap-2">
                  <div className="w-64 h-40 rounded-xl bg-gradient-to-br from-fuchsia-500/30 via-violet-500/30 to-purple-600/40 border border-white/10" />
                  <div className="text-xs text-[#71717a]">Generated with Gemini Nano Banana · 9s</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-14">
            <div className="text-xs uppercase tracking-widest text-violet-400 mb-3">Capabilities</div>
            <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
              Everything you'd expect.
              <br />
              <span className="text-[#a1a1aa]">Nothing you'd pay extra for.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: i * 0.05 }}
                className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <div className="text-base font-semibold text-white mb-1.5">{f.title}</div>
                <p className="text-sm text-[#a1a1aa] leading-relaxed">{f.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Models */}
      <section id="models" className="py-24 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="text-xs uppercase tracking-widest text-violet-400 mb-3">Frontier models</div>
              <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight leading-tight">
                Powered by the best. Chosen by you.
              </h2>
              <p className="mt-6 text-[#a1a1aa] leading-relaxed">
                Switch models mid-chat to match the moment — reasoning, code, vision, or long context. KILASphere handles the routing so you don't have to.
              </p>
              <Link
                to="/chat"
                data-testid="models-cta-btn"
                className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 hover:bg-white/5 hover:border-white/20 text-sm text-white transition-colors"
              >
                Try them all <ArrowRight size={14} strokeWidth={2} />
              </Link>
            </div>
            <div className="grid gap-3">
              {[
                { name: "GPT 5.6 Terra", vendor: "OpenAI", tag: "Best all-rounder" },
                { name: "Claude Sonnet 5", vendor: "Anthropic", tag: "Reasoning + web" },
                { name: "Gemini 3.1 Pro", vendor: "Google", tag: "Long context + files" },
                { name: "Nano Banana", vendor: "Google", tag: "Image generation" },
                { name: "Whisper", vendor: "OpenAI", tag: "Voice transcription" },
              ].map((m, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-5 py-4 rounded-2xl bg-white/[0.02] border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <Zap size={16} strokeWidth={1.5} className="text-violet-400" />
                    <div>
                      <div className="text-sm font-medium text-white">{m.name}</div>
                      <div className="text-xs text-[#71717a]">{m.vendor}</div>
                    </div>
                  </div>
                  <div className="text-xs text-[#a1a1aa]">{m.tag}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
            Ready when you are.
          </h2>
          <p className="mt-4 text-[#a1a1aa]">
            Open KILASphere in your browser. No account. No wait.
          </p>
          <Link
            to="/chat"
            data-testid="footer-cta-btn"
            className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-violet-500 text-black font-semibold hover:bg-violet-400 transition-colors"
          >
            Launch KILASphere <ArrowRight size={16} strokeWidth={2} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#71717a]">
          <Logo to="/" size="sm" />
          <div>© {new Date().getFullYear()} KILASphere. A premium AI, made free.</div>
        </div>
      </footer>
    </div>
  );
}
