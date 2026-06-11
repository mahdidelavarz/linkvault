import { type ComponentType, type ReactNode, type SVGProps } from "react";

interface FormSectionProps {
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  /** Small grey hint after the title, e.g. "optional" */
  hint?: string;
  children: ReactNode;
}

/**
 * Titled section inside a FormLayout — icon + label row, divider, and a
 * flex-column fields area with 12px gap.
 * Replaces .lform-section / .sform-section / .iform-section patterns.
 */
export default function FormSection({ icon: Icon, title, hint, children }: FormSectionProps) {
  return (
    <>
      <style>{CSS}</style>
      <div className="fsec">
        <p className="fsec-title">
          {Icon && <Icon width={13} />}
          {title}
          {hint && <span className="fsec-hint">{hint}</span>}
        </p>
        <div className="fsec-fields">{children}</div>
      </div>
    </>
  );
}

const CSS = `
.fsec {
  padding:       16px 0;
  border-bottom: 1px solid var(--border-subtle);
}
.fsec:last-of-type { border-bottom: none; }

.fsec-title {
  display:        flex;
  align-items:    center;
  gap:            6px;
  font-size:      var(--text-xs);
  font-weight:    600;
  color:          var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom:  14px;
}
.fsec-hint {
  font-size:      var(--text-xs);
  font-weight:    400;
  color:          var(--text-tertiary);
  text-transform: none;
  letter-spacing: 0;
  margin-left:    2px;
}
.fsec-fields {
  display:        flex;
  flex-direction: column;
  gap:            12px;
}
`;
