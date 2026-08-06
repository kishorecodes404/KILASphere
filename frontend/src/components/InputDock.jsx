import { useRef, useState } from "react";
import {
  Send,
  Paperclip,
  ImagePlus,
  Mic,
  MicOff,
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
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  };

  const handleSend = async () => {
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
          autoGrow();
        } catch (e) {
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

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-6">
      {/* Attachment previews */}
      {(images.length > 0 || files.length > 0) && (
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
              >
                <X size={10} strokeWidth={2} className="text-white" />
              </button>
            </div>
          ))}
          {files.map((f, i) => (
            <div
              key={"file" + i}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#14141E] border border-white/10 text-xs text-[#a1a1aa]"
            >
              <Paperclip size={12} strokeWidth={1.5} />
              <span className="max-w-[160px] truncate">{f.name}</span>
              <button
                onClick={() => setFiles(files.filter((_, j) => j !== i))}
                className="hover:text-white"
              >
                <X size={12} strokeWidth={1.5} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="relative rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 focus-within:border-cyan-400/40 focus-within:shadow-[0_0_28px_rgba(0,229,255,0.15)] transition-colors">
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
              : "Ask KILASphere anything — chat, code, images, files..."
          }
          rows={1}
          disabled={disabled}
          className="w-full bg-transparent border-none text-white placeholder-[#52525B] focus:outline-none resize-none min-h-[52px] max-h-[200px] py-4 px-5 pr-16 text-[0.95rem]"
        />

        {/* Send */}
        <button
          data-testid="send-btn"
          onClick={handleSend}
          disabled={disabled}
          className={`absolute right-2 bottom-2 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            disabled
              ? "bg-white/5 text-[#52525B]"
              : "bg-cyan-400 text-black hover:bg-cyan-300 glow-cyan"
          }`}
        >
          <Send size={16} strokeWidth={2} />
        </button>

        {/* Action toolbar */}
        <div className="flex items-center gap-1 px-3 pb-2">
          <button
            data-testid="attach-image-btn"
            onClick={() => imageInputRef.current?.click()}
            title="Attach image (vision)"
            className="p-2 rounded-full text-[#a1a1aa] hover:bg-white/5 hover:text-white transition-colors"
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
                title="Attach file (PDF, txt, csv...)"
                className="p-2 rounded-full text-[#a1a1aa] hover:bg-white/5 hover:text-white transition-colors"
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
            className={`p-2 rounded-full transition-colors ${
              recording
                ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                : "text-[#a1a1aa] hover:bg-white/5 hover:text-white"
            }`}
          >
            {recording ? (
              <Square size={14} strokeWidth={2} className="animate-pulse" />
            ) : transcribing ? (
              <MicOff size={16} strokeWidth={1.5} />
            ) : (
              <Mic size={16} strokeWidth={1.5} />
            )}
          </button>

          <button
            data-testid="image-gen-btn"
            onClick={() => setImageMode((m) => !m)}
            title="Image generation mode"
            className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-medium transition-colors ${
              imageMode
                ? "bg-orange-500/20 text-orange-300"
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
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-medium transition-colors ${
                useWeb
                  ? "bg-cyan-400/15 text-cyan-300"
                  : "text-[#a1a1aa] hover:bg-white/5 hover:text-white"
              }`}
            >
              <Globe size={12} strokeWidth={1.5} /> Web
            </button>
          )}

          <div className="ml-auto text-[10px] uppercase tracking-widest text-[#52525B]">
            {transcribing ? "Transcribing…" : "Shift+Enter = newline"}
          </div>
        </div>
      </div>
    </div>
  );
}
