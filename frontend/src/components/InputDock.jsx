import { useRef, useState } from "react";
import {
  Send,
  Paperclip,
  ImagePlus,
  Mic,
  Sparkles,
  Globe,
  X,
  Square,
} from "lucide-react";
import { toast } from "sonner";
import { transcribeAudio } from "@/lib/api";

export default function InputDock({
  onSend,
  onGenerateImage,
  disabled,
  useWeb,
  onToggleWeb,
  supportsFiles,
  supportsWeb,
}) {
  const [text, setText] = useState("");
  const [images, setImages] = useState([]);
  const [files, setFiles] = useState([]);
  const [imageMode, setImageMode] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);

  const autoGrow = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 220) + "px";
  };

  const handleSend = () => {
    if (disabled) return;
    const trimmed = text.trim();
    if (!trimmed && images.length === 0 && files.length === 0) return;
    if (imageMode) {
      onGenerateImage(trimmed);
    } else {
      onSend({ text: trimmed, images, files });
    }
    setText("");
    setImages([]);
    setFiles([]);
    setImageMode(false);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setTranscribing(true);
        try {
          const t = await transcribeAudio(blob);
          setText((prev) => (prev ? prev + " " + t : t));
          setTimeout(autoGrow, 30);
        } catch {
          toast.error("Transcription failed");
        } finally {
          setTranscribing(false);
        }
      };
      mediaRef.current = mr;
      mr.start();
      setRecording(true);
    } catch {
      toast.error("Microphone access denied");
    }
  };

  const stopRecording = () => {
    mediaRef.current?.stop();
    setRecording(false);
  };

  const hasAttachments = images.length > 0 || files.length > 0;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-6">
      {/* Attachment previews */}
      {hasAttachments && (
        <div className="flex flex-wrap gap-2 mb-2">
          {images.map((f, i) => (
            <div
              key={"img" + i}
              className="relative group rounded-xl overflow-hidden border border-white/10"
            >
              <img
                src={URL.createObjectURL(f)}
                alt={f.name}
                className="w-16 h-16 object-cover"
              />
              <button
                onClick={() => setImages(images.filter((_, j) => j !== i))}
                className="absolute top-1 right-1 p-0.5 rounded-full bg-black/70 opacity-0 group-hover:opacity-100 hover:bg-black transition-opacity"
                aria-label="Remove image"
              >
                <X size={10} strokeWidth={2} className="text-white" />
              </button>
            </div>
          ))}
          {files.map((f, i) => (
            <div
              key={"file" + i}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-[#ececf1]"
            >
              <Paperclip size={12} strokeWidth={1.5} className="text-violet-400" />
              <span className="max-w-[160px] truncate">{f.name}</span>
              <button
                onClick={() => setFiles(files.filter((_, j) => j !== i))}
                className="text-[#a1a1aa] hover:text-white"
                aria-label="Remove file"
              >
                <X size={12} strokeWidth={1.5} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div
        className={`relative rounded-3xl bg-[#18181B] border transition-colors ${
          imageMode
            ? "border-fuchsia-400/40 shadow-[0_0_28px_rgba(168,85,247,0.20)]"
            : "border-white/10 focus-within:border-violet-500/50 focus-within:shadow-[0_0_28px_rgba(124,58,237,0.25)]"
        }`}
      >
        <textarea
          ref={textareaRef}
          data-testid="chat-input"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            autoGrow();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={
            imageMode
              ? "Describe an image to generate..."
              : "Message KILASphere…"
          }
          rows={1}
          disabled={disabled}
          aria-label="Message KILASphere"
          className="w-full bg-transparent border-none text-white placeholder-[#71717a] focus:outline-none resize-none min-h-[56px] max-h-[220px] pt-4 pb-3 px-5 pr-14 text-[0.95rem]"
        />

        {/* Send */}
        <button
          data-testid="send-btn"
          onClick={handleSend}
          disabled={disabled}
          aria-label="Send message"
          className={`absolute right-2.5 bottom-2.5 w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
            disabled
              ? "bg-white/5 text-[#52525b]"
              : "bg-violet-600 text-white hover:bg-violet-500 hover:scale-[1.03] shadow-[0_0_20px_rgba(124,58,237,0.45)]"
          }`}
        >
          <Send size={16} strokeWidth={2} />
        </button>

        {/* Action toolbar */}
        <div className="flex items-center gap-1 px-3 pb-2.5 pt-0">
          <button
            data-testid="attach-image-btn"
            onClick={() => imageInputRef.current?.click()}
            title="Attach image"
            aria-label="Attach image"
            className="p-2 rounded-lg text-[#a1a1aa] hover:bg-white/5 hover:text-white transition-colors"
          >
            <ImagePlus size={16} strokeWidth={1.5} />
          </button>
          <input
            ref={imageInputRef}
            data-testid="image-file-input"
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              setImages([...images, ...Array.from(e.target.files || [])]);
              e.target.value = "";
            }}
          />

          {supportsFiles && (
            <>
              <button
                data-testid="attach-file-btn"
                onClick={() => fileInputRef.current?.click()}
                title="Attach file"
                aria-label="Attach file"
                className="p-2 rounded-lg text-[#a1a1aa] hover:bg-white/5 hover:text-white transition-colors"
              >
                <Paperclip size={16} strokeWidth={1.5} />
              </button>
              <input
                ref={fileInputRef}
                data-testid="doc-file-input"
                type="file"
                accept=".pdf,.txt,.csv,.md,.json,.docx"
                multiple
                hidden
                onChange={(e) => {
                  setFiles([...files, ...Array.from(e.target.files || [])]);
                  e.target.value = "";
                }}
              />
            </>
          )}

          <button
            data-testid="voice-btn"
            onClick={recording ? stopRecording : startRecording}
            title={recording ? "Stop recording" : "Voice input"}
            aria-label="Voice input"
            className={`p-2 rounded-lg transition-colors ${
              recording
                ? "bg-red-500/15 text-red-400"
                : "text-[#a1a1aa] hover:bg-white/5 hover:text-white"
            }`}
          >
            {recording ? (
              <Square size={14} strokeWidth={2.5} className="animate-pulse" />
            ) : (
              <Mic size={16} strokeWidth={1.5} />
            )}
          </button>

          <button
            data-testid="image-gen-btn"
            onClick={() => setImageMode((m) => !m)}
            title="Image generation mode"
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-medium transition-colors ${
              imageMode
                ? "bg-fuchsia-500/20 text-fuchsia-300"
                : "text-[#a1a1aa] hover:bg-white/5 hover:text-white"
            }`}
          >
            <Sparkles size={12} strokeWidth={1.5} /> Imagine
          </button>

          {supportsWeb && (
            <button
              data-testid="web-toggle-btn"
              onClick={onToggleWeb}
              title="Web search"
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-medium transition-colors ${
                useWeb
                  ? "bg-violet-500/15 text-violet-300"
                  : "text-[#a1a1aa] hover:bg-white/5 hover:text-white"
              }`}
            >
              <Globe size={12} strokeWidth={1.5} /> Web
            </button>
          )}

          <div className="ml-auto text-[11px] text-[#71717a] hidden sm:block">
            {transcribing ? (
              <span className="text-violet-300">Transcribing…</span>
            ) : recording ? (
              <span className="text-red-300">Recording…</span>
            ) : (
              <span>Shift + Enter for newline</span>
            )}
          </div>
        </div>
      </div>
      <div className="text-[11px] text-[#52525b] text-center mt-2">
        KILASphere can make mistakes. Verify important information.
      </div>
    </div>
  );
}
