import { useState } from "react";
import { LucideCheck, LucideCopy } from "@/Icons/Icons";

interface CopyButtonProps {
  text: string;
  label?: string;
  size?: "sm" | "md";
  className?: string;
}

/**
 * Copy-to-clipboard with transient "Copied!" feedback.
 * Used in SnippetCard, PromptCard, InfraCard.
 */
export default function CopyButton({ text, label, size = "md", className = "" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* silently fail */ }
  };

  const iconSize = size === "sm" ? 13 : 15;

  return (
    <>
      <style>{CSS}</style>
      <button
        className={`copy-btn copy-btn--${size} ${copied ? "copy-btn--copied" : ""} ${className}`.trim()}
        onClick={handleCopy}
        aria-label={copied ? "Copied!" : "Copy to clipboard"}
        type="button"
      >
        {copied ? <LucideCheck width={iconSize} /> : <LucideCopy width={iconSize} />}
        {label && <span>{copied ? "Copied!" : label}</span>}
      </button>
    </>
  );
}

const CSS = `
.copy-btn {
  display:       flex;
  align-items:   center;
  gap:           5px;
  border:        1px solid var(--border-default);
  border-radius: var(--radius-md);
  background:    var(--bg-subtle);
  color:         var(--text-secondary);
  cursor:        pointer;
  font-family:   var(--font-sans);
  font-size:     var(--text-xs);
  font-weight:   500;
  white-space:   nowrap;
  transition:    background var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
}
.copy-btn--sm { height: 28px; padding: 0 10px; }
.copy-btn--md { height: 34px; padding: 0 14px; }
.copy-btn:hover { background: var(--bg-overlay); border-color: var(--border-strong); color: var(--text-primary); }
.copy-btn--copied { color: var(--success); border-color: var(--success-border, var(--success)); background: var(--success-muted, var(--bg-overlay)); }
`;
