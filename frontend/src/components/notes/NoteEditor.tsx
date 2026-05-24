'use client'

import { useState, useEffect, useRef } from 'react'
import { type Note } from '@/types/note'
import { useAutoSave } from '@/hooks/useNote'
import Button from '@/components/ui/Button'
import { LucideBold, LucideCheck, LucideCodeXml, LucideEye, LucideHeading2, LucideItalic, LucideList, LucidePencil, LucideQuote, LucideSettings2, SvgSpinnersRingResize } from '@/Icons/Icons'

interface NoteEditorProps {
  note:          Note
  onEditDetails: () => void
}

type EditorTab = 'write' | 'preview'

export default function NoteEditor({ note, onEditDetails }: NoteEditorProps) {
  const [title,    setTitle]   = useState(note.title)
  const [content,  setContent] = useState(note.content)
  const [tab,      setTab]     = useState<EditorTab>('write')
  const [lastSaved,setLastSaved] = useState<Date | null>(null)

  const { autoSave, isSaving } = useAutoSave(note.id)
  const titleRef   = useRef<HTMLTextAreaElement>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)

  // Reset when note switches
  useEffect(() => {
    setTitle(note.title)
    setContent(note.content)
    setLastSaved(null)
    setTab('write')
  }, [note.id])

  // Auto-resize title textarea
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = 'auto'
      titleRef.current.style.height = titleRef.current.scrollHeight + 'px'
    }
  }, [title])

  const onTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTitle(e.target.value)
    autoSave(content, e.target.value)
    setLastSaved(new Date())
  }

  const onContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    autoSave(e.target.value, title)
    setLastSaved(new Date())
  }

  // Insert markdown helpers at cursor position
  const insertMarkdown = (before: string, after = '') => {
    const ta = contentRef.current
    if (!ta) return
    const start  = ta.selectionStart
    const end    = ta.selectionEnd
    const sel    = content.slice(start, end)
    const next   = content.slice(0, start) + before + sel + after + content.slice(end)
    setContent(next)
    autoSave(next, title)
    setLastSaved(new Date())
    // Restore cursor
    requestAnimationFrame(() => {
      ta.focus()
      ta.setSelectionRange(start + before.length, start + before.length + sel.length)
    })
  }

  // Simple markdown → HTML for preview
  const toHtml = (md: string) => md
    .replace(/^### (.+)$/gm,   '<h3>$1</h3>')
    .replace(/^## (.+)$/gm,    '<h2>$1</h2>')
    .replace(/^# (.+)$/gm,     '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,     '<em>$1</em>')
    .replace(/`(.+?)`/g,       '<code>$1</code>')
    .replace(/^- (.+)$/gm,     '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/g,'<ul>$1</ul>')
    .replace(/^> (.+)$/gm,     '<blockquote>$1</blockquote>')
    .replace(/\n\n/g,          '</p><p>')
    .replace(/^(?!<[hublp])/gm,'')

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0
  const charCount = content.length

  return (
    <>
      <style>{CSS}</style>
      <div className="neditor">

        {/* ── Toolbar ── */}
        <div className="neditor-toolbar">
          <div className="neditor-tabs">
            <button
              className={['ne-tab', tab === 'write' ? 'ne-tab--active' : ''].filter(Boolean).join(' ')}
              onClick={() => setTab('write')}
            >
              <LucidePencil width={13} />
              Write
            </button>
            <button
              className={['ne-tab', tab === 'preview' ? 'ne-tab--active' : ''].filter(Boolean).join(' ')}
              onClick={() => setTab('preview')}
            >
              <LucideEye width={13} />
              Preview
            </button>
          </div>

          {tab === 'write' && (
            <div className="neditor-format-btns">
              <button className="ne-fmt-btn" onClick={() => insertMarkdown('**', '**')} title="Bold"><LucideBold width={13} /></button>
              <button className="ne-fmt-btn" onClick={() => insertMarkdown('*', '*')}   title="Italic"><LucideItalic width={13} /></button>
              <button className="ne-fmt-btn" onClick={() => insertMarkdown('`', '`')}   title="Code"><LucideCodeXml width={13} /></button>
              <button className="ne-fmt-btn" onClick={() => insertMarkdown('## ')}      title="Heading"><LucideHeading2 width={13} /></button>
              <button className="ne-fmt-btn" onClick={() => insertMarkdown('- ')}       title="List"><LucideList width={13} /></button>
              <button className="ne-fmt-btn" onClick={() => insertMarkdown('> ')}       title="Quote"><LucideQuote width={13} /></button>
            </div>
          )}

          <div className="neditor-meta">
            {/* Save status */}
            <span className="ne-save-status">
              {isSaving ? (
                <><SvgSpinnersRingResize width={12} /> Saving…</>
              ) : lastSaved ? (
                <><LucideCheck width={12} /> {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</>
              ) : null}
            </span>

            <Button variant="ghost" size="xs" leftIcon={LucideSettings2} onClick={onEditDetails}>
              Details
            </Button>
          </div>
        </div>

        {/* ── Title ── */}
        <div className="neditor-title-wrap">
          <textarea
            ref={titleRef}
            className="neditor-title"
            value={title}
            onChange={onTitleChange}
            placeholder="Note title…"
            rows={1}
          />
        </div>

        {/* ── Write / Preview ── */}
        {tab === 'write' ? (
          <textarea
            ref={contentRef}
            className="neditor-content"
            value={content}
            onChange={onContentChange}
            placeholder="Start writing… Markdown supported"
          />
        ) : (
          <div
            className="neditor-preview"
            dangerouslySetInnerHTML={{ __html: toHtml(content) || '<p style="color:var(--text-tertiary)">Nothing to preview</p>' }}
          />
        )}

        {/* ── Status bar ── */}
        <div className="neditor-statusbar">
          <span>{wordCount} words · {charCount} chars</span>
          <span>
            Updated {new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

      </div>
    </>
  )
}

const CSS = `
.neditor {
  display:        flex;
  flex-direction: column;
  height:         100%;
  overflow:       hidden;
}

/* Toolbar */
.neditor-toolbar {
  display:      flex;
  align-items:  center;
  gap:          8px;
  padding:      8px 16px;
  border-bottom: 1px solid var(--border-subtle);
  flex-shrink:  0;
  flex-wrap:    wrap;
}

.neditor-tabs { display: flex; gap: 2px; }
.ne-tab {
  display:       flex;
  align-items:   center;
  gap:           5px;
  height:        28px;
  padding:       0 10px;
  background:    transparent;
  border:        none;
  border-radius: var(--radius-md);
  color:         var(--text-tertiary);
  font-size:     var(--text-xs);
  font-family:   var(--font-sans);
  font-weight:   500;
  cursor:        pointer;
  transition:    background var(--transition-fast), color var(--transition-fast);
}
.ne-tab:hover      { background: var(--bg-overlay); color: var(--text-primary); }
.ne-tab--active    { background: var(--bg-overlay); color: var(--text-primary); }

.neditor-format-btns { display: flex; gap: 2px; flex: 1; }
.ne-fmt-btn {
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           28px;
  height:          28px;
  background:      transparent;
  border:          none;
  border-radius:   var(--radius-sm);
  color:           var(--text-tertiary);
  cursor:          pointer;
  transition:      background var(--transition-fast), color var(--transition-fast);
}
.ne-fmt-btn:hover { background: var(--bg-overlay); color: var(--text-primary); }

.neditor-meta {
  display:     flex;
  align-items: center;
  gap:         8px;
  margin-left: auto;
  flex-shrink: 0;
}
.ne-save-status {
  display:     flex;
  align-items: center;
  gap:         4px;
  font-size:   var(--text-xs);
  color:       var(--text-tertiary);
  white-space: nowrap;
}

/* Title */
.neditor-title-wrap {
  padding:      16px 20px 0;
  flex-shrink:  0;
}
.neditor-title {
  width:        100%;
  background:   transparent;
  border:       none;
  outline:      none;
  color:        var(--text-primary);
  font-family:  var(--font-sans);
  font-size:    var(--text-2xl);
  font-weight:  700;
  line-height:  var(--leading-tight);
  letter-spacing: -0.02em;
  resize:       none;
  overflow:     hidden;
  min-height:   44px;
}
.neditor-title::placeholder { color: var(--text-tertiary); }

/* Content */
.neditor-content {
  flex:         1;
  padding:      12px 20px;
  background:   transparent;
  border:       none;
  outline:      none;
  color:        var(--text-primary);
  font-family:  var(--font-mono);
  font-size:    var(--text-sm);
  line-height:  var(--leading-relaxed);
  resize:       none;
  overflow-y:   auto;
}
.neditor-content::placeholder { color: var(--text-tertiary); }
.neditor-content::-webkit-scrollbar { width: 4px; }
.neditor-content::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 99px; }

/* Preview */
.neditor-preview {
  flex:       1;
  padding:    12px 20px;
  overflow-y: auto;
  font-size:  var(--text-sm);
  line-height: var(--leading-relaxed);
  color:      var(--text-secondary);
}
.neditor-preview h1 { font-size: var(--text-2xl); font-weight: 700; color: var(--text-primary); margin: 16px 0 8px; }
.neditor-preview h2 { font-size: var(--text-xl);  font-weight: 700; color: var(--text-primary); margin: 14px 0 6px; }
.neditor-preview h3 { font-size: var(--text-lg);  font-weight: 600; color: var(--text-primary); margin: 12px 0 4px; }
.neditor-preview strong { color: var(--text-primary); }
.neditor-preview code  { background: var(--bg-overlay); color: var(--cyan-300); padding: 1px 6px; border-radius: 4px; font-family: var(--font-mono); font-size: 0.88em; }
.neditor-preview blockquote { border-left: 3px solid var(--accent); padding-left: 12px; color: var(--text-tertiary); margin: 8px 0; }
.neditor-preview ul { padding-left: 20px; margin: 6px 0; }
.neditor-preview li { margin: 3px 0; }
.neditor-preview p  { margin: 6px 0; }

/* Status bar */
.neditor-statusbar {
  display:         flex;
  align-items:     center;
  justify-content: space-between;
  padding:         6px 20px;
  border-top:      1px solid var(--border-subtle);
  font-size:       var(--text-xs);
  color:           var(--text-tertiary);
  flex-shrink:     0;
}
`