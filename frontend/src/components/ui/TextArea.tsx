import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { Icon } from '@iconify/react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?:    string
  hint?:     string
  error?:    string
  optional?: boolean
  mono?:     boolean   // monospace font for code-like content
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, optional = false, mono = false, className = '', id, ...props }, ref) => {
    const fieldId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <>
        <style>{CSS}</style>
        <div className="ta-field">
          {label && (
            <label className="ta-label" htmlFor={fieldId}>
              {label}
              {optional && <span className="ta-optional">optional</span>}
            </label>
          )}

          <textarea
            ref={ref}
            id={fieldId}
            className={[
              'ta-input',
              error ? 'ta-input--error' : '',
              mono  ? 'ta-input--mono'  : '',
              className,
            ].filter(Boolean).join(' ')}
            {...props}
          />

          {error ? (
            <p className="ta-error">
              <Icon icon="lucide:circle-alert" width={12} />
              {error}
            </p>
          ) : hint ? (
            <p className="ta-hint">{hint}</p>
          ) : null}
        </div>
      </>
    )
  }
)

Textarea.displayName = 'Textarea'
export default Textarea

const CSS = `
.ta-field {
  display:        flex;
  flex-direction: column;
  gap:            6px;
  width:          100%;
}
.ta-label {
  font-size:   var(--text-sm);
  font-weight: 500;
  color:       var(--text-primary);
  display:     flex;
  align-items: center;
  gap:         6px;
}
.ta-optional {
  font-size:   var(--text-xs);
  font-weight: 400;
  color:       var(--text-tertiary);
}
.ta-input {
  width:         100%;
  min-height:    96px;
  padding:       10px 12px;
  background:    var(--bg-subtle);
  border:        1px solid var(--border-default);
  border-radius: var(--radius-md);
  color:         var(--text-primary);
  font-family:   var(--font-sans);
  font-size:     var(--text-sm);
  line-height:   var(--leading-relaxed);
  resize:        vertical;
  outline:       none;
  transition:    border-color var(--transition-fast),
                 box-shadow   var(--transition-fast),
                 background   var(--transition-fast);
}
.ta-input::placeholder { color: var(--text-tertiary); }
.ta-input:hover:not(:disabled) { border-color: var(--border-strong); }
.ta-input:focus {
  border-color: var(--border-focus);
  background:   var(--bg-elevated);
  box-shadow:   0 0 0 3px var(--accent-muted);
}
.ta-input:disabled { opacity: 0.5; cursor: not-allowed; }
.ta-input--error {
  border-color: var(--danger);
}
.ta-input--error:focus {
  box-shadow: 0 0 0 3px var(--danger-muted);
}
.ta-input--mono { font-family: var(--font-mono); font-size: var(--text-sm); }

.ta-error {
  display:     flex;
  align-items: center;
  gap:         4px;
  font-size:   var(--text-xs);
  color:       var(--danger);
  font-weight: 500;
}
.ta-hint {
  font-size: var(--text-xs);
  color:     var(--text-tertiary);
}
`