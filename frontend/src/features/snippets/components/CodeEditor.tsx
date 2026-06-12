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

interface CodeEditorProps {
  value: string;
  onChange: (value: string, language?: string) => void;
  language?: string;
  readOnly?: boolean;
  height?: string;
  className?: string;
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
}: CodeEditorProps) {
  const [detectedLang, setDetectedLang] = useState(language);

  // Keep internal language in sync when the parent changes the language prop
  useEffect(() => { setDetectedLang(language); }, [language]);

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
    <div className={className}>
      <CodeMirror
        value={value}
        height={height}
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
  );
}