import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Trash2, Sparkles, Bot } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import Logo from "@/components/Logo";
import { listModels, listConversations, deleteConversation } from "@/lib/api";

const LS_MODEL = "kilasphere.model";
const LS_WEB = "kilasphere.web";
const LS_EXPAND = "kilasphere.expand";

export default function Settings() {
  const [models, setModels] = useState([]);
  const [defaultModel, setDefaultModel] = useState(
    localStorage.getItem(LS_MODEL) || "gpt-5.6-terra"
  );
  const [webDefault, setWebDefault] = useState(
    localStorage.getItem(LS_WEB) === "true"
  );
  const [expandDefault, setExpandDefault] = useState(
    localStorage.getItem(LS_EXPAND) !== "false"
  );
  const [convCount, setConvCount] = useState(0);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    listModels().then(setModels).catch(() => {});
    listConversations().then((c) => setConvCount(c.length)).catch(() => {});
  }, []);

  const save = (key, value) => {
    localStorage.setItem(key, String(value));
    toast.success("Preference saved");
  };

  const clearAll = async () => {
    if (!window.confirm(`Delete all ${convCount} conversations? This cannot be undone.`)) return;
    setClearing(true);
    try {
      const convs = await listConversations();
      await Promise.all(convs.map((c) => deleteConversation(c.id)));
      setConvCount(0);
      toast.success("All conversations deleted");
    } catch {
      toast.error("Failed to clear conversations");
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="min-h-screen ambient-bg text-white">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#09090B]/70 border-b border-white/5">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-6 py-4">
          <Logo to="/" />
          <Link
            to="/chat"
            data-testid="back-to-chat-btn"
            className="inline-flex items-center gap-1.5 text-sm text-[#a1a1aa] hover:text-white transition-colors"
          >
            <ArrowLeft size={14} strokeWidth={2} /> Back to chat
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div className="text-xs uppercase tracking-widest text-violet-400 mb-2">Settings</div>
          <h1 className="font-display text-4xl font-bold tracking-tight">Preferences</h1>
          <p className="mt-2 text-[#a1a1aa]">Personalize how KILASphere responds.</p>
        </div>

        {/* Section: Default model */}
        <section className="mb-8 p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-2 mb-1">
            <Bot size={16} strokeWidth={1.5} className="text-violet-400" />
            <div className="text-base font-semibold">Default model</div>
          </div>
          <p className="text-sm text-[#a1a1aa] mb-5">
            The model KILASphere starts every new chat with.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {models.map((m) => (
              <button
                key={m.id}
                data-testid={`default-model-${m.id}`}
                onClick={() => {
                  setDefaultModel(m.id);
                  save(LS_MODEL, m.id);
                }}
                className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-colors ${
                  defaultModel === m.id
                    ? "border-violet-500/40 bg-violet-500/5"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-violet-400">
                  <Bot size={14} strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{m.label}</div>
                  <div className="text-[10px] uppercase tracking-widest text-[#71717a] mt-1">
                    {m.provider}
                    {m.supports_files && " · files"}
                    {m.supports_web && " · web"}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Section: Behaviour */}
        <section className="mb-8 p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} strokeWidth={1.5} className="text-violet-400" />
            <div className="text-base font-semibold">Behaviour</div>
          </div>
          <p className="text-sm text-[#a1a1aa] mb-6">
            Fine-tune how KILASphere thinks and generates.
          </p>
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-medium">Web search on by default</div>
                <div className="text-xs text-[#a1a1aa] mt-1">
                  Only affects models that support live web grounding.
                </div>
              </div>
              <Switch
                data-testid="web-default-toggle"
                checked={webDefault}
                onCheckedChange={(v) => {
                  setWebDefault(v);
                  save(LS_WEB, v);
                }}
              />
            </div>
            <div className="border-t border-white/5" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-medium">Auto-expand image prompts</div>
                <div className="text-xs text-[#a1a1aa] mt-1">
                  Rewrites short prompts into rich, cinematic descriptions before generation.
                </div>
              </div>
              <Switch
                data-testid="expand-default-toggle"
                checked={expandDefault}
                onCheckedChange={(v) => {
                  setExpandDefault(v);
                  save(LS_EXPAND, v);
                }}
              />
            </div>
          </div>
        </section>

        {/* Section: Data */}
        <section className="mb-8 p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-2 mb-1">
            <Trash2 size={16} strokeWidth={1.5} className="text-red-400" />
            <div className="text-base font-semibold">Your data</div>
          </div>
          <p className="text-sm text-[#a1a1aa] mb-5">
            You have <span className="text-white font-medium">{convCount}</span>{" "}
            conversation{convCount === 1 ? "" : "s"} saved.
          </p>
          <button
            data-testid="clear-all-btn"
            onClick={clearAll}
            disabled={clearing || convCount === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/30 text-red-400 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            <Trash2 size={14} strokeWidth={1.5} />
            {clearing ? "Clearing…" : "Delete all conversations"}
          </button>
        </section>

        <div className="text-xs text-[#71717a] text-center pt-6">
          Preferences are stored locally in your browser.
        </div>
      </main>
    </div>
  );
}
