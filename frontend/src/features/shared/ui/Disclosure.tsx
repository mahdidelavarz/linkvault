"use client";

import { useState, type ReactNode, type ComponentType, type SVGProps } from "react";
import { LucideChevronDown } from "@/Icons/Icons";

interface DisclosureProps {
  /** Heading shown on the toggle row */
  title: string;
  /** Optional muted hint after the title, e.g. "category · tags · favorite" */
  summary?: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  defaultOpen?: boolean;
  children: ReactNode;
}

/**
 * Collapsible "More details" section used to keep optional fields out of the
 * way while essentials stay front-and-centre. Animates open/close via a
 * grid-rows trick so it works with dynamic content height.
 */
export default function Disclosure({
  title,
  summary,
  icon: Icon,
  defaultOpen = false,
  children,
}: DisclosureProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <>
      <style>{CSS}</style>
      <div className={["disc", open ? "disc--open" : ""].filter(Boolean).join(" ")}>
        <button
          type="button"
          className="disc-toggle"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {Icon && <Icon width={14} className="disc-lead" />}
          <span className="disc-title">{title}</span>
          {summary && !open && <span className="disc-summary">{summary}</span>}
          <LucideChevronDown width={16} className="disc-chevron" />
        </button>

        <div className="disc-region" role="region">
          <div className="disc-region-inner">
            <div className="disc-body">{children}</div>
          </div>
        </div>
      </div>
    </>
  );
}

const CSS = `
.disc {
  border:        1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  background:    var(--bg-surface);
  overflow:      hidden;
  transition:    border-color var(--transition-fast);
}
.disc--open { border-color: var(--border-default); }

.disc-toggle {
  display:     flex;
  align-items: center;
  gap:         8px;
  width:       100%;
  min-height:  48px;
  padding:     0 14px;
  background:  transparent;
  border:      none;
  cursor:      pointer;
  color:       var(--text-primary);
  font-family: var(--font-sans);
  text-align:  left;
}
.disc-toggle:hover { background: var(--bg-overlay); }
.disc-lead    { color: var(--text-tertiary); flex-shrink: 0; }
.disc-title   { font-size: var(--text-sm); font-weight: 600; }
.disc-summary {
  flex:          1;
  min-width:     0;
  font-size:     var(--text-xs);
  color:         var(--text-tertiary);
  white-space:   nowrap;
  overflow:      hidden;
  text-overflow: ellipsis;
}
.disc-chevron {
  margin-left: auto;
  color:       var(--text-tertiary);
  flex-shrink: 0;
  transition:  transform var(--transition-base);
}
.disc--open .disc-chevron { transform: rotate(180deg); }

/* grid-rows 0fr -> 1fr gives a smooth height animation for dynamic content */
.disc-region {
  display:               grid;
  grid-template-rows:    0fr;
  transition:            grid-template-rows var(--transition-base);
}
.disc--open .disc-region { grid-template-rows: 1fr; }
.disc-region-inner { overflow: hidden; min-height: 0; }
.disc-body {
  display:        flex;
  flex-direction: column;
  gap:            14px;
  padding:        4px 14px 16px;
  border-top:     1px solid var(--border-subtle);
}
`;
