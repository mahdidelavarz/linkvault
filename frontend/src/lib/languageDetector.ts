import { LANGUAGES } from '@/types/snippet';

export function detectLanguage(code: string): string {
  // Remove empty lines and trim
  const trimmedCode = code.trim();

  // Check for shebang
  if (trimmedCode.startsWith('#!/bin/bash') || trimmedCode.startsWith('#!/bin/sh')) {
    return 'bash';
  }
  if (trimmedCode.startsWith('#!/usr/bin/env python')) {
    return 'py';
  }
  if (trimmedCode.startsWith('#!/usr/bin/env node')) {
    return 'js';
  }

  // Check for common patterns
  const patterns: Record<string, RegExp[]> = {
    dockerfile: [/^(FROM|RUN|CMD|EXPOSE|ENV|COPY|ADD|WORKDIR|ENTRYPOINT|VOLUME)\s/m],
    sql: [/^(SELECT|INSERT|UPDATE|DELETE|CREATE TABLE|ALTER TABLE|DROP TABLE)\s/i, /^\s*--/m],
    html: [/<\/?[a-z][\s\S]*>/i, /<!DOCTYPE html>/i],
    jsx: [/import\s+React\s/, /<\/[A-Z][a-zA-Z]*>/, /className=/],
    tsx: [/import\s+React\s/, /<\/[A-Z][a-zA-Z]*>/, /:\s*JSX\.Element/, /interface\s+\w+\s*\{/],
    ts: [/interface\s+\w+\s*\{/, /type\s+\w+\s*=/, /:\s*(string|number|boolean)\[/],
    js: [/const\s+\w+\s*=\s*\(?\s*function/, /export\s+(default\s+)?(function|class)/, /require\(/],
    py: [/^(def|class|import|from|if __name__)/m, /print\s*\(/],
    java: [/public\s+class/, /System\.out\./],
    go: [/package\s+main/, /func\s+main/],
    php: [/<\?php/, /\$\w+\s*=/],
    rb: [/def\s+\w+/, /end$/m, /puts\s/],
    yaml: [/^[\w-]+:\s/m, /^\s{2}\w+:\s/m],
    json: [/^\s*\{/, /^\s*\[/],
    css: [/[@#.]\w+\s*\{/, /font-size:|margin:|padding:|color:/],
    graphql: [/^(query|mutation|subscription)\s/, /type\s+\w+\s*\{/],
    powershell: [/^(Get-|Set-|New-|Write-|Out-)\w+/, /\$\w+/],
    bash: [/^(echo|cd|ls|mkdir|rm|cp|mv|chmod|grep|awk|sed|export)\s/m, /^\s*#!\//],
  };

  let bestMatch = 'txt';
  let bestScore = 0;

  for (const [lang, tests] of Object.entries(patterns)) {
    let score = 0;
    for (const test of tests) {
      if (test.test(trimmedCode)) {
        score++;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = lang;
    }
  }

  return bestMatch;
}

export function getLanguageName(lang: string): string {
  return LANGUAGES[lang] || lang.toUpperCase();
}

export function getLanguageIcon(lang: string): string {
  const icons: Record<string, string> = {
    js: '📒',
    jsx: '⚛️',
    ts: '📘',
    tsx: '⚛️',
    py: '🐍',
    rb: '💎',
    java: '☕',
    go: '🔵',
    rs: '🦀',
    php: '🐘',
    dockerfile: '🐳',
    sql: '🗄️',
    html: '🌐',
    css: '🎨',
    json: '📋',
    yaml: '⚙️',
    bash: '💻',
    sh: '💻',
    ps1: '🖥️',
    md: '📝',
    graphql: '◈',
    txt: '📄',
  };
  return icons[lang] || '📄';
}