'use client'

import { LucideX } from '@/Icons/Icons'
import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface BottomSheetProps {
  isOpen:     boolean
  onClose:    () => void
  title?:     string
  children:   ReactNode
  className?: string
}

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  className = '',
}: BottomSheetProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  // Keyboard & scroll lock
  useEffect(() => {
    if (!isOpen) return

    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)

    panelRef.current?.focus()

    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [isOpen, onClose])

  if (!isOpen || typeof window === 'undefined') return null

  return createPortal(
    <>
      <style>{CSS}</style>
      <div className="sheet-root" role="dialog" aria-modal="true" aria-label={title}>
        {/* Backdrop */}
        <div className="sheet-backdrop" onClick={onClose} />

        {/* Panel */}
        <div
          ref={panelRef}
          tabIndex={-1}
          className={['sheet-panel', className].filter(Boolean).join(' ')}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Grab handle */}
          <div className="sheet-grab" onClick={onClose} aria-hidden="true">
            <span className="sheet-grab-bar" />
          </div>

          {/* Header */}
          {title && (
            <div className="sheet-header">
              <h3 className="sheet-title">{title}</h3>
              <button className="sheet-close" onClick={onClose} aria-label="Close">
                <LucideX width={16} />
              </button>
            </div>
          )}

          {/* Body */}
          <div className="sheet-body">
            {children}
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}

const CSS = `
.sheet-root {
  position: fixed;
  inset:    0;
  z-index:  var(--z-modal);
}

.sheet-backdrop {
  position:        absolute;
  inset:           0;
  background:      rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  animation:       fadeIn var(--transition-base) ease both;
}

.sheet-panel {
  position:         absolute;
  left:             0;
  right:            0;
  bottom:           0;
  max-height:       85dvh;
  display:          flex;
  flex-direction:   column;
  background:       var(--bg-elevated);
  border-top:       1px solid var(--border-default);
  border-top-left-radius:  var(--radius-xl);
  border-top-right-radius: var(--radius-xl);
  box-shadow:       var(--shadow-lg);
  outline:          none;
  animation:        sheetUp var(--transition-base) ease both;
  padding-bottom:   env(safe-area-inset-bottom, 0px);
}

@keyframes sheetUp {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}

.sheet-grab {
  display:         flex;
  align-items:     center;
  justify-content: center;
  padding:         10px 0 6px;
  cursor:          pointer;
  flex-shrink:     0;
}
.sheet-grab-bar {
  width:         40px;
  height:        4px;
  border-radius: 99px;
  background:    var(--border-strong);
}

.sheet-header {
  display:         flex;
  align-items:     center;
  justify-content: space-between;
  gap:             12px;
  padding:         4px 20px 14px;
  border-bottom:   1px solid var(--border-subtle);
  flex-shrink:     0;
}
.sheet-title {
  font-size:   var(--text-lg);
  font-weight: 600;
  color:       var(--text-primary);
  line-height: var(--leading-tight);
}
.sheet-close {
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           28px;
  height:          28px;
  background:      transparent;
  border:          1px solid transparent;
  border-radius:   var(--radius-sm);
  color:           var(--text-tertiary);
  cursor:          pointer;
  flex-shrink:     0;
  transition:      background var(--transition-fast),
                   color      var(--transition-fast),
                   border-color var(--transition-fast);
}
.sheet-close:hover {
  background:   var(--bg-overlay);
  border-color: var(--border-default);
  color:        var(--text-primary);
}

.sheet-body {
  padding:    16px 20px 20px;
  overflow-y: auto;
  min-height: 0;
}
`
