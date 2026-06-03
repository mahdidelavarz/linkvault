import { LucideStar, LucideTrash2 } from "@/Icons/Icons";

interface BulkActionBarProps {
  count: number;
  isProcessing?: boolean;
  onFavorite?: () => void;
  onDelete: () => void;
}

/**
 * Fixed floating bar that appears when items are selected in bulk-select mode.
 * Used in Links — ready to plug in to Snippets, Prompts, Infrastructure.
 */
export default function BulkActionBar({ count, isProcessing, onFavorite, onDelete }: BulkActionBarProps) {
  if (count === 0) return null;

  return (
    <>
      <style>{CSS}</style>
      <div className="bab-bar" role="toolbar" aria-label="Bulk actions">
        <span className="bab-count">
          {count} item{count !== 1 ? "s" : ""} selected
        </span>
        <div className="bab-actions">
          {onFavorite && (
            <button
              className="bab-btn bab-btn--fav"
              onClick={onFavorite}
              disabled={isProcessing}
              aria-label="Favorite selected"
              type="button"
            >
              <LucideStar width={15} />
              <span className="bab-label">Favorite</span>
            </button>
          )}
          <button
            className="bab-btn bab-btn--delete"
            onClick={onDelete}
            disabled={isProcessing}
            aria-label={`Delete ${count} items`}
            type="button"
          >
            {isProcessing ? <span className="bab-spinner" /> : <LucideTrash2 width={15} />}
            <span className="bab-label">Delete {count}</span>
          </button>
        </div>
      </div>
    </>
  );
}

const CSS = `
.bab-bar {
  position:        fixed;
  bottom:          0;
  left:            50%;
  transform:       translateX(-50%);
  width:           min(480px, calc(100vw - 32px));
  display:         flex;
  align-items:     center;
  justify-content: space-between;
  gap:             12px;
  padding:         12px 16px;
  padding-bottom:  calc(12px + env(safe-area-inset-bottom));
  background:      var(--bg-elevated);
  border:          1px solid var(--border-strong);
  border-radius:   var(--radius-xl) var(--radius-xl) 0 0;
  box-shadow:      var(--shadow-lg);
  z-index:         150;
  animation:       bab-in 0.2s ease;
}
@media (max-width: 767px) {
  .bab-bar { bottom: 60px; border-radius: var(--radius-xl); width: calc(100vw - 24px); }
}
@keyframes bab-in {
  from { transform: translateX(-50%) translateY(100%); opacity: 0; }
  to   { transform: translateX(-50%) translateY(0);    opacity: 1; }
}

.bab-count   { font-size: var(--text-sm); font-weight: 500; color: var(--text-primary); white-space: nowrap; }
.bab-actions { display: flex; align-items: center; gap: 8px; }

.bab-btn {
  display:       flex;
  align-items:   center;
  gap:           6px;
  height:        36px;
  padding:       0 14px;
  border-radius: var(--radius-md);
  border:        1px solid transparent;
  font-size:     var(--text-sm);
  font-family:   var(--font-sans);
  font-weight:   500;
  cursor:        pointer;
  white-space:   nowrap;
  transition:    background var(--transition-fast), opacity var(--transition-fast);
}
.bab-btn:disabled { opacity: 0.6; pointer-events: none; }

.bab-btn--fav    { background: var(--warning-muted); border-color: rgba(245,158,11,0.25); color: #d97706; }
.bab-btn--fav:hover { background: rgba(245,158,11,0.2); }

.bab-btn--delete { background: var(--danger-muted); border-color: rgba(239,68,68,0.25); color: var(--danger); }
.bab-btn--delete:hover { background: rgba(239,68,68,0.15); }

@media (max-width: 360px) {
  .bab-label { display: none; }
  .bab-btn   { padding: 0 12px; }
}

.bab-spinner {
  display:       block;
  width:         14px;
  height:        14px;
  border:        2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation:     bab-spin 0.6s linear infinite;
}
@keyframes bab-spin { to { transform: rotate(360deg); } }
`;
