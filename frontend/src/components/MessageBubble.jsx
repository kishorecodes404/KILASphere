import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check, User } from "lucide-react";
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
    <div className="my-4 rounded-xl overflow-hidden border border-white/10 bg-[#0a0a10]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/[0.02]">
        <span className="text-xs font-mono-code text-[#a1a1aa]">{lang || "code"}</span>
        <button
          data-testid="copy-code-btn"
          onClick={doCopy}
          className="flex items-center gap-1.5 text-xs text-[#a1a1aa] hover:text-violet-400 transition-colors"
        >
          {copied ? (
            <>
              <Check size={12} strokeWidth={2} /> Copied
            </>
          ) : (
            <>
              <Copy size={12} strokeWidth={1.5} /> Copy
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={lang || "text"}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: "1rem 1.25rem",
          background: "transparent",
          fontSize: "0.85rem",
          fontFamily: '"JetBrains Mono", monospace',
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
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="kila-mark w-8 h-8 shrink-0 mt-1" aria-hidden />
      )}
      <div
        className={`flex flex-col min-w-0 ${isUser ? "items-end max-w-[85%]" : "items-start max-w-[85%] flex-1"}`}
      >
        {/* Attachments */}
        {message.attachments?.length > 0 && (
          <div className={`flex flex-wrap gap-2 mb-2 ${isUser ? "justify-end" : ""}`}>
            {message.attachments.map((a, i) =>
              a.kind === "image" && a.data_url ? (
                <img
                  key={i}
                  src={a.data_url}
                  alt={a.name}
                  className="rounded-2xl max-w-[240px] max-h-[240px] object-cover border border-white/10"
                />
              ) : (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-[#a1a1aa]"
                >
                  <span>📄</span>
                  <span className="max-w-[180px] truncate">{a.name}</span>
                </div>
              )
            )}
          </div>
        )}

        {/* Generated image */}
        {message.kind === "image" && message.image_data_url && (
          <div className="mb-3 rounded-2xl overflow-hidden border border-white/10 max-w-[460px]">
            <img
              src={message.image_data_url}
              alt="Generated"
              className="w-full block"
            />
          </div>
        )}

        {isUser ? (
          <div className="bg-violet-600 text-white rounded-3xl rounded-tr-md px-5 py-3 shadow-[0_0_20px_rgba(124,58,237,0.25)]">
            <div className="whitespace-pre-wrap text-[0.95rem] leading-relaxed font-medium">
              {message.content}
            </div>
          </div>
        ) : (
          <div className="prose-kila text-[0.95rem] w-full">
            {message.content ? (
              <>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{ code: CodeBlock }}
                >
                  {message.content}
                </ReactMarkdown>
                {streaming && <span className="stream-caret" aria-hidden />}
              </>
            ) : streaming ? (
              <div className="flex items-center gap-1.5 py-2">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 loading-dot" />
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 loading-dot" />
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 loading-dot" />
              </div>
            ) : null}
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-8 h-8 shrink-0 mt-1 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <User size={14} strokeWidth={1.5} className="text-[#a1a1aa]" />
        </div>
      )}
    </motion.div>
  );
}
