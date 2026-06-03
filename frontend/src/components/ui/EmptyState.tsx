import { type ComponentType, type ReactNode, type SVGProps } from "react";
import Button from "./Button";
import { LucideSearchX } from "@/Icons/Icons";

interface EmptyStateProps {
  /** Icon shown when there is no content at all */
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  subtitle: string;
  action?: ReactNode;
  /** When true, switches to the "no results for filter" variant */
  hasFilters?: boolean;
  filteredTitle?: string;
  filteredSubtitle?: string;
  filteredAction?: ReactNode;
  onClearFilters?: () => void;
}

/**
 * Centred empty / no-results state used by every module page.
 * Pass both a default state (no content) and a filtered state (no results).
 */
export default function EmptyState({
  icon: Icon,
  title,
  subtitle,
  action,
  hasFilters,
  filteredTitle = "No results found",
  filteredSubtitle = "Try adjusting your filters",
  filteredAction,
  onClearFilters,
}: EmptyStateProps) {
  const showFiltered = hasFilters;
  const displayTitle    = showFiltered ? filteredTitle    : title;
  const displaySubtitle = showFiltered ? filteredSubtitle : subtitle;
  const displayAction   = showFiltered
    ? (filteredAction ?? (onClearFilters && <Button variant="secondary" onClick={onClearFilters}>Clear filters</Button>))
    : action;

  return (
    <>
      <style>{CSS}</style>
      <div className="es-wrap">
        <div className="es-icon">
          {showFiltered ? <LucideSearchX width={28} /> : <Icon width={28} />}
        </div>
        <p className="es-title">{displayTitle}</p>
        <p className="es-subtitle">{displaySubtitle}</p>
        {displayAction}
      </div>
    </>
  );
}

const CSS = `
.es-wrap {
  display:         flex;
  flex-direction:  column;
  align-items:     center;
  justify-content: center;
  gap:             12px;
  padding:         64px 24px;
  background:      var(--bg-surface);
  border:          1px solid var(--border-default);
  border-radius:   var(--radius-lg);
  text-align:      center;
}
.es-icon {
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           56px;
  height:          56px;
  background:      var(--bg-overlay);
  border:          1px solid var(--border-default);
  border-radius:   var(--radius-lg);
  color:           var(--text-tertiary);
}
.es-title    { font-size: var(--text-lg); font-weight: 600; color: var(--text-primary); }
.es-subtitle { font-size: var(--text-sm); color: var(--text-tertiary); }
`;
