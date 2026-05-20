import { TYPE_LANGUAGES } from '@/types/snippet';

// Comprehensive language detection map
const LANGUAGES: Record<string, string> = {
  js: 'JavaScript',
  jsx: 'React JSX',
  ts: 'TypeScript',
  tsx: 'React TSX',
  py: 'Python',
  rb: 'Ruby',
  java: 'Java',
  go: 'Go',
  rs: 'Rust',
  php: 'PHP',
  cs: 'C#',
  cpp: 'C++',
  c: 'C',
  swift: 'Swift',
  kt: 'Kotlin',
  scala: 'Scala',
  sql: 'SQL',
  sh: 'Shell/Bash',
  bash: 'Bash',
  zsh: 'Zsh',
  ps1: 'PowerShell',
  powershell: 'PowerShell',
  dockerfile: 'Docker',
  yaml: 'YAML',
  yml: 'YAML',
  json: 'JSON',
  xml: 'XML',
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  md: 'Markdown',
  graphql: 'GraphQL',
  proto: 'Protobuf',
  tf: 'Terraform',
  hcl: 'HCL',
  nginx: 'Nginx',
  env: 'Environment',
  txt: 'Plain Text',
  regex: 'Regex',
  curl: 'cURL',
};

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

  // Check for command patterns (shell/CLI commands)
  const commandPatterns = [
    /^(npm|yarn|pnpm|npx)\s/,
    /^(docker|docker-compose)\s/,
    /^(git|gh)\s/,
    /^(kubectl|k|helm)\s/,
    /^(terraform|terragrunt)\s/,
    /^(aws|gcloud|az)\s/,
    /^(systemctl|service)\s/,
    /^(sudo|su)\s/,
    /^(apt|apt-get|yum|brew|choco|pip|pip3|cargo|gem|composer)\s/,
    /^(node|python|ruby|php|java|go|rustc|cargo)\s/,
    /^(curl|wget)\s/,
    /^(chmod|chown|ln|mkdir|touch|cat|tail|head|less|grep|find|which|echo|export|source)\s/,
    /^\$\s/, // $ prompt
    /^>\s/, // > prompt (PowerShell/CMD)
    /^#\s/,  // # prompt (root)
  ];

  // If any command pattern matches, it's likely a shell command
  for (const pattern of commandPatterns) {
    if (pattern.test(trimmedCode)) {
      return 'bash';
    }
  }

  // Check for common patterns in other languages
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
    regex: [/^\/.+\/[gimsuyd]*$/, /^\^/, /\$$/],
    curl: [/^curl\s/i],
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
    zsh: '💻',
    ps1: '🖥️',
    powershell: '🖥️',
    md: '📝',
    graphql: '◈',
    txt: '📄',
    regex: '📝',
    curl: '🌐',
  };
  return icons[lang] || '📄';
}