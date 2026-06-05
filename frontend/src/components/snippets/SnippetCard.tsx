'use client'

import { useState } from 'react'
import { type Snippet, SNIPPET_TYPES } from '@/types/snippet'
import { getLanguageName }             from '@/lib/languageDetector'
import { testRegex }                   from '@/lib/snippetUtils'
import { useToggleSnippetFavorite, useDeleteSnippet } from '@/hooks/useSnippet'
import Badge  from '@/components/ui/Badge'
import CodeBlock from '@/components/ui/CodeBlock'
import FavoriteButton from '@/components/shared/FavoriteButton'
import CopyButton from '@/components/shared/CopyButton'
import ActionButtons from '@/components/shared/ActionButtons'
import TagSection from '@/components/shared/TagSection'
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal'
import { LucideChevronDown, LucideChevronUp, LucideFolder } from '@/Icons/Icons'

const FLAG_TITLES: Record<string, string> = {
  g: 'Global', i: 'Case insensitive', m: 'Multiline', s: 'Dot matches newline',
}

function getMatchParts(text: string, pattern: string, flags: string) {
  try {
    const gFlags = flags.includes('g') ? flags : flags + 'g'
    const re = new RegExp(pattern, gFlags)
    const parts: { text: string; match: boolean }[] = []
    let last = 0, m: RegExpExecArray | null
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) parts.push({ text: text.slice(last, m.index), match: false })
      if (m[0].length === 0) { re.lastIndex++; continue }
      parts.push({ text: m[0], match: true })
      last = m.index + m[0].length
    }
    if (last < text.length) parts.push({ text: text.slice(last), match: false })
    return parts
  } catch {
    return [{ text, match: false }]
  }
}

const LANG_COLORS: Record<string, string> = {
  js: 'orange', jsx: 'orange', ts: 'cyan', tsx: 'cyan',
  py: 'cyan', go: 'cyan', rs: 'orange', java: 'orange',
  sql: 'purple', json: 'success', yaml: 'warning',
  html: 'orange', css: 'purple', sh: 'default', bash: 'default',
  regex: 'pink', curl: 'warning', md: 'default',
}

interface SnippetCardProps {
  snippet: Snippet
  onEdit:  (s: Snippet) => void
}

export default function SnippetCard({ snippet, onEdit }: SnippetCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [expanded,      setExpanded]      = useState(false)

  const toggleFav  = useToggleSnippetFavorite()
  const deleteSnip = useDeleteSnippet()

  const typeConfig = SNIPPET_TYPES[snippet.snippetType]
  const langName   = getLanguageName(snippet.language)
  const langColor  = (LANG_COLORS[snippet.language] ?? 'default') as any

    const lines        = snippet.content.split('\n')
  const previewLines = lines.slice(0, 6)
  const hasMore      = lines.length > 6

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

        {/* ── Code block ── */}
        <div className="sc-code-wrap">
          {/* Language label in corner */}
          <span className="sc-code-lang">{snippet.language}</span>

          <CodeBlock
            code={expanded ? snippet.content : previewLines.join('\n')}
            language={snippet.language}
            className={['sc-code', expanded ? 'sc-code--expanded' : ''].filter(Boolean).join(' ')}
          />

          {hasMore && (
            <button className="sc-expand-btn" onClick={() => setExpanded((p) => !p)}>
              {expanded ? <LucideChevronUp  width={12} /> : <LucideChevronDown  width={12} />}
              {expanded ? 'Show less' : `${lines.length - 6} more lines`}
            </button>
          )}
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
          <ActionButtons onEdit={() => onEdit(snippet)} onDelete={() => setConfirmDelete(true)} />
          <span className="sc-date">
            {new Date(snippet.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        itemName={snippet.title}
        isLoading={deleteSnip.isPending}
        onConfirm={() => deleteSnip.mutate(snippet.id, { onSuccess: () => setConfirmDelete(false) })}
      />
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
  transition:     border-color var(--transition-fast), box-shadow var(--transition-fast);
}
.sc:hover { border-color: var(--border-strong); box-shadow: var(--shadow-sm); }

/* Header */
.sc-header   { display: flex; flex-direction: column; gap: 8px; }
.sc-title-row {
  display:     flex;
  align-items: center;
  gap:         8px;
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
}

.sc-meta {
  display:     flex;
  align-items: center;
  gap:         8px;
  flex-wrap:   wrap;
}
.sc-type-label {
  font-size:  var(--text-xs);
  color:      var(--text-tertiary);
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

/* Code block */
.sc-code-wrap {
  position:      relative;
  background:    var(--bg-elevated);
  border:        1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  overflow:      hidden;
}
.sc-code-lang {
  position:      absolute;
  top:           6px;
  right:         8px;
  font-size:     10px;
  font-family:   var(--font-mono);
  color:         var(--text-tertiary);
  background:    var(--bg-overlay);
  padding:       1px 6px;
  border-radius: var(--radius-sm);
  border:        1px solid var(--border-subtle);
  pointer-events: none;
}
.sc-code {
  display:     block;
  margin:      0;
  font-family: var(--font-mono);
  font-size:   var(--text-xs);
  line-height: var(--leading-relaxed);
  overflow-x:  auto;
  white-space: pre;
  max-height:  140px;
  overflow-y:  hidden;
  transition:  max-height var(--transition-slow);
  background:  transparent !important;
}
.sc-code--expanded { max-height: 400px; overflow-y: auto; }
.sc-code::-webkit-scrollbar { height: 4px; width: 4px; }
.sc-code::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 99px; }

.sc-expand-btn {
  display:     flex;
  align-items: center;
  gap:         4px;
  width:       100%;
  padding:     6px 14px;
  background:  var(--bg-overlay);
  border:      none;
  border-top:  1px solid var(--border-subtle);
  color:       var(--text-tertiary);
  font-size:   var(--text-xs);
  font-family: var(--font-sans);
  cursor:      pointer;
  transition:  color var(--transition-fast), background var(--transition-fast);
}
.sc-expand-btn:hover { color: var(--text-primary); background: var(--bg-subtle); }

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
  display:         flex;
  align-items:     center;
  gap:             8px;
  padding-top:     12px;
  border-top:      1px solid var(--border-subtle);
}

.sc-actions { display: flex; align-items: center; gap: 4px; margin-left: auto; }
.sc-date { font-size: var(--text-xs); color: var(--text-tertiary); white-space: nowrap; }
`