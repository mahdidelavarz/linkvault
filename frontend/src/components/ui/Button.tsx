'use client'

import { Icon } from '@iconify/react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
export type ButtonSize    = 'xs' | 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   ButtonVariant
  size?:      ButtonSize
  isLoading?: boolean
  fullWidth?: boolean
  leftIcon?:  string   // iconify icon name
  rightIcon?: string
  children?:  ReactNode
}

const styles: Record<ButtonVariant, string> = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  ghost:     'btn-ghost',
  danger:    'btn-danger',
  outline:   'btn-outline',
}

const sizes: Record<ButtonSize, string> = {
  xs: 'btn-xs',
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg',
}

export default function Button({
  variant   = 'primary',
  size      = 'md',
  isLoading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <>
      <style>{CSS}</style>
      <button
        className={[
          'btn',
          styles[variant],
          sizes[size],
          fullWidth ? 'btn-full' : '',
          className,
        ].filter(Boolean).join(' ')}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Icon icon="svg-spinners:ring-resize" className="btn-spinner" />
        ) : leftIcon ? (
          <Icon icon={leftIcon} className="btn-icon" />
        ) : null}

        {children && <span>{children}</span>}

        {!isLoading && rightIcon && (
          <Icon icon={rightIcon} className="btn-icon" />
        )}
      </button>
    </>
  )
}

const CSS = `
.btn {
  display:         inline-flex;
  align-items:     center;
  justify-content: center;
  gap:             6px;
  font-family:     var(--font-sans);
  font-weight:     500;
  border:          1px solid transparent;
  border-radius:   var(--radius-md);
  cursor:          pointer;
  white-space:     nowrap;
  transition:      background var(--transition-fast),
                   border-color var(--transition-fast),
                   color var(--transition-fast),
                   box-shadow var(--transition-fast),
                   opacity var(--transition-fast);
  user-select:     none;
  -webkit-font-smoothing: antialiased;
}
.btn:disabled {
  opacity:        0.45;
  cursor:         not-allowed;
  pointer-events: none;
}
.btn:focus-visible {
  outline:        2px solid var(--border-focus);
  outline-offset: 2px;
}

/* Sizes */
.btn-xs { font-size: var(--text-xs); padding: 4px 10px;  height: 26px; }
.btn-sm { font-size: var(--text-sm); padding: 5px 12px;  height: 30px; }
.btn-md { font-size: var(--text-sm); padding: 6px 14px;  height: 34px; }
.btn-lg { font-size: var(--text-md); padding: 8px 18px;  height: 40px; }
.btn-full { width: 100%; }

/* Variants */
.btn-primary {
  background:   var(--accent);
  color:        var(--text-inverse);
  border-color: var(--accent);
}
.btn-primary:hover:not(:disabled) {
  background:   var(--accent-hover);
  border-color: var(--accent-hover);
  box-shadow:   var(--shadow-glow);
}
.btn-primary:active:not(:disabled) {
  background: var(--cyan-600);
}

.btn-secondary {
  background:   var(--bg-overlay);
  color:        var(--text-primary);
  border-color: var(--border-default);
}
.btn-secondary:hover:not(:disabled) {
  background:   var(--bg-subtle);
  border-color: var(--border-strong);
}

.btn-ghost {
  background:   transparent;
  color:        var(--text-secondary);
  border-color: transparent;
}
.btn-ghost:hover:not(:disabled) {
  background: var(--bg-overlay);
  color:      var(--text-primary);
}

.btn-outline {
  background:   transparent;
  color:        var(--text-accent);
  border-color: var(--accent-border);
}
.btn-outline:hover:not(:disabled) {
  background:   var(--accent-subtle);
  border-color: var(--border-focus);
}

.btn-danger {
  background:   var(--danger);
  color:        #fff;
  border-color: var(--danger);
}
.btn-danger:hover:not(:disabled) {
  background:   #dc2626;
  box-shadow:   0 0 16px rgba(239,68,68,0.25);
}

/* Icons */
.btn-icon    { width: 15px; height: 15px; flex-shrink: 0; }
.btn-spinner { width: 14px; height: 14px; flex-shrink: 0; }
`