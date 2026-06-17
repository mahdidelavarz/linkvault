"use client";

import { type ComponentType, type SVGProps } from "react";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  /** Optional smaller line under the label */
  description?: string;
  /** Optional leading icon next to the label */
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  iconColor?: string;
}

/**
 * Single unified on/off toggle. Replaces the three bespoke "favorite"
 * checkboxes across the entity forms.
 */
export default function Switch({
  checked,
  onChange,
  label,
  description,
  icon: Icon,
  iconColor,
}: SwitchProps) {
  return (
    <>
      <style>{CSS}</style>
      <label className="sw">
        <span className="sw-text">
          <span className="sw-label">
            {Icon && <Icon width={14} style={iconColor ? { color: iconColor } : undefined} />}
            {label}
          </span>
          {description && <span className="sw-desc">{description}</span>}
        </span>

        <input
          type="checkbox"
          className="sw-input"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className={["sw-track", checked ? "sw-track--on" : ""].filter(Boolean).join(" ")}>
          <span className="sw-thumb" />
        </span>
      </label>
    </>
  );
}

const CSS = `
.sw {
  display:        flex;
  align-items:    center;
  justify-content: space-between;
  gap:            12px;
  cursor:         pointer;
  user-select:    none;
  min-height:     44px;
}
.sw-text  { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.sw-label {
  display:     flex;
  align-items: center;
  gap:         6px;
  font-size:   var(--text-sm);
  font-weight: 500;
  color:       var(--text-primary);
}
.sw-desc { font-size: var(--text-xs); color: var(--text-tertiary); }

.sw-input { position: absolute; opacity: 0; pointer-events: none; }

.sw-track {
  position:      relative;
  flex-shrink:   0;
  width:         40px;
  height:        24px;
  border-radius: var(--radius-full);
  background:    var(--bg-subtle);
  border:        1px solid var(--border-default);
  transition:    background var(--transition-fast), border-color var(--transition-fast);
}
.sw-track--on { background: var(--accent); border-color: var(--accent); }

.sw-thumb {
  position:      absolute;
  top:           2px;
  left:          2px;
  width:         18px;
  height:        18px;
  border-radius: var(--radius-full);
  background:    #fff;
  box-shadow:    var(--shadow-sm);
  transition:    transform var(--transition-base);
}
.sw-track--on .sw-thumb { transform: translateX(16px); }

.sw-input:focus-visible + .sw-track {
  box-shadow: 0 0 0 3px var(--accent-muted);
}
`;
