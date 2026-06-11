import { type ReactNode } from "react";
import { LucidePencil, LucideTrash2 } from "@/Icons/Icons";

interface ActionButtonsProps {
  onEdit: () => void;
  onDelete: () => void;
  /** Optional extra buttons prepended before Edit */
  extra?: ReactNode;
}

/**
 * Standard Edit + Delete icon buttons for card footers.
 * Used in LinkCard, NoteCard, SnippetCard, InfraCard.
 */
export default function ActionButtons({ onEdit, onDelete, extra }: ActionButtonsProps) {
  return (
    <>
      <style>{CSS}</style>
      <div className="ab-group">
        {extra}
        <button
          className="ab-btn"
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          aria-label="Edit"
          type="button"
        >
          <LucidePencil width={14} />
        </button>
        <button
          className="ab-btn ab-btn--danger"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          aria-label="Delete"
          type="button"
        >
          <LucideTrash2 width={14} />
        </button>
      </div>
    </>
  );
}

const CSS = `
.ab-group { display: flex; align-items: center; gap: 2px; }
.ab-btn {
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           36px;
  height:          36px;
  background:      transparent;
  border:          1px solid transparent;
  border-radius:   var(--radius-sm);
  color:           var(--text-tertiary);
  cursor:          pointer;
  transition:      background var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast);
}
@media (hover: none) { .ab-btn { width: 40px; height: 40px; } }
.ab-btn:hover          { background: var(--bg-overlay); border-color: var(--border-default); color: var(--text-primary); }
.ab-btn--danger:hover  { background: var(--danger-muted); border-color: rgba(239,68,68,0.2); color: var(--danger); }
`;
