'use client'

import { useState } from 'react'
import { type Note }    from '@/features/notes/types/note'
import { useTogglePin, useDeleteNote } from '@/features/notes/hooks/useNote'
import Badge from '@/features/shared/ui/Badge'
import Modal from '@/features/shared/ui/Modal'
import Button from '@/features/shared/ui/Button'
import { LucidePencil, LucidePin, LucideTrash2 } from '@/Icons/Icons'
import ProjectBadge from '@/features/projects/components/ProjectBadge'
import MultiProjectEditWarning from '@/features/projects/components/MultiProjectEditWarning'
import { useProjectAwareEdit } from '@/features/shared/hooks/useProjectAwareEdit'

interface NoteCardProps {
  note:          Note
  isActive:      boolean
  onSelect:      () => void
  onEditDetails: () => void
}

export default function NoteCard({ note, isActive, onSelect, onEditDetails }: NoteCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const togglePin  = useTogglePin()
  const deleteNote = useDeleteNote()

  const { handleEdit, confirmEdit, cancelEdit, isWarnOpen, projectNames } =
    useProjectAwareEdit<null>({ itemType: 'note', itemId: note.id, onEdit: () => onEditDetails() })

  const preview = note.content
    ? note.content.replace(/[#*`_>\-\[\]()!]/g, '').trim().slice(0, 120)
    : 'Empty note…'

  const stopProp = (e: React.MouseEvent, fn: () => void) => {
    e.stopPropagation()
    fn()
  }

  return (
    <>
      <style>{CSS}</style>
      <div
        className={['ncard', isActive ? 'ncard--active' : ''].filter(Boolean).join(' ')}
        onClick={onSelect}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onSelect()}
      >
        {/* Top row */}
        <div className="ncard-top">
          {note.isPinned && (
            <LucidePin className="ncard-pin-indicator" />
          )}
          <span className="ncard-title">{note.title || 'Untitled'}</span>

          <div className="ncard-actions">
            <button
              className={['ncard-btn', note.isPinned ? 'ncard-btn--pinned' : ''].filter(Boolean).join(' ')}
              onClick={(e) => stopProp(e, () => togglePin.mutate(note.id))}
              aria-label={note.isPinned ? 'Unpin' : 'Pin'}
              disabled={togglePin.isPending}
            >
              <LucidePin width={13} />
            </button>
            <button
              className="ncard-btn ncard-btn--edit"
              onClick={(e) => stopProp(e, () => handleEdit(null))}
              aria-label="Edit details"
            >
              <LucidePencil width={13} />
            </button>
            <button
              className="ncard-btn ncard-btn--delete"
              onClick={(e) => stopProp(e, () => setConfirmDelete(true))}
              aria-label="Delete"
            >
              <LucideTrash2 width={13} />
            </button>
          </div>
        </div>

        {/* Preview */}
        <p className="ncard-preview">{preview}</p>

        {/* Tags & meta */}
        <div className="ncard-footer">
          <div className="ncard-tags">
            {note.category && (
              <Badge variant="cyan" size="sm">{note.category.name}</Badge>
            )}
            {note.tags?.slice(0, 2).map((tag: any) => (
              <Badge key={tag.id} variant="default" size="sm">{tag.name}</Badge>
            ))}
            {note.tags && note.tags.length > 2 && (
              <span className="ncard-more">+{note.tags.length - 2}</span>
            )}
          </div>
          <ProjectBadge itemType="note" itemId={note.id} />
          <span className="ncard-date">
            {new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Delete confirm */}
      <Modal isOpen={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete note" size="sm">
        <div className="ncard-confirm">
          <p className="ncard-confirm-text">
            Delete <strong>{note.title || 'Untitled'}</strong>? This cannot be undone.
          </p>
          <div className="ncard-confirm-actions">
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button
              variant="danger"
              isLoading={deleteNote.isPending}
              onClick={() => deleteNote.mutate(note.id, { onSuccess: () => setConfirmDelete(false) })}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
      <MultiProjectEditWarning
        isOpen={isWarnOpen}
        projectNames={projectNames}
        onConfirm={confirmEdit}
        onCancel={cancelEdit}
      />
    </>
  )
}

const CSS = `
.ncard {
  display:        flex;
  flex-direction: column;
  gap:            6px;
  padding:        10px 12px;
  background:     var(--bg-elevated);
  border:         1px solid var(--border-subtle);
  border-radius:  var(--radius-md);
  cursor:         pointer;
  transition:     background var(--transition-fast), border-color var(--transition-fast);
  outline:        none;
  min-height:     44px;
}
.ncard:hover               { background: var(--bg-overlay); border-color: var(--border-default); }
.ncard--active             { background: var(--accent-muted); border-color: var(--accent-border); }
.ncard--active:hover       { background: var(--accent-muted); }
.ncard:focus-visible       { outline: 2px solid var(--border-focus); outline-offset: 1px; }

.ncard-top {
  display:     flex;
  align-items: center;
  gap:         6px;
}
.ncard-pin-indicator {
  width:       12px;
  height:      12px;
  color:       var(--cyan-400);
  flex-shrink: 0;
  transform:   rotate(45deg);
}
.ncard-title {
  flex:          1;
  font-size:     var(--text-sm);
  font-weight:   600;
  color:         var(--text-primary);
  white-space:   nowrap;
  overflow:      hidden;
  text-overflow: ellipsis;
}
.ncard--active .ncard-title { color: var(--cyan-200); }

.ncard-actions {
  display:     flex;
  align-items: center;
  gap:         2px;
  opacity:     0;
  transition:  opacity var(--transition-fast);
  flex-shrink: 0;
}
.ncard:hover .ncard-actions  { opacity: 1; }
.ncard--active .ncard-actions { opacity: 1; }

.ncard-btn {
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           24px;
  height:          24px;
  background:      transparent;
  border:          none;
  border-radius:   var(--radius-sm);
  color:           var(--text-tertiary);
  cursor:          pointer;
  transition:      background var(--transition-fast), color var(--transition-fast);
}
.ncard-btn:hover         { background: var(--bg-subtle); color: var(--text-primary); }
.ncard-btn--pinned       { color: var(--cyan-400); }
.ncard-btn--delete:hover { color: var(--danger); background: var(--danger-muted); }
.ncard-btn:disabled      { opacity: 0.5; pointer-events: none; }

.ncard-preview {
  font-size:            var(--text-xs);
  color:                var(--text-tertiary);
  line-height:          var(--leading-snug);
  display:              -webkit-box;
  -webkit-line-clamp:   2;
  -webkit-box-orient:   vertical;
  overflow:             hidden;
}
.ncard--active .ncard-preview { color: var(--cyan-700); }

.ncard-footer { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
.ncard-tags   { display: flex; flex-wrap: wrap; gap: 4px; flex: 1; min-width: 0; overflow: hidden; }
.ncard-more   { font-size: var(--text-xs); color: var(--text-tertiary); white-space: nowrap; }
.ncard-date   { font-size: var(--text-xs); color: var(--text-tertiary); white-space: nowrap; flex-shrink: 0; }

.ncard-confirm         { display: flex; flex-direction: column; gap: 20px; }
.ncard-confirm-text    { font-size: var(--text-sm); color: var(--text-secondary); line-height: var(--leading-relaxed); }
.ncard-confirm-text strong { color: var(--text-primary); }
.ncard-confirm-actions { display: flex; justify-content: flex-end; gap: 8px; }
`