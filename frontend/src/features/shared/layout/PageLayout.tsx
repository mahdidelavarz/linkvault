import { type ReactNode } from "react";

interface PageLayoutProps {
  /** Fixed top area — PageHeader, filter bar, select bar, etc. */
  top: ReactNode;
  /** Scrollable body — card grid, list, or any inner layout */
  children: ReactNode;
  /**
   * fullHeight: body is overflow:hidden (not scrollable itself).
   * Use for pages like Notes that manage their own internal scroll.
   * Default false: body scrolls with overflow-y:auto (card list pages).
   */
  fullHeight?: boolean;
}

/**
 * Pins the top section (header + filters) and lets only the content
 * below it scroll. Must be a direct child of .main-content which is
 * overflow:hidden + display:flex + flex-direction:column.
 */
export default function PageLayout({ top, children, fullHeight = false }: PageLayoutProps) {
  return (
    <>
      <style>{CSS}</style>
      <div className="pl2">
        <div className="pl2-top">{top}</div>
        <div className={fullHeight ? "pl2-body pl2-body--fill" : "pl2-body"}>
          {children}
        </div>
      </div>
    </>
  );
}

const CSS = `
.pl2 {
  display:        flex;
  flex-direction: column;
  flex:           1;
  min-height:     0;
  overflow:       hidden;
}

/* Fixed — never scrolls */
.pl2-top {
  flex-shrink:    0;
  display:        flex;
  flex-direction: column;
  gap:            10px;
  padding:        15px 24px 10px;
  background:     var(--bg-base);
}

/* Scrollable cards (default) */
.pl2-body {
  flex:           1;
  min-height:     0;
  overflow-y:     auto;
  padding:        0 24px 24px;
  display:        flex;
  flex-direction: column;
  gap:            10px;
}

/* Full-height inner layout (Notes, API client) — no outer scroll */
.pl2-body--fill {
  overflow:       hidden;
  padding:        0;
}

@media (max-width: 639px) {
  .pl2-top  { padding: 12px 16px 10px; }
  .pl2-body { padding: 0 16px 16px; }
  .pl2-body.pl2-body--fill { padding: 0; }
}
@media (max-width: 479px) {
  .pl2-top  { padding: 10px 12px 8px; }
  .pl2-body { padding: 0 12px 12px; }
  .pl2-body.pl2-body--fill { padding: 0; }
}
`;
