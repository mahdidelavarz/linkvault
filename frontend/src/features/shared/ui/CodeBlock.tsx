'use client'

import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import type { CSSProperties } from 'react'

// ── Language grammars — only what we actually use ─────────────────────────────
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript'
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript'
import jsx        from 'react-syntax-highlighter/dist/esm/languages/prism/jsx'
import tsx        from 'react-syntax-highlighter/dist/esm/languages/prism/tsx'
import python     from 'react-syntax-highlighter/dist/esm/languages/prism/python'
import go         from 'react-syntax-highlighter/dist/esm/languages/prism/go'
import rust       from 'react-syntax-highlighter/dist/esm/languages/prism/rust'
import java       from 'react-syntax-highlighter/dist/esm/languages/prism/java'
import csharp     from 'react-syntax-highlighter/dist/esm/languages/prism/csharp'
import cpp        from 'react-syntax-highlighter/dist/esm/languages/prism/cpp'
import c          from 'react-syntax-highlighter/dist/esm/languages/prism/c'
import swift      from 'react-syntax-highlighter/dist/esm/languages/prism/swift'
import kotlin     from 'react-syntax-highlighter/dist/esm/languages/prism/kotlin'
import scala      from 'react-syntax-highlighter/dist/esm/languages/prism/scala'
import dart       from 'react-syntax-highlighter/dist/esm/languages/prism/dart'
import ruby       from 'react-syntax-highlighter/dist/esm/languages/prism/ruby'
import php        from 'react-syntax-highlighter/dist/esm/languages/prism/php'
import lua        from 'react-syntax-highlighter/dist/esm/languages/prism/lua'
import perl       from 'react-syntax-highlighter/dist/esm/languages/prism/perl'
import r          from 'react-syntax-highlighter/dist/esm/languages/prism/r'
import markup     from 'react-syntax-highlighter/dist/esm/languages/prism/markup'
import css        from 'react-syntax-highlighter/dist/esm/languages/prism/css'
import scss       from 'react-syntax-highlighter/dist/esm/languages/prism/scss'
import yaml       from 'react-syntax-highlighter/dist/esm/languages/prism/yaml'
import graphql    from 'react-syntax-highlighter/dist/esm/languages/prism/graphql'
import bash       from 'react-syntax-highlighter/dist/esm/languages/prism/bash'
import powershell from 'react-syntax-highlighter/dist/esm/languages/prism/powershell'
import batch      from 'react-syntax-highlighter/dist/esm/languages/prism/batch'
import markdown   from 'react-syntax-highlighter/dist/esm/languages/prism/markdown'
import sql        from 'react-syntax-highlighter/dist/esm/languages/prism/sql'
import plsql      from 'react-syntax-highlighter/dist/esm/languages/prism/plsql'
import json       from 'react-syntax-highlighter/dist/esm/languages/prism/json'
import regex      from 'react-syntax-highlighter/dist/esm/languages/prism/regex'
import hcl        from 'react-syntax-highlighter/dist/esm/languages/prism/hcl'
import docker     from 'react-syntax-highlighter/dist/esm/languages/prism/docker'
import protobuf   from 'react-syntax-highlighter/dist/esm/languages/prism/protobuf'

SyntaxHighlighter.registerLanguage('javascript', javascript)
SyntaxHighlighter.registerLanguage('typescript', typescript)
SyntaxHighlighter.registerLanguage('jsx',        jsx)
SyntaxHighlighter.registerLanguage('tsx',        tsx)
SyntaxHighlighter.registerLanguage('python',     python)
SyntaxHighlighter.registerLanguage('go',         go)
SyntaxHighlighter.registerLanguage('rust',       rust)
SyntaxHighlighter.registerLanguage('java',       java)
SyntaxHighlighter.registerLanguage('csharp',     csharp)
SyntaxHighlighter.registerLanguage('cpp',        cpp)
SyntaxHighlighter.registerLanguage('c',          c)
SyntaxHighlighter.registerLanguage('swift',      swift)
SyntaxHighlighter.registerLanguage('kotlin',     kotlin)
SyntaxHighlighter.registerLanguage('scala',      scala)
SyntaxHighlighter.registerLanguage('dart',       dart)
SyntaxHighlighter.registerLanguage('ruby',       ruby)
SyntaxHighlighter.registerLanguage('php',        php)
SyntaxHighlighter.registerLanguage('lua',        lua)
SyntaxHighlighter.registerLanguage('perl',       perl)
SyntaxHighlighter.registerLanguage('r',          r)
SyntaxHighlighter.registerLanguage('markup',     markup)
SyntaxHighlighter.registerLanguage('css',        css)
SyntaxHighlighter.registerLanguage('scss',       scss)
SyntaxHighlighter.registerLanguage('yaml',       yaml)
SyntaxHighlighter.registerLanguage('graphql',    graphql)
SyntaxHighlighter.registerLanguage('bash',       bash)
SyntaxHighlighter.registerLanguage('powershell', powershell)
SyntaxHighlighter.registerLanguage('batch',      batch)
SyntaxHighlighter.registerLanguage('markdown',   markdown)
SyntaxHighlighter.registerLanguage('sql',        sql)
SyntaxHighlighter.registerLanguage('plsql',      plsql)
SyntaxHighlighter.registerLanguage('json',       json)
SyntaxHighlighter.registerLanguage('regex',      regex)
SyntaxHighlighter.registerLanguage('hcl',        hcl)
SyntaxHighlighter.registerLanguage('docker',     docker)
SyntaxHighlighter.registerLanguage('protobuf',   protobuf)

// ── Map our language keys → Prism grammar names ───────────────────────────────
const LANG_MAP: Record<string, string> = {
  js:         'javascript',
  ts:         'typescript',
  jsx:        'jsx',
  tsx:        'tsx',
  py:         'python',
  go:         'go',
  rs:         'rust',
  java:       'java',
  cs:         'csharp',
  cpp:        'cpp',
  c:          'c',
  swift:      'swift',
  kt:         'kotlin',
  scala:      'scala',
  dart:       'dart',
  rb:         'ruby',
  php:        'php',
  lua:        'lua',
  pl:         'perl',
  r:          'r',
  html:       'markup',
  xml:        'markup',
  css:        'css',
  scss:       'scss',
  yaml:       'yaml',
  graphql:    'graphql',
  bash:       'bash',
  sh:         'bash',
  zsh:        'bash',
  curl:       'bash',
  ps1:        'powershell',
  powershell: 'powershell',
  cmd:        'batch',
  md:         'markdown',
  sql:        'sql',
  mysql:      'sql',
  pgsql:      'sql',
  plsql:      'plsql',
  json:       'json',
  regex:      'regex',
  tf:         'hcl',
  dockerfile: 'docker',
  proto:      'protobuf',
}

// ── Dark theme matching the app's slate/cyan palette ─────────────────────────
const THEME: Record<string, CSSProperties> = {
  'code[class*="language-"]': {
    color:       '#e2e8f0',
    background:  'none',
    fontFamily:  'inherit',
    fontSize:    'inherit',
    lineHeight:  'inherit',
    whiteSpace:  'pre',
    wordBreak:   'normal',
    wordSpacing: 'normal',
    wordWrap:    'normal',
    tabSize:     2,
    hyphens:     'none',
  },
  'pre[class*="language-"]': {
    color:       '#e2e8f0',
    background:  'none',
    fontFamily:  'inherit',
    fontSize:    'inherit',
    lineHeight:  'inherit',
    whiteSpace:  'pre',
    wordBreak:   'normal',
    wordSpacing: 'normal',
    wordWrap:    'normal',
    tabSize:     2,
    hyphens:     'none',
    margin:      0,
    padding:     0,
    // overflow controlled by className CSS, not inline style
  },
  comment:             { color: '#64748b', fontStyle: 'italic' },
  prolog:              { color: '#64748b' },
  doctype:             { color: '#64748b' },
  cdata:               { color: '#64748b' },
  punctuation:         { color: '#94a3b8' },
  namespace:           { opacity: 0.7 },
  property:            { color: '#93c5fd' },
  tag:                 { color: '#f87171' },
  constant:            { color: '#fb923c' },
  symbol:              { color: '#f472b6' },
  deleted:             { color: '#f87171' },
  boolean:             { color: '#fb923c' },
  number:              { color: '#fbbf24' },
  selector:            { color: '#a3e635' },
  'attr-name':         { color: '#fcd34d' },
  string:              { color: '#86efac' },
  char:                { color: '#86efac' },
  builtin:             { color: '#c084fc' },
  inserted:            { color: '#86efac' },
  operator:            { color: '#94a3b8' },
  entity:              { color: '#86efac', cursor: 'help' },
  url:                 { color: '#67e8f9' },
  variable:            { color: '#e2e8f0' },
  atrule:              { color: '#67e8f9' },
  'attr-value':        { color: '#86efac' },
  function:            { color: '#60a5fa' },
  'class-name':        { color: '#fcd34d' },
  keyword:             { color: '#67e8f9' },
  regex:               { color: '#f472b6' },
  important:           { color: '#fb923c', fontWeight: 'bold' },
  bold:                { fontWeight: 'bold' },
  italic:              { fontStyle: 'italic' },
  'maybe-class-name':  { color: '#fcd34d' },
  'literal-property':  { color: '#93c5fd' },
  parameter:           { color: '#e2e8f0' },
  decorator:           { color: '#f472b6' },
}

// ── Component ─────────────────────────────────────────────────────────────────

interface CodeBlockProps {
  code:         string
  language:     string
  className?:   string
  customStyle?: CSSProperties
}

export default function CodeBlock({ code, language, className, customStyle }: CodeBlockProps) {
  const prismLang = LANG_MAP[language] ?? language

  return (
    <SyntaxHighlighter
      language={prismLang}
      style={THEME as any}
      PreTag="pre"
      className={className}
      customStyle={{
        margin:     0,
        padding:    '12px 14px',
        background: 'transparent',
        fontSize:   'var(--text-xs)',
        fontFamily: 'var(--font-mono)',
        lineHeight: 'var(--leading-relaxed)',
        ...customStyle,
      }}
      codeTagProps={{
        style: { fontFamily: 'inherit', fontSize: 'inherit', lineHeight: 'inherit' },
      }}
    >
      {code}
    </SyntaxHighlighter>
  )
}
