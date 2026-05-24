import { LucideCircleAlert } from "@/Icons/Icons";
import {
  ComponentType,
  forwardRef,
  SVGProps,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: ComponentType<SVGProps<SVGSVGElement>>;
  rightIcon?: ComponentType<SVGProps<SVGSVGElement>>;
  rightNode?: ReactNode;
  optional?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      hint,
      error,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      rightNode,
      optional = false,
      className = "",
      id,
      ...props
    },
    ref,
  ) => {
    const inputId =
      id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const hasRight = RightIcon || rightNode;

    return (
      <>
        <style>{CSS}</style>
        <div className="field">
          {label && (
            <label className="field-label" htmlFor={inputId}>
              {label}
              {optional && <span className="field-optional">optional</span>}
            </label>
          )}

          <div
            className={["field-wrap", error ? "field-wrap--error" : ""]
              .filter(Boolean)
              .join(" ")}
          >
            {LeftIcon && <LeftIcon className="field-icon field-icon--left" />}

            <input
              ref={ref}
              id={inputId}
              className={[
                "field-input",
                LeftIcon ? "field-input--pl" : "",
                hasRight ? "field-input--pr" : "",
                className,
              ]
                .filter(Boolean)
                .join(" ")}
              {...props}
            />

            {rightNode ? (
              <div className="field-right">{rightNode}</div>
            ) : RightIcon ? (
              <RightIcon className="field-icon field-icon--right" />
            ) : null}
          </div>

          {error ? (
            <p className="field-error">
              <LucideCircleAlert width={12} />
              {error}
            </p>
          ) : hint ? (
            <p className="field-hint">{hint}</p>
          ) : null}
        </div>
      </>
    );
  },
);

Input.displayName = "Input";
export default Input;

const CSS = `
.field {
  display:        flex;
  flex-direction: column;
  gap:            6px;
  width:          100%;
}

.field-label {
  font-size:   var(--text-sm);
  font-weight: 500;
  color:       var(--text-primary);
  display:     flex;
  align-items: center;
  gap:         6px;
}
.field-optional {
  font-size:   var(--text-xs);
  font-weight: 400;
  color:       var(--text-tertiary);
}

.field-wrap {
  position: relative;
  display:  flex;
  align-items: center;
}

.field-input {
  width:            100%;
  height:           36px;
  padding:          0 12px;
  background:       var(--bg-subtle);
  border:           1px solid var(--border-default);
  border-radius:    var(--radius-md);
  color:            var(--text-primary);
  font-family:      var(--font-sans);
  font-size:        var(--text-sm);
  line-height:      1;
  transition:       border-color var(--transition-fast),
                    box-shadow   var(--transition-fast),
                    background   var(--transition-fast);
  outline:          none;
}
.field-input::placeholder { color: var(--text-tertiary); }
.field-input:hover:not(:disabled) {
  border-color: var(--border-strong);
}
.field-input:focus {
  border-color: var(--border-focus);
  background:   var(--bg-elevated);
  box-shadow:   0 0 0 3px var(--accent-muted);
}
.field-input:disabled {
  opacity: 0.5;
  cursor:  not-allowed;
}
.field-input--pl { padding-left: 36px; }
.field-input--pr { padding-right: 36px; }

.field-wrap--error .field-input {
  border-color: var(--danger);
}
.field-wrap--error .field-input:focus {
  box-shadow: 0 0 0 3px var(--danger-muted);
}

.field-icon {
  position:  absolute;
  width:     15px;
  height:    15px;
  color:     var(--text-tertiary);
  flex-shrink: 0;
  pointer-events: none;
}
.field-icon--left  { left:  11px; }
.field-icon--right { right: 11px;}

.field-right {
  position: absolute;
  right:    6px;
  display:  flex;
  align-items: center;
}

.field-error {
  display:     flex;
  align-items: center;
  gap:         4px;
  font-size:   var(--text-xs);
  color:       var(--danger);
  font-weight: 500;
}
.field-hint {
  font-size: var(--text-xs);
  color:     var(--text-tertiary);
}
`;
