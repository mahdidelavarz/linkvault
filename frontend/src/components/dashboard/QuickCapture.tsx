"use client";

import { useState } from "react";
import Link from "next/link";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import LinkForm from "@/components/links/LinkForm";
import SnippetForm from "@/components/snippets/SnippetForm";
import { detectLanguage, detectSnippetType } from "@/lib/languageDetector";
import { type SnippetType } from "@/types/snippet";
import {
  LucideSparkles,
  LucideClipboardCheck,
  LucideFolder,
  LucideTag,
  LucideArrowRight,
} from "@/Icons/Icons";

type Capture =
  | { kind: "link"; url: string }
  | { kind: "snippet"; content: string; language: string; snippetType: SnippetType }
  | null;

function isUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export default function QuickCapture() {
  const [text, setText] = useState("");
  const [hint, setHint] = useState<string | null>(null);
  const [capture, setCapture] = useState<Capture>(null);

  const handleCheckClipboard = async () => {
    setHint(null);
    try {
      const clip = (await navigator.clipboard.readText()).trim();
      if (clip) setText(clip);
      else setHint("Clipboard is empty.");
    } catch {
      setHint("Couldn't read clipboard — paste manually instead.");
    }
  };

  const handleCapture = () => {
    const value = text.trim();
    if (!value) {
      setHint("Paste a URL or some code first.");
      return;
    }
    if (isUrl(value)) {
      setCapture({ kind: "link", url: value });
    } else {
      setCapture({
        kind: "snippet",
        content: value,
        language: detectLanguage(value),
        snippetType: (detectSnippetType(value) as SnippetType | null) ?? "code",
      });
    }
  };

  const handleClose = () => {
    setCapture(null);
    setText("");
    setHint(null);
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="qc-section dp-quick-section dp-card">
        <div className="dp-card-header">
          <LucideSparkles width={14} className="dp-card-header-icon" />
          <h2 className="dp-card-title">Quick capture</h2>
        </div>

        <div className="qc-body">
          <textarea
            className="qc-textarea"
            placeholder="Paste a URL or a code snippet…"
            value={text}
            onChange={(e) => { setText(e.target.value); setHint(null); }}
            rows={4}
          />
          {hint && <p className="qc-hint">{hint}</p>}
          <div className="qc-actions">
            <Button type="button" variant="secondary" size="sm" leftIcon={LucideClipboardCheck} onClick={handleCheckClipboard}>
              Check clipboard
            </Button>
            <Button type="button" size="sm" disabled={!text.trim()} onClick={handleCapture}>
              Capture
            </Button>
          </div>
        </div>

        <div className="dp-nav-links">
          {[
            { label: "Categories", href: "/categories", icon: LucideFolder },
            { label: "Tags",       href: "/tags",       icon: LucideTag   },
          ].map((n) => (
            <Link key={n.href} href={n.href} className="dp-nav-link">
              <n.icon width={13} />
              {n.label}
              <LucideArrowRight width={11} className="dp-nav-arrow" />
            </Link>
          ))}
        </div>
      </div>

      <Modal isOpen={capture?.kind === "link"} onClose={handleClose} title="Add Link" size="lg">
        {capture?.kind === "link" && <LinkForm initialUrl={capture.url} onClose={handleClose} />}
      </Modal>

      <Modal isOpen={capture?.kind === "snippet"} onClose={handleClose} title="Add Snippet" size="lg">
        {capture?.kind === "snippet" && (
          <SnippetForm
            initialValues={{ content: capture.content, language: capture.language, snippetType: capture.snippetType }}
            onClose={handleClose}
          />
        )}
      </Modal>
    </>
  );
}

const CSS = `
.qc-body {
  display:        flex;
  flex-direction: column;
  gap:            10px;
  padding:        12px;
}
.qc-textarea {
  width:         100%;
  resize:        vertical;
  min-height:    84px;
  padding:       10px 12px;
  background:    var(--bg-subtle);
  border:        1px solid var(--border-default);
  border-radius: var(--radius-md);
  color:         var(--text-primary);
  font-family:   var(--font-sans);
  font-size:     var(--text-sm);
  line-height:   1.5;
  transition:    border-color var(--transition-fast);
}
.qc-textarea::placeholder { color: var(--text-tertiary); }
.qc-textarea:focus {
  outline:      none;
  border-color: var(--border-focus);
}
.qc-hint { font-size: var(--text-xs); color: var(--text-tertiary); margin: 0; }
.qc-actions {
  display:         flex;
  align-items:     center;
  justify-content: flex-end;
  gap:             8px;
}
@media (max-width: 479px) {
  .qc-actions { flex-direction: column-reverse; align-items: stretch; }
}
`;
