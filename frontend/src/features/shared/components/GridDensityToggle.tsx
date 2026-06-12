import { type Density } from "@/features/shared/hooks/useGridDensity";

interface GridDensityToggleProps {
  density: Density;
  onChange: (d: Density) => void;
}

/**
 * Two-state toggle: Comfortable (large cards) ↔ Compact (small cards).
 */
export default function GridDensityToggle({ density, onChange }: GridDensityToggleProps) {
  return (
    <>
      <style>{CSS}</style>
      <div className="gdt-wrap" role="group" aria-label="Grid density">
        <button
          className={`gdt-btn ${density === "comfortable" ? "gdt-btn--active" : ""}`}
          onClick={() => onChange("comfortable")}
          aria-label="Comfortable view"
          aria-pressed={density === "comfortable"}
          type="button"
        >
          {/* 2-column grid icon */}
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <rect x="1" y="1" width="5.5" height="5.5" rx="1" fill="currentColor" opacity={density === "comfortable" ? 1 : 0.4} />
            <rect x="8.5" y="1" width="5.5" height="5.5" rx="1" fill="currentColor" opacity={density === "comfortable" ? 1 : 0.4} />
            <rect x="1" y="8.5" width="5.5" height="5.5" rx="1" fill="currentColor" opacity={density === "comfortable" ? 1 : 0.4} />
            <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1" fill="currentColor" opacity={density === "comfortable" ? 1 : 0.4} />
          </svg>
        </button>
        <button
          className={`gdt-btn ${density === "compact" ? "gdt-btn--active" : ""}`}
          onClick={() => onChange("compact")}
          aria-label="Compact view"
          aria-pressed={density === "compact"}
          type="button"
        >
          {/* 3-column grid icon */}
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <rect x="1"   y="1" width="3.5" height="3.5" rx="0.5" fill="currentColor" opacity={density === "compact" ? 1 : 0.4} />
            <rect x="5.75" y="1" width="3.5" height="3.5" rx="0.5" fill="currentColor" opacity={density === "compact" ? 1 : 0.4} />
            <rect x="10.5" y="1" width="3.5" height="3.5" rx="0.5" fill="currentColor" opacity={density === "compact" ? 1 : 0.4} />
            <rect x="1"   y="5.75" width="3.5" height="3.5" rx="0.5" fill="currentColor" opacity={density === "compact" ? 1 : 0.4} />
            <rect x="5.75" y="5.75" width="3.5" height="3.5" rx="0.5" fill="currentColor" opacity={density === "compact" ? 1 : 0.4} />
            <rect x="10.5" y="5.75" width="3.5" height="3.5" rx="0.5" fill="currentColor" opacity={density === "compact" ? 1 : 0.4} />
            <rect x="1"   y="10.5" width="3.5" height="3.5" rx="0.5" fill="currentColor" opacity={density === "compact" ? 1 : 0.4} />
            <rect x="5.75" y="10.5" width="3.5" height="3.5" rx="0.5" fill="currentColor" opacity={density === "compact" ? 1 : 0.4} />
            <rect x="10.5" y="10.5" width="3.5" height="3.5" rx="0.5" fill="currentColor" opacity={density === "compact" ? 1 : 0.4} />
          </svg>
        </button>
      </div>
    </>
  );
}

const CSS = `
.gdt-wrap {
  display:       flex;
  align-items:   center;
  gap:           2px;
  padding:       2px;
  background:    var(--bg-overlay);
  border:        1px solid var(--border-default);
  border-radius: var(--radius-md);
}
.gdt-btn {
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
.gdt-btn:hover     { color: var(--text-primary); }
.gdt-btn--active   { background: var(--bg-surface); color: var(--text-primary); box-shadow: var(--shadow-sm); }
`;
