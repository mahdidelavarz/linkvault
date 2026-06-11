import { LucideChevronDown } from "@/Icons/Icons";

export interface SortOption {
  value: string;
  label: string;
}

interface SortSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SortOption[];
}

/**
 * "Sort by" dropdown for module filter bars.
 * Pass options as { value, label } pairs.
 */
export default function SortSelect({ value, onChange, options }: SortSelectProps) {
  return (
    <>
      <style>{CSS}</style>
      <div className="ssort-wrap">
        <select
          className="ssort-select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Sort by"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <LucideChevronDown className="ssort-chevron" />
      </div>
    </>
  );
}

const CSS = `
.ssort-wrap { position: relative; display: flex; align-items: center; flex-shrink: 0; }
.ssort-chevron { position: absolute; right: 8px; width: 12px; height: 12px; color: var(--text-tertiary); pointer-events: none; }
.ssort-select {
  height:          34px;
  padding:         0 28px 0 10px;
  background:      var(--bg-subtle);
  border:          1px solid var(--border-default);
  border-radius:   var(--radius-md);
  color:           var(--text-primary);
  font-family:     var(--font-sans);
  font-size:       var(--text-sm);
  outline:         none;
  cursor:          pointer;
  appearance:      none;
  -webkit-appearance: none;
  transition:      border-color var(--transition-fast);
}
.ssort-select:focus { border-color: var(--border-focus); }
.ssort-select option { background: var(--bg-elevated); }
`;
