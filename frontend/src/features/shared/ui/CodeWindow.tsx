"use client";

import { type ReactNode, type KeyboardEvent } from "react";
import CodeBlock from "@/features/shared/ui/CodeBlock";

interface CodeWindowProps {
  code: string;
  language: string;
  /** Filename shown in the title bar, e.g. "query.sql" */
  filename: string;
  /** Show the language pill on the right of the title bar (default true) */
  showLangPill?: boolean;
  /** Extra nodes on the right of the title bar (e.g. a copy button) */
  headerActions?: ReactNode;
  /** Max height of the scrollable code area (default 180px) */
  maxHeight?: string;
  /** Make the whole window act like a button (used in cards) */
  interactive?: boolean;
  onActivate?: () => void;
  className?: string;
}

/**
 * Terminal-style code window: macOS traffic-light dots, a filename, an optional
 * language pill, and a syntax-highlighted body. Theme-aware via the --code-*
 * CSS variables, so it is dark in dark mode and white in light mode.
 *
 * Shared between SnippetCard and the snippet detail page so both render the
 * exact same chrome.
 */
export default function CodeWindow({
  code,
  language,
  filename,
  showLangPill = true,
  headerActions,
  maxHeight = "180px",
  interactive = false,
  onActivate,
  className = "",
}: CodeWindowProps) {
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!interactive || !onActivate) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onActivate();
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div
        className={["cw", interactive ? "cw--interactive" : "", className].filter(Boolean).join(" ")}
        role={interactive ? "button" : undefined}
        tabIndex={interactive ? 0 : undefined}
        onClick={interactive ? onActivate : undefined}
        onKeyDown={onKeyDown}
      >
        <div className="cw-header">
          <div className="cw-dots" aria-hidden="true">
            <span className="cw-dot cw-dot--r" />
            <span className="cw-dot cw-dot--y" />
            <span className="cw-dot cw-dot--g" />
          </div>
          <span className="cw-filename">{filename}</span>
          {showLangPill && <span className="cw-lang-pill">{language}</span>}
          {headerActions && (
            <div className="cw-actions" onClick={(e) => e.stopPropagation()}>
              {headerActions}
            </div>
          )}
        </div>

        <div className="cw-body" style={{ maxHeight }}>
          <CodeBlock code={code} language={language} className="cw-code" />
        </div>
      </div>
    </>
  );
}

const CSS = `
.cw {
  position:      relative;
  background:    var(--code-bg);
  border:        1px solid var(--code-border);
  border-radius: var(--radius-md);
  overflow:      hidden;
  min-width:     0;
  width:         100%;
  box-sizing:    border-box;
  transition:    border-color var(--transition-fast);
}
.cw--interactive { cursor: pointer; }
.cw--interactive:hover { border-color: var(--code-border-hover); }

.cw-header {
  display:       flex;
  align-items:   center;
  gap:           8px;
  padding:       7px 10px;
  background:    var(--code-header-bg);
  border-bottom: 1px solid var(--code-header-border);
  min-width:     0;
}

.cw-dots { display: flex; align-items: center; gap: 5px; flex-shrink: 0; }
.cw-dot  { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.cw-dot--r { background: #ff5f57; }
.cw-dot--y { background: #febc2e; }
.cw-dot--g { background: #28c840; }

.cw-filename {
  flex:          1;
  font-size:     11px;
  font-family:   var(--font-mono);
  color:         var(--code-filename);
  overflow:      hidden;
  text-overflow: ellipsis;
  white-space:   nowrap;
  min-width:     0;
}

.cw-lang-pill {
  flex-shrink:    0;
  font-size:      10px;
  font-family:    var(--font-mono);
  font-weight:    600;
  color:          var(--accent);
  background:     var(--accent-subtle);
  padding:        1px 7px;
  border-radius:  var(--radius-sm);
  border:         1px solid var(--accent-border);
  letter-spacing: 0.03em;
  text-transform: lowercase;
}

.cw-actions { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }

.cw-body {
  overflow-x: auto;
  overflow-y: auto;
}
.cw-body::-webkit-scrollbar       { height: 6px; width: 6px; }
.cw-body::-webkit-scrollbar-thumb { background: var(--code-scrollbar); border-radius: 99px; }
.cw-body::-webkit-scrollbar-track { background: transparent; }

.cw-code {
  display:     block;
  margin:      0;
  font-family: var(--font-mono);
  font-size:   var(--text-xs);
  line-height: var(--leading-relaxed);
  white-space: pre;
  background:  transparent !important;
}
`;
