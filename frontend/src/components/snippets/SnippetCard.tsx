'use client'

import { useState } from 'react'
import { type Snippet, SNIPPET_TYPES } from '@/types/snippet'
import { getLanguageName }             from '@/lib/languageDetector'
import { useToggleSnippetFavorite, useDeleteSnippet } from '@/hooks/useSnippet'
import Badge  from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Modal  from '@/components/ui/Modal'
import { LucideCheck, LucideChevronDown, LucideChevronUp, LucideCopy, LucideFolder, LucidePencil, LucideStar, LucideTrash2 } from '@/Icons/Icons'

const LANG_COLORS: Record<string, string> = {
  js: 'orange', jsx: 'orange', ts: 'cyan', tsx: 'cyan',
  py: 'cyan', go: 'cyan', rs: 'orange', java: 'orange',
  sql: 'purple', json: 'success', yaml: 'warning',
  html: 'orange', css: 'purple', sh: 'default', bash: 'default',
  regex: 'pink', curl: 'warning', md: 'default',
}

interface SnippetCardProps {
  snippet:  Snippet
  copiedId: number | null
  onEdit:   (s: Snippet) => void
  onCopy:   (s: Snippet) => void
}

export default function SnippetCard({ snippet, copiedId, onEdit, onCopy }: SnippetCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [expanded,      setExpanded]      = useState(false)

  const toggleFav  = useToggleSnippetFavorite()
  const deleteSnip = useDeleteSnippet()

  const isCopied   = copiedId === snippet.id
  const typeConfig = SNIPPET_TYPES[snippet.snippetType]
  const langName   = getLanguageName(snippet.language)
  const langColor  = (LANG_COLORS[snippet.language] ?? 'default') as any

  // Preview: first 6 lines of code
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
            <button
              className={['sc-fav', snippet.isFavorite ? 'sc-fav--active' : ''].filter(Boolean).join(' ')}
              onClick={() => toggleFav.mutate(snippet.id)}
              aria-label={snippet.isFavorite ? 'Remove favorite' : 'Add favorite'}
              disabled={toggleFav.isPending}
            >
              <LucideStar width={14} />
            </button>
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

          <pre className={['sc-code', expanded ? 'sc-code--expanded' : ''].filter(Boolean).join(' ')}>
            <code>{expanded ? snippet.content : previewLines.join('\n')}</code>
          </pre>

          {hasMore && (
            <button className="sc-expand-btn" onClick={() => setExpanded((p) => !p)}>
              {expanded ? <LucideChevronUp  width={12} /> : <LucideChevronDown  width={12} />}
              {expanded ? 'Show less' : `${lines.length - 6} more lines`}
            </button>
          )}
        </div>

        {/* ── Tags ── */}
        {snippet.tags && snippet.tags.length > 0 && (
          <div className="sc-tags">
            {snippet.tags.slice(0, 4).map((tag: any) => (
              <Badge key={tag.id} variant="default" size="sm">{tag.name}</Badge>
            ))}
            {snippet.tags.length > 4 && (
              <span className="sc-tags-more">+{snippet.tags.length - 4}</span>
            )}
          </div>
        )}

        {/* ── Footer: copy + actions ── */}
        <div className="sc-footer">
          {/* Copy — primary action, most prominent */}
          <button
            className={['sc-copy-btn', isCopied ? 'sc-copy-btn--copied' : ''].filter(Boolean).join(' ')}
            onClick={() => onCopy(snippet)}
            aria-label="Copy to clipboard"
          >
            {isCopied ? <LucideCheck width={14}/> : <LucideCopy width={14}/>}
            {isCopied ? 'Copied!' : 'Copy'}
          </button>

          <div className="sc-actions">
            <button
              className="sc-action-btn"
              onClick={() => onEdit(snippet)}
              aria-label="Edit snippet"
              title="Edit"
            >
              <LucidePencil width={14} />
            </button>
            <button
              className="sc-action-btn sc-action-btn--danger"
              onClick={() => setConfirmDelete(true)}
              aria-label="Delete snippet"
              title="Delete"
            >
              <LucideTrash2 width={14} />
            </button>
          </div>

          <span className="sc-date">
            {new Date(snippet.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Delete confirm */}
      <Modal isOpen={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete snippet" size="sm">
        <div className="sc-confirm">
          <p className="sc-confirm-text">
            Delete <strong>{snippet.title}</strong>? This cannot be undone.
          </p>
          <div className="sc-confirm-actions">
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button
              variant="danger"
              isLoading={deleteSnip.isPending}
              onClick={() => deleteSnip.mutate(snippet.id, { onSuccess: () => setConfirmDelete(false) })}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
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
.sc-fav {
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px;
  background: transparent; border: none;
  color: var(--text-tertiary); cursor: pointer;
  border-radius: var(--radius-sm);
  transition: color var(--transition-fast), transform var(--transition-fast);
  flex-shrink: 0;
}
.sc-fav:hover    { color: #fbbf24; transform: scale(1.15); }
.sc-fav--active  { color: #fbbf24; }
.sc-fav:disabled { opacity: 0.5; pointer-events: none; }

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
  display:    block;
  padding:    12px 14px;
  margin:     0;
  font-family: var(--font-mono);
  font-size:   var(--text-xs);
  line-height: var(--leading-relaxed);
  color:       var(--cyan-200);
  overflow-x:  auto;
  white-space: pre;
  max-height:  140px;
  overflow-y:  hidden;
  transition:  max-height var(--transition-slow);
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

/* Tags */
.sc-tags      { display: flex; flex-wrap: wrap; gap: 5px; }
.sc-tags-more { font-size: var(--text-xs); color: var(--text-tertiary); align-self: center; }

/* Footer */
.sc-footer {
  display:         flex;
  align-items:     center;
  gap:             8px;
  padding-top:     12px;
  border-top:      1px solid var(--border-subtle);
}

/* Copy button — the star of the show */
.sc-copy-btn {
  display:       flex;
  align-items:   center;
  gap:           6px;
  height:        34px;
  padding:       0 14px;
  background:    var(--bg-overlay);
  border:        1px solid var(--border-default);
  border-radius: var(--radius-md);
  color:         var(--text-secondary);
  font-size:     var(--text-sm);
  font-family:   var(--font-sans);
  font-weight:   500;
  cursor:        pointer;
  transition:    background var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast), box-shadow var(--transition-fast);
  /* Good tap target */
  min-height:    44px;
}
.sc-copy-btn:hover {
  background:   var(--accent-muted);
  border-color: var(--border-focus);
  color:        var(--cyan-300);
}
.sc-copy-btn--copied {
  background:   var(--success-muted);
  border-color: rgba(16,185,129,0.3);
  color:        #34d399;
}

.sc-actions { display: flex; align-items: center; gap: 4px; margin-left: auto; }
.sc-action-btn {
  display: flex; align-items: center; justify-content: center;
  width: 36px; height: 36px;
  background: transparent; border: 1px solid transparent;
  border-radius: var(--radius-md); color: var(--text-tertiary);
  cursor: pointer;
  transition: background var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast);
  /* Good tap target */
  min-width: 44px; min-height: 44px;
}
.sc-action-btn:hover              { background: var(--bg-overlay); border-color: var(--border-default); color: var(--text-primary); }
.sc-action-btn--danger:hover      { background: var(--danger-muted); border-color: rgba(239,68,68,0.2); color: var(--danger); }

.sc-date { font-size: var(--text-xs); color: var(--text-tertiary); white-space: nowrap; }

/* Confirm */
.sc-confirm         { display: flex; flex-direction: column; gap: 20px; }
.sc-confirm-text    { font-size: var(--text-sm); color: var(--text-secondary); line-height: var(--leading-relaxed); }
.sc-confirm-text strong { color: var(--text-primary); }
.sc-confirm-actions { display: flex; justify-content: flex-end; gap: 8px; }
`