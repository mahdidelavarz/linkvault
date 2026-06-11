'use client'

import { LucideX } from '@/Icons/Icons'
import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

interface ModalProps {
  isOpen:     boolean
  onClose:    () => void
  title?:     string
  children:   ReactNode
  size?:      ModalSize
  hideClose?: boolean
  className?: string
}

const sizeMap: Record<ModalSize, string> = {
  sm:   '420px',
  md:   '560px',
  lg:   '720px',
  xl:   '900px',
  full: '95vw',
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size      = 'md',
  hideClose = false,
  className = '',
}: ModalProps) {
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

    // Focus the panel for accessibility
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
      <div className="modal-root" role="dialog" aria-modal="true" aria-label={title}>
        {/* Backdrop */}
        <div className="modal-backdrop" onClick={onClose} />

        {/* Panel */}
        <div className="modal-scroll">
          <div
            ref={panelRef}
            tabIndex={-1}
            className={['modal-panel', className].filter(Boolean).join(' ')}
            style={{ '--modal-width': sizeMap[size] } as React.CSSProperties}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {(title || !hideClose) && (
              <div className="modal-header">
                {title && <h3 className="modal-title">{title}</h3>}
                {!hideClose && (
                  <button className="modal-close" onClick={onClose} aria-label="Close">
                    <LucideX width={16} />
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            <div className="modal-body">
              {children}
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}

const CSS = `
.modal-root {
  position: fixed;
  inset:    0;
  z-index:  var(--z-modal);
}

.modal-backdrop {
  position:   absolute;
  inset:      0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  animation:  fadeIn var(--transition-base) ease both;
}

.modal-scroll {
  position:       absolute;
  inset:          0;
  display:        flex;
  align-items:    center;
  justify-content: center;
  padding:        24px 16px;
  overflow-y:     auto;
}

.modal-panel {
  position:      relative;
  width:         var(--modal-width, 560px);
  max-width:     100%;
  background:    var(--bg-elevated);
  border:        1px solid var(--border-default);
  border-radius: var(--radius-xl);
  box-shadow:    var(--shadow-lg);
  outline:       none;
  animation:     scaleIn var(--transition-base) ease both;
  overflow:      hidden;
}

.modal-header {
  display:         flex;
  align-items:     center;
  justify-content: space-between;
  gap:             12px;
  padding:         18px 20px 16px;
  border-bottom:   1px solid var(--border-subtle);
}
.modal-title {
  font-size:   var(--text-lg);
  font-weight: 600;
  color:       var(--text-primary);
  line-height: var(--leading-tight);
}
.modal-close {
  display:       flex;
  align-items:   center;
  justify-content: center;
  width:         28px;
  height:        28px;
  background:    transparent;
  border:        1px solid transparent;
  border-radius: var(--radius-sm);
  color:         var(--text-tertiary);
  cursor:        pointer;
  flex-shrink:   0;
  transition:    background var(--transition-fast),
                 color      var(--transition-fast),
                 border-color var(--transition-fast);
}
.modal-close:hover {
  background:    var(--bg-overlay);
  border-color:  var(--border-default);
  color:         var(--text-primary);
}

.modal-body {
  padding: 5px;
}
`