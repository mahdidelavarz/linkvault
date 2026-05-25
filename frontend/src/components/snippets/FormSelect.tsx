// Reusable styled select used across SnippetForm and filters

import { LucideChevronDown, LucideCircleAlert } from '@/Icons/Icons';
import type { ComponentType, SelectHTMLAttributes, SVGProps } from 'react'

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?:    string
  optional?: boolean
  leftIcon?: ComponentType<SVGProps<SVGSVGElement>>;
  error?:    string
}

export default function FormSelect({
  label, optional, leftIcon : LeftIcon, error, children, className = '', ...props
}: FormSelectProps) {
  return (
    <>
      <style>{CSS}</style>
      <div className="fselect-wrap">
        {label && (
          <label className="fselect-label">
            {label}
            {optional && <span className="fselect-optional">optional</span>}
          </label>
        )}
        <div className="fselect-inner">
          {LeftIcon && <LeftIcon className="fselect-left-icon" />}
          <select
            className={[
              'fselect',
              LeftIcon  ? 'fselect--pl' : '',
              error     ? 'fselect--error' : '',
              className,
            ].filter(Boolean).join(' ')}
            {...props}
          >
            {children}
          </select>
          <LucideChevronDown className="fselect-chevron" />
        </div>
        {error && (
          <p className="fselect-error">
            <LucideCircleAlert width={12} />{error}
          </p>
        )}
      </div>
    </>
  )
}

const CSS = `
.fselect-wrap  { display: flex; flex-direction: column; gap: 6px; width: 100%; }
.fselect-label { font-size: var(--text-sm); font-weight: 500; color: var(--text-primary); display: flex; align-items: center; gap: 6px; }
.fselect-optional { font-size: var(--text-xs); font-weight: 400; color: var(--text-tertiary); }

.fselect-inner    { position: relative; display: flex; align-items: center; }
.fselect-left-icon {
  position:       absolute;
  left:           10px;
  width:          14px;
  height:         14px;
  color:          var(--text-tertiary);
  pointer-events: none;
  flex-shrink:    0;
}
.fselect-chevron {
  position:       absolute;
  right:          10px;
  width:          12px;
  height:         12px;
  color:          var(--text-tertiary);
  pointer-events: none;
}
.fselect {
  width:              100%;
  height:             36px;
  padding:            0 28px 0 12px;
  background:         var(--bg-subtle);
  border:             1px solid var(--border-default);
  border-radius:      var(--radius-md);
  color:              var(--text-primary);
  font-family:        var(--font-sans);
  font-size:          var(--text-sm);
  outline:            none;
  cursor:             pointer;
  appearance:         none;
  -webkit-appearance: none;
  transition:         border-color var(--transition-fast), background var(--transition-fast), box-shadow var(--transition-fast);
}
.fselect--pl          { padding-left: 32px; }
.fselect:hover        { border-color: var(--border-strong); }
.fselect:focus        { border-color: var(--border-focus); background: var(--bg-elevated); box-shadow: 0 0 0 3px var(--accent-muted); }
.fselect--error       { border-color: var(--danger); }
.fselect--error:focus { box-shadow: 0 0 0 3px var(--danger-muted); }
.fselect option       { background: var(--bg-elevated); }

.fselect-error { display: flex; align-items: center; gap: 4px; font-size: var(--text-xs); color: var(--danger); font-weight: 500; }
`