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

// ── Theme-aware palette — colors come from CSS variables (--ct-*) that flip
//    between dark defaults and a GitHub-light palette under [data-theme="light"]. ─
const THEME: Record<string, CSSProperties> = {
  'code[class*="language-"]': {
    color:       'var(--ct-fg)',
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
    color:       'var(--ct-fg)',
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
  comment:             { color: 'var(--ct-comment)', fontStyle: 'italic' },
  prolog:              { color: 'var(--ct-comment)' },
  doctype:             { color: 'var(--ct-comment)' },
  cdata:               { color: 'var(--ct-comment)' },
  punctuation:         { color: 'var(--ct-punctuation)' },
  namespace:           { opacity: 0.7 },
  property:            { color: 'var(--ct-property)' },
  tag:                 { color: 'var(--ct-tag)' },
  constant:            { color: 'var(--ct-constant)' },
  symbol:              { color: 'var(--ct-symbol)' },
  deleted:             { color: 'var(--ct-tag)' },
  boolean:             { color: 'var(--ct-constant)' },
  number:              { color: 'var(--ct-number)' },
  selector:            { color: 'var(--ct-selector)' },
  'attr-name':         { color: 'var(--ct-class)' },
  string:              { color: 'var(--ct-string)' },
  char:                { color: 'var(--ct-string)' },
  builtin:             { color: 'var(--ct-builtin)' },
  inserted:            { color: 'var(--ct-string)' },
  operator:            { color: 'var(--ct-punctuation)' },
  entity:              { color: 'var(--ct-string)', cursor: 'help' },
  url:                 { color: 'var(--ct-url)' },
  variable:            { color: 'var(--ct-fg)' },
  atrule:              { color: 'var(--ct-url)' },
  'attr-value':        { color: 'var(--ct-string)' },
  function:            { color: 'var(--ct-function)' },
  'class-name':        { color: 'var(--ct-class)' },
  keyword:             { color: 'var(--ct-keyword)' },
  regex:               { color: 'var(--ct-symbol)' },
  important:           { color: 'var(--ct-constant)', fontWeight: 'bold' },
  bold:                { fontWeight: 'bold' },
  italic:              { fontStyle: 'italic' },
  'maybe-class-name':  { color: 'var(--ct-class)' },
  'literal-property':  { color: 'var(--ct-property)' },
  parameter:           { color: 'var(--ct-fg)' },
  decorator:           { color: 'var(--ct-symbol)' },
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
        border: 'none',
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
