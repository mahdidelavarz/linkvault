import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children:    ReactNode
  hoverable?:  boolean
  bordered?:   boolean
  padding?:    'none' | 'sm' | 'md' | 'lg'
}

export default function Card({
  children,
  hoverable = false,
  bordered  = true,
  padding   = 'md',
  className = '',
  ...props
}: CardProps) {
  return (
    <>
      <style>{CSS}</style>
      <div
        className={[
          'card',
          hoverable ? 'card--hoverable' : '',
          !bordered ? 'card--borderless' : '',
          `card--pad-${padding}`,
          className,
        ].filter(Boolean).join(' ')}
        {...props}
      >
        {children}
      </div>
    </>
  )
}

export function CardHeader({
  children,
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={['card-header', className].filter(Boolean).join(' ')} {...props}>
      {children}
    </div>
  )
}

export function CardBody({
  children,
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={['card-body', className].filter(Boolean).join(' ')} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({
  children,
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={['card-footer', className].filter(Boolean).join(' ')} {...props}>
      {children}
    </div>
  )
}

const CSS = `
.card {
  background:    var(--bg-surface);
  border:        1px solid var(--border-default);
  border-radius: var(--radius-lg);
  overflow:      hidden;
  transition:    border-color var(--transition-fast),
                 box-shadow   var(--transition-fast),
                 transform    var(--transition-fast);
}
.card--borderless { border-color: transparent; }
.card--hoverable:hover {
  border-color: var(--border-strong);
  box-shadow:   var(--shadow-md);
  transform:    translateY(-1px);
}

.card--pad-none { padding: 0; }
.card--pad-sm   { padding: var(--space-3); }
.card--pad-md   { padding: var(--space-4) var(--space-5); }
.card--pad-lg   { padding: var(--space-6) var(--space-8); }

.card-header {
  display:         flex;
  align-items:     center;
  justify-content: space-between;
  gap:             12px;
  padding:         14px 16px 12px;
  border-bottom:   1px solid var(--border-subtle);
}
.card-body   { padding: 16px; }
.card-footer {
  padding:      12px 16px;
  border-top:   1px solid var(--border-subtle);
  background:   var(--bg-elevated);
}
`