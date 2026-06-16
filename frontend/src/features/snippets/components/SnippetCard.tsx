'use client'

import { useRouter } from 'next/navigation'
import { type Snippet, SNIPPET_TYPES } from '@/features/snippets/types/snippet'
import { getLanguageName }             from '@/features/snippets/utils/languageDetector'
import { testRegex, getMatchParts }    from '@/features/snippets/utils/snippetUtils'
import { useToggleSnippetFavorite }    from '@/features/snippets/hooks/useSnippet'
import Badge  from '@/features/shared/ui/Badge'
import CodeBlock from '@/features/shared/ui/CodeBlock'
import FavoriteButton from '@/features/shared/components/FavoriteButton'
import CopyButton from '@/features/shared/components/CopyButton'
import TagSection from '@/features/shared/components/TagSection'
import { LucideCopy, LucideFolder } from '@/Icons/Icons'
import ProjectBadge from '@/features/projects/components/ProjectBadge'

const FLAG_TITLES: Record<string, string> = {
  g: 'Global', i: 'Case insensitive', m: 'Multiline', s: 'Dot matches newline',
}

const LANG_COLORS: Record<string, string> = {
  js: 'orange', jsx: 'orange', ts: 'cyan', tsx: 'cyan',
  py: 'cyan', go: 'cyan', rs: 'orange', java: 'orange',
  sql: 'purple', json: 'success', yaml: 'warning',
  html: 'orange', css: 'purple', sh: 'default', bash: 'default',
  regex: 'pink', curl: 'warning', md: 'default',
}

interface SnippetCardProps {
  snippet:      Snippet
  onDuplicate?: (s: Snippet) => void
}

export default function SnippetCard({ snippet, onDuplicate }: SnippetCardProps) {
  const router = useRouter()
  const toggleFav  = useToggleSnippetFavorite()

  const typeConfig = SNIPPET_TYPES[snippet.snippetType]
  const langName   = getLanguageName(snippet.language)
  const langColor  = (LANG_COLORS[snippet.language] ?? 'default') as any

  const goToDetail = () => router.push(`/snippets/${snippet.id}`)

  const duplicateBtn = onDuplicate && (
    <button
      className="sc-icon-btn"
      type="button"
      aria-label="Duplicate"
      title="Duplicate snippet"
      onClick={(e) => { e.stopPropagation(); onDuplicate(snippet); }}
    >
      <LucideCopy width={16} />
    </button>
  )

  return (
    <>
      <style>{CSS}</style>
      <div className="sc">

        {/* ── Header ── */}
        <div className="sc-header">
          <div className="sc-title-row">
            <div className="sc-type-dot" title={typeConfig?.label} />
            <h3 className="sc-title">{snippet.title}</h3>
            <FavoriteButton
              active={snippet.isFavorite}
              pending={toggleFav.isPending}
              onToggle={() => toggleFav.mutate(snippet.id)}
            />
          </div>

          <div className="sc-meta">
            <Badge variant={langColor} size="sm">{langName}</Badge>
            <span className="sc-type-label">{typeConfig?.label}</span>
            {snippet.category && (
              <span className="sc-category">
                <LucideFolder width={11} />
                {snippet.category.name}
              </span>
            )}
          </div>
        </div>

        {/* ── Description ── */}
        {snippet.description && (
          <p className="sc-desc">{snippet.description}</p>
        )}

        {/* ── Code block — clicking here navigates to detail ── */}
        <div
          className="sc-code-wrap"
          role="button"
          tabIndex={0}
          onClick={goToDetail}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goToDetail() }
          }}
        >
          <div className="sc-code-header">
            <div className="sc-code-dots">
              <span className="sc-code-dot sc-code-dot--r" />
              <span className="sc-code-dot sc-code-dot--y" />
              <span className="sc-code-dot sc-code-dot--g" />
            </div>
            <span className="sc-code-filename">
              {snippet.title.toLowerCase().replace(/\s+/g, '-')}.{snippet.language}
            </span>
            <span className="sc-code-lang-pill">{snippet.language}</span>
          </div>
          <div className="sc-code-body">
            <CodeBlock
              code={snippet.content}
              language={snippet.language}
              className="sc-code"
            />
          </div>
        </div>

        {/* ── Regex metadata: flags + test string with highlighted matches ── */}
        {snippet.snippetType === 'regex' && (snippet.metadata?.flags || snippet.metadata?.testString) && (() => {
          const flags      = snippet.metadata?.flags      ?? ''
          const testStr    = snippet.metadata?.testString ?? ''
          const truncated  = testStr.slice(0, 300)
          const hasMore    = testStr.length > 300
          const { matches } = testStr ? testRegex(snippet.content, testStr, flags) : { matches: [] }
          const parts      = testStr ? getMatchParts(truncated, snippet.content, flags) : []

          return (
            <div className="sc-regex">
              {flags && (
                <div className="sc-regex-flags">
                  <span className="sc-regex-lbl">Flags</span>
                  {flags.split('').map(f => (
                    <span key={f} className="sc-regex-flag" title={FLAG_TITLES[f]}>{f}</span>
                  ))}
                </div>
              )}
              {testStr && (
                <div className="sc-regex-test">
                  <div className="sc-regex-test-header">
                    <span className="sc-regex-lbl">Test</span>
                    {matches.length > 0 && (
                      <span className="sc-regex-count">
                        {matches.length} match{matches.length !== 1 ? 'es' : ''}
                      </span>
                    )}
                  </div>
                  <div className="sc-regex-test-str">
                    {parts.map((p, i) =>
                      p.match
                        ? <mark key={i} className="sc-regex-match">{p.text}</mark>
                        : <span key={i}>{p.text}</span>
                    )}
                    {hasMore && <span className="sc-regex-ellipsis">…</span>}
                  </div>
                </div>
              )}
            </div>
          )
        })()}

        {/* ── Tags ── */}
        <TagSection tags={snippet.tags} />

        {/* ── Footer: copy + actions ── */}
        <div className="sc-footer">
          <CopyButton text={snippet.content} label="Copy" />
          <div className="sc-actions">
            <ProjectBadge itemType="snippet" itemId={snippet.id} />
            {duplicateBtn}
          </div>
        </div>
      </div>
    </>
  )
}

const CSS = `
.sc {
  display:        flex;
  flex-direction: column;
  gap:            12px;
  padding:        16px;
  background:     var(--bg-surface);
  border:         1px solid var(--border-default);
  border-radius:  var(--radius-lg);
  cursor:         default;
  transition:     border-color var(--transition-fast), box-shadow var(--transition-fast);
  min-width:      0;
  width:          100%;
  box-sizing:     border-box;
  overflow:       hidden;
}
.sc:hover { border-color: var(--border-strong); box-shadow: var(--shadow-sm); }

/* Header */
.sc-header   { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.sc-title-row {
  display:     flex;
  align-items: center;
  gap:         8px;
  min-width:   0;
}
.sc-type-dot {
  width:         8px;
  height:        8px;
  border-radius: 50%;
  background:    var(--accent);
  flex-shrink:   0;
}
.sc-title {
  flex:          1;
  font-size:     var(--text-sm);
  font-weight:   600;
  color:         var(--text-primary);
  white-space:   nowrap;
  overflow:      hidden;
  text-overflow: ellipsis;
  min-width:     0;
}

.sc-meta {
  display:     flex;
  align-items: center;
  gap:         8px;
  flex-wrap:   wrap;
}
.sc-type-label {
  font-size:   var(--text-xs);
  color:       var(--text-tertiary);
  font-weight: 500;
}
.sc-category {
  display:     flex;
  align-items: center;
  gap:         4px;
  font-size:   var(--text-xs);
  color:       var(--text-tertiary);
}

/* Description */
.sc-desc {
  font-size:          var(--text-xs);
  color:              var(--text-secondary);
  line-height:        var(--leading-snug);
  display:            -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow:           hidden;
}

/* ── Code editor chrome ─────────────────────────────────────── */
.sc-code-wrap {
  position:      relative;
  background:    #0d1117;
  border:        1px solid rgba(255,255,255,0.08);
  border-radius: var(--radius-md);
  overflow:      hidden;
  min-width:     0;
  width:         100%;
  box-sizing:    border-box;
  cursor:        pointer;
  transition:    border-color var(--transition-fast);
}
.sc-code-wrap:hover { border-color: rgba(255,255,255,0.18); }

.sc-code-header {
  display:         flex;
  align-items:     center;
  gap:             8px;
  padding:         7px 10px;
  background:      rgba(255,255,255,0.03);
  border-bottom:   1px solid rgba(255,255,255,0.07);
  min-width:       0;
}

.sc-code-dots {
  display:     flex;
  align-items: center;
  gap:         5px;
  flex-shrink: 0;
}
.sc-code-dot {
  width:         10px;
  height:        10px;
  border-radius: 50%;
  flex-shrink:   0;
}
.sc-code-dot--r { background: #ff5f57; }
.sc-code-dot--y { background: #febc2e; }
.sc-code-dot--g { background: #28c840; }

.sc-code-filename {
  flex:          1;
  font-size:     11px;
  font-family:   var(--font-mono);
  color:         rgba(148,163,184,0.6);
  overflow:      hidden;
  text-overflow: ellipsis;
  white-space:   nowrap;
  min-width:     0;
}

.sc-code-lang-pill {
  flex-shrink:   0;
  font-size:     10px;
  font-family:   var(--font-mono);
  font-weight:   600;
  color:         var(--accent, #67e8f9);
  background:    rgba(103,232,249,0.08);
  padding:       1px 7px;
  border-radius: var(--radius-sm);
  border:        1px solid rgba(103,232,249,0.18);
  letter-spacing: 0.03em;
  text-transform: lowercase;
}

.sc-code-body {
  overflow-x: auto;
  overflow-y: auto;
  max-height: 180px;
}
.sc-code-body::-webkit-scrollbar         { height: 4px; width: 4px; }
.sc-code-body::-webkit-scrollbar-thumb   { background: rgba(255,255,255,0.12); border-radius: 99px; }
.sc-code-body::-webkit-scrollbar-track   { background: transparent; }

.sc-code {
  display:     block;
  margin:      0;
  font-family: var(--font-mono);
  font-size:   var(--text-xs);
  line-height: var(--leading-relaxed);
  white-space: pre;
  background:  transparent !important;
}

/* Regex display */
.sc-regex {
  display:        flex;
  flex-direction: column;
  gap:            8px;
  padding:        10px 12px;
  background:     var(--bg-elevated);
  border:         1px solid var(--border-subtle);
  border-radius:  var(--radius-md);
}
.sc-regex-flags { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.sc-regex-lbl   { font-size: var(--text-xs); font-weight: 500; color: var(--text-tertiary); min-width: 32px; }
.sc-regex-flag  {
  display:         inline-flex;
  align-items:     center;
  justify-content: center;
  width:           20px;
  height:          20px;
  background:      var(--accent-subtle);
  border:          1px solid var(--accent-border);
  border-radius:   var(--radius-sm);
  color:           var(--cyan-300);
  font-size:       11px;
  font-family:     var(--font-mono);
  font-weight:     700;
}
.sc-regex-test        { display: flex; flex-direction: column; gap: 4px; }
.sc-regex-test-header { display: flex; align-items: center; gap: 8px; }
.sc-regex-count       { font-size: var(--text-xs); color: #86efac; font-weight: 500; }
.sc-regex-test-str    {
  font-size:   var(--text-xs);
  font-family: var(--font-mono);
  line-height: var(--leading-relaxed);
  color:       var(--text-secondary);
  word-break:  break-all;
  white-space: pre-wrap;
}
.sc-regex-match    { background: rgba(244,114,182,.18); color: #f472b6; border-radius: 2px; padding: 0 1px; }
.sc-regex-ellipsis { color: var(--text-tertiary); }

/* Footer */
.sc-footer {
  display:     flex;
  align-items: center;
  gap:         8px;
  padding-top: 12px;
  border-top:  1px solid var(--border-subtle);
}

.sc-actions { display: flex; align-items: center; gap: 4px; margin-left: auto; }

.sc-icon-btn {
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           40px;
  height:          40px;
  background:      transparent;
  border:          1px solid transparent;
  border-radius:   var(--radius-sm);
  color:           var(--text-tertiary);
  cursor:          pointer;
  transition:      background var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast);
}
@media (hover: none) { .sc-icon-btn { width: 40px; height: 40px; } }
.sc-icon-btn:hover { background: var(--bg-overlay); border-color: var(--border-default); color: var(--text-primary); }
`
