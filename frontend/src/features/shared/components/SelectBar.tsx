import { LucideCheck, LucideX } from "@/Icons/Icons";

interface SelectBarProps {
  selectedCount: number;
  totalCount: number;
  isAllSelected: boolean;
  onToggleAll: () => void;
  onCancel: () => void;
}

/**
 * Replaces the filter bar when bulk-select mode is active.
 * Provides select-all toggle, count, and cancel.
 */
export default function SelectBar({
  selectedCount,
  totalCount,
  isAllSelected,
  onToggleAll,
  onCancel,
}: SelectBarProps) {
  return (
    <>
      <style>{CSS}</style>
      <div className="sb-bar">
        <button className="sb-all-btn" onClick={onToggleAll} aria-label={isAllSelected ? "Deselect all" : "Select all"} type="button">
          <span className={["sb-check", isAllSelected ? "sb-check--on" : ""].filter(Boolean).join(" ")}>
            {isAllSelected && <LucideCheck width={10} />}
          </span>
          <span className="sb-all-label">{isAllSelected ? "Deselect all" : "Select all"}</span>
        </button>

        <span className="sb-count">
          {selectedCount > 0 ? `${selectedCount} selected` : `0 of ${totalCount}`}
        </span>

        <button className="sb-cancel" onClick={onCancel} type="button">
          <LucideX width={14} />
          Cancel
        </button>
      </div>
    </>
  );
}

const CSS = `
.sb-bar {
  display:       flex;
  align-items:   center;
  gap:           8px;
  flex-wrap:     wrap;
  padding:       10px 16px;
  background:    var(--bg-surface);
  border:        1px solid var(--accent-border);
  border-radius: var(--radius-lg);
  animation:     fadeIn 0.15s ease;
}
.sb-all-btn {
  display:     flex;
  align-items: center;
  gap:         8px;
  background:  transparent;
  border:      none;
  cursor:      pointer;
  padding:     4px 0;
  color:       var(--text-secondary);
  font-size:   var(--text-sm);
  font-family: var(--font-sans);
}
.sb-check {
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           16px;
  height:          16px;
  min-width:       16px;
  border:          1.5px solid var(--border-strong);
  border-radius:   var(--radius-sm);
  background:      var(--bg-subtle);
  transition:      background var(--transition-fast), border-color var(--transition-fast);
}
.sb-check--on { background: var(--accent); border-color: var(--accent); color: #fff; }
.sb-all-label { white-space: nowrap; }

.sb-count {
  flex:      1;
  font-size: var(--text-sm);
  color:     var(--text-tertiary);
  min-width: 0;
}
.sb-cancel {
  display:       flex;
  align-items:   center;
  gap:           5px;
  height:        32px;
  padding:       0 12px;
  background:    transparent;
  border:        1px solid var(--border-default);
  border-radius: var(--radius-md);
  color:         var(--text-secondary);
  font-size:     var(--text-sm);
  font-family:   var(--font-sans);
  cursor:        pointer;
  white-space:   nowrap;
  transition:    background var(--transition-fast), color var(--transition-fast);
}
.sb-cancel:hover { background: var(--bg-overlay); color: var(--text-primary); }
`;
