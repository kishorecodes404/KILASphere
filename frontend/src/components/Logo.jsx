import { Link } from "react-router-dom";

export default function Logo({ to = "/", size = "md", showText = true }) {
  const sizes = {
    sm: { mark: "w-6 h-6", text: "text-sm" },
    md: { mark: "w-8 h-8", text: "text-base" },
    lg: { mark: "w-10 h-10", text: "text-lg" },
  };
  const s = sizes[size] || sizes.md;
  const content = (
    <div className="flex items-center gap-2.5" data-testid="brand-logo">
      <div className={`kila-mark ${s.mark}`} />
      {showText && (
        <div className={`font-display font-semibold ${s.text} tracking-tight`}>
          KILA<span className="text-cyan-400">Sphere</span>
        </div>
      )}
    </div>
  );
  return to ? <Link to={to}>{content}</Link> : content;
}
