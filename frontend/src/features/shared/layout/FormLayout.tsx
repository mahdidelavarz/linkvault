import { type FormHTMLAttributes, type ReactNode } from "react";

interface FormLayoutProps extends FormHTMLAttributes<HTMLFormElement> {
  /** Sticky footer — pass your Cancel + Submit buttons */
  footer: ReactNode;
  children: ReactNode;
  /** Default "end" right-aligns buttons. Use "between" for Cancel-left / Submit-right layout. */
  footerJustify?: "end" | "between";
  /**
   * Compact mode for forms already inside a Modal.
   * Removes the 80dvh wrapper and scroll area — the modal handles containment.
   */
  compact?: boolean;
}

/**
 * Standard modal form with scrollable content area + sticky footer.
 * - Default: 80dvh tall, scrollable content, sticky footer (for standalone modals)
 * - compact: height auto, no scroll, flush footer (for forms inside a Modal component)
 */
export default function FormLayout({
  footer,
  children,
  footerJustify = "end",
  compact = false,
  ...formProps
}: FormLayoutProps) {
  if (compact) {
    return (
      <>
        <style>{CSS}</style>
        <form
          className={["fl-compact-form", footerJustify === "between" ? "fl-footer--between" : ""].filter(Boolean).join(" ")}
          {...formProps}
        >
          <div className="fl-compact-body">{children}</div>
          <div className={["fl-compact-footer", footerJustify === "between" ? "fl-footer--between" : ""].filter(Boolean).join(" ")}>
            {footer}
          </div>
        </form>
      </>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="fl-wrapper">
        <form className="fl-form" {...formProps}>
          <div className="fl-content">{children}</div>
          <div className={["fl-footer", footerJustify === "between" ? "fl-footer--between" : ""].filter(Boolean).join(" ")}>
            {footer}
          </div>
        </form>
      </div>
    </>
  );
}

const CSS = `
/* ─── Full-height mode (standalone modal) ─── */
.fl-wrapper {
  height:         80dvh;
  display:        flex;
  flex-direction: column;
}
.fl-form {
  display:        flex;
  flex-direction: column;
  height:         100%;
  overflow:       hidden;
}
.fl-content {
  flex:       1;
  overflow-y: auto;
  padding:    0 16px;
}
.fl-footer {
  display:         flex;
  align-items:     center;
  justify-content: flex-end;
  gap:             8px;
  padding:         10px 16px;
  background:      var(--bg-subtle);
  border-top:      1px solid var(--border-subtle);
  border-radius:   20px;
  flex-shrink:     0;
  position:        sticky;
  bottom:          0;
  z-index:         10;
}
.fl-footer--between { justify-content: space-between; }
@media (max-width: 479px) {
  .fl-footer { flex-direction: column-reverse; align-items: stretch; }
  .fl-footer > * { width: 100%; }
}

/* ─── Compact mode (inside a Modal) ─── */
.fl-compact-form {
  display:        flex;
  flex-direction: column;
  gap:            0;
}
.fl-compact-body {
  display:        flex;
  flex-direction: column;
  gap:            14px;
  padding-bottom: 4px;
}
.fl-compact-footer {
  display:         flex;
  align-items:     center;
  justify-content: flex-end;
  gap:             8px;
  padding-top:     16px;
  border-top:      1px solid var(--border-subtle);
  margin-top:      4px;
}
@media (max-width: 479px) {
  .fl-compact-footer { flex-direction: column-reverse; align-items: stretch; }
  .fl-compact-footer > * { width: 100%; }
}
`;
