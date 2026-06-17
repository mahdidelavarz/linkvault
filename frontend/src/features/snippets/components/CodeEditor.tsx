'use client';

import { useCallback, useEffect, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { sql } from '@codemirror/lang-sql';
import { java } from '@codemirror/lang-java';
import { rust } from '@codemirror/lang-rust';
import { cpp } from '@codemirror/lang-cpp';
import { php } from '@codemirror/lang-php';
import { xml } from '@codemirror/lang-xml';
import { StreamLanguage } from '@codemirror/language';
import { yaml as yamlMode } from '@codemirror/legacy-modes/mode/yaml';
import { shell as shellMode } from '@codemirror/legacy-modes/mode/shell';
import { dockerFile as dockerFileMode } from '@codemirror/legacy-modes/mode/dockerfile';
import { oneDark } from '@codemirror/theme-one-dark';
import { detectLanguage } from '@/features/snippets/utils/languageDetector';
import { LucideMaximize2, LucideMinimize2 } from '@/Icons/Icons';

interface CodeEditorProps {
  value: string;
  onChange: (value: string, language?: string) => void;
  language?: string;
  readOnly?: boolean;
  height?: string;
  className?: string;
  /** Show a button to expand the editor to a full-screen overlay */
  allowFullscreen?: boolean;
}

const languageExtensions: Record<string, any> = {
  js: javascript(),
  jsx: javascript({ jsx: true }),
  ts: javascript({ typescript: true }),
  tsx: javascript({ jsx: true, typescript: true }),
  py: python(),
  html: html(),
  css: css(),
  json: json(),
  md: markdown(),
  sql: sql(),
  java: java(),
  rs: rust(),
  cpp: cpp(),
  c: cpp(),
  php: php(),
  xml: xml(),
  yaml: StreamLanguage.define(yamlMode),
  yml: StreamLanguage.define(yamlMode),
  bash: StreamLanguage.define(shellMode),
  sh: StreamLanguage.define(shellMode),
  zsh: StreamLanguage.define(shellMode),
  ps1: StreamLanguage.define(shellMode),
  dockerfile: StreamLanguage.define(dockerFileMode),
};

export default function CodeEditor({
  value,
  onChange,
  language = 'txt',
  readOnly = false,
  height = '400px',
  className = 'border rounded-lg overflow-hidden',
  allowFullscreen = false,
}: CodeEditorProps) {
  const [detectedLang, setDetectedLang] = useState(language);
  const [isFull, setIsFull] = useState(false);

  // Keep internal language in sync when the parent changes the language prop
  useEffect(() => { setDetectedLang(language); }, [language]);

  // Esc to exit fullscreen + lock body scroll while expanded
  useEffect(() => {
    if (!isFull) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsFull(false); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [isFull]);

  const handleChange = useCallback((val: string) => {
    // Only run internal auto-detect when no explicit language is set
    let effective = language;
    if (!language || language === 'txt') {
      const detected = detectLanguage(val);
      if (detected !== detectedLang && val.trim().length > 10) {
        setDetectedLang(detected);
        effective = detected;
      }
    }
    onChange(val, effective);
  }, [onChange, detectedLang, language]);

  const extension = languageExtensions[detectedLang];

  return (
    <>
      <style>{CSS}</style>
      <div
        className={[
          'code-editor',
          isFull ? 'code-editor--full' : '',
          className,
        ].filter(Boolean).join(' ')}
      >
        {isFull && (
          <div className="code-editor-bar">
            <span className="code-editor-bar-lang">{detectedLang}</span>
            <button
              type="button"
              className="code-editor-fs-btn code-editor-fs-btn--bar"
              onClick={() => setIsFull(false)}
              title="Exit full screen (Esc)"
              aria-label="Exit full screen"
            >
              <LucideMinimize2 width={15} />
              Exit
            </button>
          </div>
        )}

        <div className="code-editor-scroll">
          <CodeMirror
            value={value}
            height={isFull ? 'calc(100dvh - 44px)' : height}
            theme={oneDark}
            extensions={extension ? [extension] : []}
            onChange={handleChange}
            readOnly={readOnly}
            basicSetup={{
              lineNumbers: true,
              highlightActiveLine: true,
              highlightSelectionMatches: true,
              autocompletion: true,
              foldGutter: true,
              bracketMatching: true,
              closeBrackets: true,
              indentOnInput: true,
              tabSize: 2,
            }}
            className="text-sm"
          />
        </div>

        {allowFullscreen && !isFull && (
          <button
            type="button"
            className="code-editor-fs-btn code-editor-fs-btn--float"
            onClick={() => setIsFull(true)}
            title="Expand to full screen"
            aria-label="Expand editor to full screen"
          >
            <LucideMaximize2 width={15} />
          </button>
        )}
      </div>
    </>
  );
}

const CSS = `
.code-editor { position: relative; }

.code-editor--full {
  position:       fixed;
  inset:          0;
  z-index:        var(--z-modal, 400);
  display:        flex;
  flex-direction: column;
  background:     var(--bg-base);
  border:         none !important;
  border-radius:  0 !important;
  animation:      fadeIn var(--transition-base) ease both;
  padding-bottom: env(safe-area-inset-bottom);
}
.code-editor--full .code-editor-scroll { flex: 1; min-height: 0; overflow: auto; }

/* Top bar shown only in fullscreen */
.code-editor-bar {
  display:         flex;
  align-items:     center;
  justify-content: space-between;
  gap:             12px;
  height:          44px;
  padding:         0 12px;
  background:      var(--bg-elevated);
  border-bottom:   1px solid var(--border-default);
  flex-shrink:     0;
}
.code-editor-bar-lang {
  font-family:    var(--font-mono);
  font-size:      var(--text-xs);
  color:          var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.code-editor-fs-btn {
  display:       inline-flex;
  align-items:   center;
  gap:           6px;
  border:        1px solid var(--border-default);
  border-radius: var(--radius-sm);
  background:    var(--bg-overlay);
  color:         var(--text-secondary);
  font-family:   var(--font-sans);
  font-size:     var(--text-xs);
  font-weight:   500;
  cursor:        pointer;
  transition:    background var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
}
.code-editor-fs-btn:hover { background: var(--bg-subtle); color: var(--text-primary); border-color: var(--border-strong); }

/* Floating expand button, top-right of the inline editor */
.code-editor-fs-btn--float {
  position:    absolute;
  top:         8px;
  right:       8px;
  z-index:     5;
  width:       30px;
  height:      30px;
  padding:     0;
  justify-content: center;
  background:  color-mix(in srgb, var(--bg-elevated) 80%, transparent);
  backdrop-filter: blur(4px);
  opacity:     0.85;
}
.code-editor-fs-btn--float:hover { opacity: 1; }

/* Exit button in the fullscreen bar */
.code-editor-fs-btn--bar { height: 30px; padding: 0 12px; }
`;