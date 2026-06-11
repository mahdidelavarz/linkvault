import { type ReactNode } from "react";

interface CardGridProps {
  children: ReactNode;
  /** Min card width in px — defaults to 300 */
  minCardWidth?: number;
  /** data-density attribute drives compact/comfortable CSS variants */
  density?: "comfortable" | "compact";
  className?: string;
}

/**
 * Responsive CSS grid for module card layouts.
 * Standardises the grid across Links, Snippets, Prompts, Infrastructure.
 */
export default function CardGrid({ children, minCardWidth = 300, density = "comfortable", className = "" }: CardGridProps) {
  return (
    <>
      <style>{CSS}</style>
      <div
        className={`card-grid ${className}`.trim()}
        data-density={density}
        style={{ "--cg-min": `${minCardWidth}px` } as React.CSSProperties}
      >
        {children}
      </div>
    </>
  );
}

const CSS = `
.card-grid {
  display:               grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--cg-min, 300px), 1fr));
  gap:                   16px;
}
.card-grid[data-density="compact"] {
  --cg-min:  220px;
  gap:       10px;
}
@media (max-width: 639px) {
  .card-grid { grid-template-columns: 1fr; gap: 10px; }
}
`;
