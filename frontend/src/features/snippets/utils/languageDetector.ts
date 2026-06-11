import { TYPE_LANGUAGES } from '@/features/snippets/types/snippet';

export const LANGUAGE_NAMES: Record<string, string> = {
  js: 'JavaScript', jsx: 'React JSX', ts: 'TypeScript', tsx: 'React TSX',
  py: 'Python', rb: 'Ruby', java: 'Java', go: 'Go', rs: 'Rust',
  php: 'PHP', cs: 'C#', cpp: 'C++', c: 'C', swift: 'Swift',
  kt: 'Kotlin', scala: 'Scala', dart: 'Dart', lua: 'Lua', r: 'R', pl: 'Perl',
  sql: 'SQL', mysql: 'MySQL', pgsql: 'PostgreSQL', plsql: 'PL/SQL',
  sh: 'Shell', bash: 'Bash', zsh: 'Zsh', cmd: 'CMD',
  ps1: 'PowerShell', powershell: 'PowerShell',
  dockerfile: 'Dockerfile', yaml: 'YAML', yml: 'YAML',
  json: 'JSON', xml: 'XML', html: 'HTML', css: 'CSS', scss: 'SCSS',
  md: 'Markdown', graphql: 'GraphQL', proto: 'Protobuf',
  tf: 'Terraform', hcl: 'HCL', nginx: 'Nginx', env: 'Env',
  txt: 'Plain Text', regex: 'Regex', curl: 'cURL',
};

// ─── Weighted patterns ────────────────────────────────────────────────────────
// Each entry: [pattern, weight]. Higher weight = stronger signal.

type PatternList = [RegExp, number][];

const PATTERNS: Record<string, PatternList> = {

  // ── Web / JS ecosystem ────────────────────────────────────────────────────

  tsx: [
    [/import\s+React/,                                 3],
    [/<[A-Z][A-Za-z]+[\s/>]/,                          4],  // <Component
    [/:\s*JSX\.Element/,                               5],
    [/:\s*React\.FC/,                                  5],
    [/:\s*ReactNode/,                                  4],
    [/useState\s*</,                                   3],
    [/interface\s+\w+\s*(Props|State)\s*\{/,           4],
    [/className=/,                                     2],
    [/\.tsx(['"]|$)/,                                  5],
    [/(public|private)\s+\w+\s*:/,                     2],  // typed class member
  ],

  jsx: [
    [/import\s+React/,                                 3],
    [/<[A-Z][A-Za-z]+[\s/>]/,                          4],  // <Component — strong signal
    [/className=/,                                     3],
    [/useState\s*\(/,                                  4],
    [/useEffect\s*\(/,                                 4],
    [/useRef\s*\(/,                                    3],
    [/useCallback\s*\(/,                               3],
    [/useMemo\s*\(/,                                   3],
    [/useContext\s*\(/,                                3],
    [/props\.\w+/,                                     2],
    [/export\s+default\s+function\s+[A-Z]/,            4],
    [/return\s*\(\s*</,                                4],   // return (<
    [/return\s+<[a-zA-Z]/,                             4],   // return <div / return <Component
    [/<>\s*</,                                         3],   // fragments <>
    [/\/>\s*[\n;)]/,                                   3],   // self-closing JSX />
    [/onClick=\{|onChange=\{|onSubmit=\{|onKeyDown=\{/, 4], // JSX event handlers
    [/\{[^{}]*\}\s*<\/[a-zA-Z]/,                       3],   // {expr}</tag>
    [/^\s*function\s+[A-Z]\w*\s*\(\)/m,                2],   // function Component()
    [/const\s+[A-Z]\w*\s*=\s*\(/,                      2],   // const Component = (
  ],

  ts: [
    [/:\s*(string|number|boolean|void|never|any|unknown)(\s*[;,\)\{|&]|$)/m, 3],
    [/interface\s+\w+\s*\{/,                           4],
    [/type\s+\w+\s*=/,                                 4],
    [/<T(\s+extends|\s*,|\s*>)/,                       3],  // generics
    [/:\s*(string|number|boolean)\[\]/,                3],  // array types
    [/readonly\s+\w+/,                                 3],
    [/enum\s+\w+\s*\{/,                                4],
    [/as\s+(string|number|boolean|any|\w+Type)/,       2],
    [/async\s+\w+.*:\s*Promise</,                      3],
    [/(public|private|protected)\s+\w+/,               3],
    [/import\s+\{[^}]+\}\s+from/,                      1],
    [/export\s+(interface|type|enum|const|function)/,  2],
  ],

  js: [
    [/\bfunction\s+\w+\s*\(/,                          3],
    [/\b(const|let|var)\s+\w+\s*=/,                    2],
    [/=>\s*\{/,                                        2],  // arrow function
    [/\bexport\s+(default\s+)?(function|class|const)/,3],
    [/\brequire\s*\(/,                                 4],
    [/module\.exports\s*=/,                            4],
    [/\bPromise\b/,                                    2],
    [/async\s+function/,                               2],
    [/\bawait\s+/,                                     2],
    [/console\.(log|error|warn)\s*\(/,                 2],
    [/document\.(getElementById|querySelector)/,       3],
    [/window\.\w+/,                                    2],
    [/\$\s*\(/,                                        2],  // jQuery
    [/\.then\s*\(/,                                    2],
    [/\.catch\s*\(/,                                   1],
  ],

  // ── Python ────────────────────────────────────────────────────────────────

  py: [
    [/^def\s+\w+\s*\(/m,                               4],
    [/^class\s+\w+(\s*\(|\s*:)/m,                      4],
    [/^(import|from)\s+\w+/m,                          3],
    [/print\s*\(/,                                     3],
    [/if\s+__name__\s*==\s*['"]__main__['"]/,          5],
    [/:\s*\n\s{4}/,                                    3],  // indented block
    [/self\.\w+/,                                      3],
    [/\bNone\b/,                                       2],
    [/\bTrue\b|\bFalse\b/,                             2],
    [/f['"]\{.*\}/,                                    3],  // f-string
    [/\bpip\b|\brequirements\.txt\b/,                  3],
    [/^\s*@\w+\s*$/m,                                  2],  // decorator
    [/\bdict\b|\blist\b|\btuple\b|\bset\b/,            2],
    [/\blambda\s+/,                                    3],
  ],

  // ── Compiled / systems ────────────────────────────────────────────────────

  java: [
    [/public\s+(static\s+)?class\s+\w+/,               5],
    [/System\.out\.(print|println)\s*\(/,              4],
    [/public\s+static\s+void\s+main/,                  5],
    [/(private|public|protected)\s+\w+\s+\w+\s*[=;(]/,3],
    [/@Override\b/,                                    3],
    [/import\s+java\./,                                5],
    [/new\s+[A-Z]\w+\s*\(/,                            2],
    [/throws\s+\w+Exception/,                          3],
  ],

  go: [
    [/^package\s+\w+/m,                                5],
    [/^func\s+\w+/m,                                   4],
    [/:=\s*/,                                          4],
    [/^import\s+\(/m,                                  3],
    [/fmt\.(Print|Println|Sprintf)/,                   4],
    [/\bdefer\s+/,                                     4],
    [/\bgoroutine\b|\bchan\b/,                         5],
    [/err\s*!=\s*nil/,                                 4],
    [/\binterface\{\}/,                                3],
  ],

  rs: [
    [/^fn\s+\w+/m,                                     5],
    [/let\s+(mut\s+)?\w+\s*[:=]/,                      3],
    [/\buse\s+std::/,                                  5],
    [/\bimpl\s+\w+/,                                   4],
    [/\bstruct\s+\w+\s*\{/,                            4],
    [/\benum\s+\w+\s*\{/,                              4],
    [/println!\s*\(/,                                  4],
    [/\bOption<|Result</,                              4],
    [/\bvec!\[|\bVec</,                                3],
    [/->/,                                             2],  // return type arrow
    [/\bpub\s+(fn|struct|enum|mod)/,                   3],
  ],

  cs: [
    [/namespace\s+\w+/,                                5],
    [/using\s+System/,                                 4],
    [/(public|private|protected)\s+\w+\s+\w+\s*\(/,   4],
    [/Console\.(Write|WriteLine)\s*\(/,                4],
    [/\.NET|asp\.net/i,                                3],
    [/\bvar\s+\w+\s*=\s*new\b/,                        3],
  ],

  cpp: [
    [/#include\s*<\w+>/,                               5],
    [/std::\w+/,                                       4],
    [/cout\s*<<|cin\s*>>/,                             5],
    [/int\s+main\s*\(\s*(void|int)/,                   5],
    [/\btemplate\s*</,                                 4],
    [/nullptr\b/,                                      3],
  ],

  swift: [
    [/import\s+(UIKit|SwiftUI|Foundation)/,            5],
    [/\bvar\s+\w+\s*:\s*[A-Z]/,                        3],
    [/\blet\s+\w+\s*[:=]/,                             2],
    [/func\s+\w+.*->/,                                 4],
    [/\bstruct\s+\w+\s*:/,                             3],
    [/\bguard\s+let\b|\bif\s+let\b/,                  4],
    [/\.swift\b/,                                      5],
  ],

  kt: [
    [/\bfun\s+\w+/,                                    4],
    [/\bval\s+\w+\s*[:=]/,                             3],
    [/\bvar\s+\w+\s*:\s*[A-Z]/,                        3],
    [/println\s*\(/,                                   3],
    [/import\s+kotlin\./,                              5],
    [/data\s+class\s+\w+/,                             5],
  ],

  php: [
    [/<\?php/,                                         6],
    [/\$\w+\s*=/,                                      3],
    [/echo\s+/,                                        3],
    [/\bfunction\s+\w+\s*\(\$?/,                       3],
    [/require_once|include_once/,                      4],
    [/\bnew\s+[A-Z]\w+\(/,                             2],
    [/->/,                                             2],  // PHP object
  ],

  rb: [
    [/^def\s+\w+/m,                                    4],
    [/^end$/m,                                         4],
    [/puts\s+/,                                        3],
    [/require\s+['"]\w+['"]/,                          3],
    [/\bdo\s+\|/,                                      3],
    [/\.\w+\s+do\s*\|/,                                3],
    [/attr_(reader|writer|accessor)/,                  5],
  ],

  // ── Data / markup ─────────────────────────────────────────────────────────

  sql: [
    [/\bSELECT\b/i,                                    4],
    [/\bINSERT\s+INTO\b/i,                             5],
    [/\bUPDATE\s+\w+\s+SET\b/i,                        5],
    [/\bDELETE\s+FROM\b/i,                             5],
    [/\bCREATE\s+(TABLE|INDEX|DATABASE|VIEW)\b/i,      5],
    [/\bALTER\s+TABLE\b/i,                             4],
    [/\bDROP\s+(TABLE|INDEX|DATABASE)\b/i,             4],
    [/\bJOIN\b.*\bON\b/i,                              3],
    [/\bWHERE\s+\w+/i,                                 2],
    [/\bGROUP\s+BY\b/i,                                3],
    [/\bORDER\s+BY\b/i,                                3],
    [/--\s/,                                           2],  // SQL comment
  ],

  html: [
    [/<!DOCTYPE\s+html>/i,                             6],
    [/<html[\s>]/i,                                    5],
    [/<(head|body|div|span|p|a|h[1-6]|ul|li|nav|main|section|article)[\s>/]/i, 4],
    [/<\/\w+>/,                                        2],
    [/href=["']/,                                      3],
    [/class=["']/,                                     2],
    [/<!--.+-->/,                                      2],
  ],

  css: [
    [/^[.#][\w-]+\s*\{/m,                              4],
    [/^\s+[\w-]+\s*:\s*[^:]+;/m,                       3],  // property: value;
    [/@(media|keyframes|import|font-face|root)\b/,     4],
    [/:root\s*\{/,                                     4],
    [/--[\w-]+\s*:/,                                   4],  // CSS variables
    [/(margin|padding|color|font|background|display|flex|grid)\s*:/i, 3],
  ],

  scss: [
    [/\$\w+\s*:/,                                      5],  // SCSS variable
    [/@(mixin|include|extend|each|if|else)\b/,         5],
    [/&:[\w-]+/,                                       3],
    [/&\s*\{/,                                         3],
  ],

  json: [
    [/^\s*\{[\s\S]*"[\w-]+"\s*:/m,                     4],
    [/^\s*\[[\s\S]*\{/m,                               3],
    [/"\s*:\s*(true|false|null|\d+|")/,                3],
    [/^\s*\{$/m,                                       2],
  ],

  yaml: [
    [/^[\w-]+:\s*\S/m,                                 3],
    [/^\s{2,}[\w-]+:\s/m,                              3],
    [/^---$/m,                                         4],
    [/^\s*-\s+\w+/m,                                   2],
    [/\$\{\{/,                                         3],  // GitHub Actions
  ],

  dockerfile: [
    [/^FROM\s+\w+/m,                                   6],
    [/^(RUN|CMD|EXPOSE|ENV|COPY|ADD|WORKDIR|ENTRYPOINT|VOLUME|ARG|LABEL)\s/m, 5],
  ],

  bash: [
    [/^(npm|yarn|pnpm|npx|bun)\s/m,                    4],
    [/^(git|gh)\s/m,                                   4],
    [/^(docker|kubectl|helm)\s/m,                      4],
    [/^(sudo|apt|apt-get|yum|brew|pip|cargo|gem)\s/m,  4],
    [/^(chmod|chown|mkdir|touch|grep|find|curl|wget)\s/m, 3],
    [/^[\$#>]\s/m,                                     3],
    [/^\s*export\s+\w+=/m,                             3],
    [/\|\s*grep|\|\s*awk|\|\s*sed/,                    3],
    [/&&|\|\|/,                                        2],
    [/\$\w+|\$\{.*?\}/,                                2],
    [/^(if|for|while|case)\s/m,                        2],
  ],

  powershell: [
    [/^(Get-|Set-|New-|Remove-|Write-|Out-|Invoke-)\w+/m, 5],
    [/\$\w+\s*=/,                                      2],
    [/-\w+\s+/,                                        2],
    [/Write-(Host|Output|Error)\s/,                    4],
    [/param\s*\(/i,                                    4],
  ],

  graphql: [
    [/^(query|mutation|subscription)\s+\w*/m,          5],
    [/^type\s+\w+\s*\{/m,                              4],
    [/:\s*\[?\w+!?\]?!/,                               3],
    [/fragment\s+\w+\s+on\s+\w+/,                      5],
  ],

  regex: [
    [/^\/.+\/[gimsuy]*$/,                              5],
    [/^\^[\s\S]+\$$/,                                  3],
    [/\([^)]*\)\+|\([^)]*\)\*/,                        3],  // groups + quantifiers
    [/\[\^?[\w\s-]+\]/,                                2],  // character classes
  ],

  curl: [
    [/^curl\s/im,                                      6],
    [/-X\s+(GET|POST|PUT|PATCH|DELETE)/i,              4],
    [/-H\s+["']/,                                      3],
    [/--data(-raw)?\s+/i,                              3],
  ],
};

// ─── Public API ───────────────────────────────────────────────────────────────

/** Detect the most likely language code from arbitrary code content. */
export function detectLanguage(code: string): string {
  if (!code || !code.trim()) return 'txt';
  const text = code.trim();

  // Fast path: shebangs
  if (text.startsWith('#!/bin/bash') || text.startsWith('#!/bin/sh')) return 'bash';
  if (text.startsWith('#!/usr/bin/env python') || text.startsWith('#!/usr/bin/python')) return 'py';
  if (text.startsWith('#!/usr/bin/env node')) return 'js';
  if (text.startsWith('#!/usr/bin/env ruby')) return 'rb';
  if (/^<\?php/.test(text)) return 'php';
  if (/^<!DOCTYPE\s+html>/i.test(text)) return 'html';
  if (/^curl\s/i.test(text)) return 'curl';

  // Scored matching
  const scores: Record<string, number> = {};
  for (const [lang, rules] of Object.entries(PATTERNS)) {
    let score = 0;
    for (const [pattern, weight] of rules) {
      if (pattern.test(text)) score += weight;
    }
    if (score > 0) scores[lang] = score;
  }

  if (Object.keys(scores).length === 0) return 'txt';

  // TSX > JSX disambiguation: require at least one TS-specific signal
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const top = sorted[0][0];

  // Prefer tsx over ts only when JSX markup is present
  if (top === 'ts' && scores['tsx'] && /(<[A-Z]|className=|return\s*\()/.test(text)) return 'tsx';
  // Prefer jsx over js when JSX markup is present
  if (top === 'js' && scores['jsx'] && /(<[A-Z]|className=|return\s*\()/.test(text)) return 'jsx';

  return top;
}

/** Detect the most likely snippet TYPE (not just language) from content. */
export function detectSnippetType(code: string): string | null {
  if (!code || !code.trim()) return null;
  const text = code.trim();

  if (/^curl\s/i.test(text)) return 'curl';
  if (/^(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|WITH)\s/i.test(text)) return 'sql';

  // Try JSON parse (fast, definitive)
  if (/^\s*[\[{]/.test(text)) {
    try { JSON.parse(text); return 'json'; } catch { /* not JSON */ }
  }

  // Shell / CLI command (single-line, starts with known CLI tools)
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length <= 5) {
    if (/^(npm|yarn|git|docker|kubectl|apt|brew|pip|curl|wget|ssh|scp)\s/i.test(text)) return 'command';
    if (/^[\$#>]\s/.test(text)) return 'command';
  }

  // Regex: single line that looks like a regex pattern
  if (lines.length === 1 && /^\/.+\/[gimsuy]*$/.test(text)) return 'regex';
  if (lines.length <= 2 && /^\^[\s\S]+\$$/.test(text)) return 'regex';

  // Script: multi-line with shebang or script-specific patterns
  if (text.startsWith('#!') || /^(python|ruby|perl|lua|bash|sh)\s+[\w/]/m.test(text)) return 'script';

  return null;
}

export function getLanguageName(lang: string): string {
  return LANGUAGE_NAMES[lang] || lang.toUpperCase();
}

export function getLanguageIcon(lang: string): string {
  const icons: Record<string, string> = {
    js: '📒', jsx: '⚛️', ts: '📘', tsx: '⚛️',
    py: '🐍', rb: '💎', java: '☕', go: '🔵', rs: '🦀',
    php: '🐘', cs: 'C#', cpp: 'C++', swift: '🍎', kt: '🔷',
    dockerfile: '🐳', sql: '🗄️', html: '🌐', css: '🎨',
    json: '📋', yaml: '⚙️', bash: '💻', sh: '💻',
    zsh: '💻', ps1: '🖥️', powershell: '🖥️',
    md: '📝', graphql: '◈', txt: '📄', regex: '📝', curl: '🌐',
  };
  return icons[lang] || '📄';
}
