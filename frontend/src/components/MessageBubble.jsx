import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check, Sparkles, User } from "lucide-react";
import { useState } from "react";

function CodeBlock({ inline, className, children, ...props }) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const lang = match ? match[1] : "";
  const code = String(children).replace(/\n$/, "");

  if (inline) {
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  }

  const doCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-white/10 bg-[#0A0A10]">
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-white/5 bg-[#14141E]">
        <span className="overline text-[#52525B]">{lang || "code"}</span>
        <button
          data-testid="copy-code-btn"
          onClick={doCopy}
          className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-[#a1a1aa] hover:text-cyan-400 transition-colors"
        >
          {copied ? <Check size={12} strokeWidth={2} /> : <Copy size={12} strokeWidth={1.5} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <SyntaxHighlighter
        language={lang || "text"}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: "1rem",
          background: "transparent",
          fontSize: "0.85rem",
          fontFamily: "JetBrains Mono, monospace",
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

export default function MessageBubble({ message, streaming = false }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      data-testid={`message-${message.role}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-4 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="w-8 h-8 shrink-0 mt-1 rounded-full bg-gradient-to-br from-cyan-400 to-orange-500 flex items-center justify-center glow-cyan">
          <Sparkles size={14} strokeWidth={2} className="text-black" />
        </div>
      )}
      <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[80%]`}>
        {/* Attachments */}
        {message.attachments?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {message.attachments.map((a, i) =>
              a.kind === "image" && a.data_url ? (
                <img
                  key={i}
                  src={a.data_url}
                  alt={a.name}
                  className="rounded-xl max-w-[220px] border border-white/10"
                />
              ) : (
                <div
                  key={i}
                  className="px-3 py-1.5 rounded-xl bg-[#14141E] border border-white/10 text-xs text-[#a1a1aa]"
                >
                  📄 {a.name}
                </div>
              )
            )}
          </div>
        )}

        {message.kind === "image" && message.image_data_url && (
          <div className="mb-2 rounded-2xl overflow-hidden border border-white/10 max-w-[420px]">
            <img src={message.image_data_url} alt="Generated" className="w-full block" />
          </div>
        )}

        {isUser ? (
          <div className="bg-[#14141E] text-white rounded-2xl rounded-tr-sm px-5 py-3 border border-white/5">
            <div className="whitespace-pre-wrap text-[0.95rem] leading-relaxed">
              {message.content}
            </div>
          </div>
        ) : (
          <div className="prose-kila text-[0.95rem]">
            {message.content ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{ code: CodeBlock }}
              >
                {message.content}
              </ReactMarkdown>
            ) : streaming ? (
              <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 pulse-dot" />
            ) : null}
            {streaming && message.content && (
              <span className="inline-block ml-1 w-1.5 h-4 bg-cyan-400 align-middle animate-pulse" />
            )}
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-8 h-8 shrink-0 mt-1 rounded-full bg-[#14141E] border border-white/10 flex items-center justify-center">
          <User size={14} strokeWidth={1.5} className="text-[#a1a1aa]" />
        </div>
      )}
    </motion.div>
  );
}
