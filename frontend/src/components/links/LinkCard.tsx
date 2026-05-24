'use client'

import { useState } from 'react'
import { Icon } from '@iconify/react'
import { type Link as LinkType } from '@/types/link'
import { useToggleFavorite, useDeleteLink } from '@/hooks/useLinks'
import Button from '@/components/ui/Button'
import Badge  from '@/components/ui/Badge'
import Modal  from '@/components/ui/Modal'

interface LinkCardProps {
  link:   LinkType
  onEdit: (link: LinkType) => void
}

export default function LinkCard({ link, onEdit }: LinkCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showPassword,  setShowPassword]  = useState(false)

  const toggleFavorite = useToggleFavorite()
  const deleteLink     = useDeleteLink()

  const hostname = (() => {
    try { return new URL(link.url).hostname.replace('www.', '') }
    catch { return link.url }
  })()

  const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`

  const hasCredentials = link.username || link.email || link.phone || link.passwordEncrypted

  return (
    <>
      <style>{CSS}</style>
      <div className="lcard">

        {/* ── Top row ── */}
        <div className="lcard-top">
          <div className="lcard-favicon">
            <img
              src={faviconUrl}
              alt=""
              width={16}
              height={16}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          </div>

          <div className="lcard-info">
            <button className="lcard-title" onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}>
              {link.title}
            </button>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="lcard-url"
              title={link.url}
            >
              {hostname}
            </a>
          </div>

          {/* Favorite */}
          <button
            className={['lcard-fav', link.isFavorite ? 'lcard-fav--active' : ''].filter(Boolean).join(' ')}
            onClick={() => toggleFavorite.mutate(link.id)}
            aria-label={link.isFavorite ? 'Remove favorite' : 'Add favorite'}
            disabled={toggleFavorite.isPending}
          >
            <Icon icon={link.isFavorite ? 'lucide:star' : 'lucide:star'} width={15} />
          </button>
        </div>

        {/* ── Description ── */}
        {link.description && (
          <p className="lcard-desc">{link.description}</p>
        )}

        {/* ── Credentials ── */}
        {hasCredentials && (
          <div className="lcard-creds">
            {link.username && (
              <div className="lcard-cred-row">
                <Icon icon="lucide:user" width={12} />
                <span>{link.username}</span>
              </div>
            )}
            {link.email && (
              <div className="lcard-cred-row">
                <Icon icon="lucide:mail" width={12} />
                <span>{link.email}</span>
              </div>
            )}
            {link.phone && (
              <div className="lcard-cred-row">
                <Icon icon="lucide:phone" width={12} />
                <span>{link.phone}</span>
              </div>
            )}
            {link.passwordEncrypted && (
              <div className="lcard-cred-row">
                <Icon icon="lucide:lock" width={12} />
                <span className="lcard-password">
                  {showPassword ? link.passwordEncrypted : '••••••••'}
                </span>
                <button
                  className="lcard-eye"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? 'Hide' : 'Show'}
                >
                  <Icon icon={showPassword ? 'lucide:eye-off' : 'lucide:eye'} width={11} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Tags & category ── */}
        {(link.category || (link.tags && link.tags.length > 0)) && (
          <div className="lcard-tags">
            {link.category && (
              <Badge variant="cyan" icon="lucide:folder" size="sm">{link.category.name}</Badge>
            )}
            {link.tags?.map((tag: any) => (
              <Badge key={tag.id} variant="default" size="sm">{tag.name}</Badge>
            ))}
          </div>
        )}

        {/* ── Footer ── */}
        <div className="lcard-footer">
          <span className="lcard-date">
            {new Date(link.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <div className="lcard-actions">
            <button
              className="lcard-action-btn"
              onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}
              aria-label="Open link"
            >
              <Icon icon="lucide:external-link" width={14} />
            </button>
            <button
              className="lcard-action-btn"
              onClick={() => onEdit(link)}
              aria-label="Edit"
            >
              <Icon icon="lucide:pencil" width={14} />
            </button>
            <button
              className="lcard-action-btn lcard-action-btn--danger"
              onClick={() => setConfirmDelete(true)}
              aria-label="Delete"
            >
              <Icon icon="lucide:trash-2" width={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Delete confirm modal ── */}
      <Modal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete link"
        size="sm"
      >
        <div className="lcard-confirm">
          <p className="lcard-confirm-text">
            Are you sure you want to delete <strong>{link.title}</strong>? This cannot be undone.
          </p>
          <div className="lcard-confirm-actions">
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={deleteLink.isPending}
              onClick={() => deleteLink.mutate(link.id, { onSuccess: () => setConfirmDelete(false) })}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

const CSS = `
.lcard {
  display:        flex;
  flex-direction: column;
  gap:            12px;
  padding:        14px 16px;
  background:     var(--bg-surface);
  border:         1px solid var(--border-default);
  border-radius:  var(--radius-lg);
  transition:     border-color var(--transition-fast), box-shadow var(--transition-fast);
}
.lcard:hover {
  border-color: var(--border-strong);
  box-shadow:   var(--shadow-md);
}

/* Top row */
.lcard-top    { display: flex; align-items: flex-start; gap: 10px; }
.lcard-favicon {
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           30px;
  height:          30px;
  background:      var(--bg-overlay);
  border:          1px solid var(--border-subtle);
  border-radius:   var(--radius-md);
  flex-shrink:     0;
  overflow:        hidden;
}
.lcard-info   { flex: 1; min-width: 0; }
.lcard-title  {
  display:       block;
  width:         100%;
  font-size:     var(--text-sm);
  font-weight:   600;
  color:         var(--text-primary);
  text-align:    left;
  background:    none;
  border:        none;
  cursor:        pointer;
  padding:       0;
  white-space:   nowrap;
  overflow:      hidden;
  text-overflow: ellipsis;
  font-family:   var(--font-sans);
  transition:    color var(--transition-fast);
  line-height:   1.4;
}
.lcard-title:hover { color: var(--text-accent); }
.lcard-url {
  display:       block;
  font-size:     var(--text-xs);
  color:         var(--text-tertiary);
  white-space:   nowrap;
  overflow:      hidden;
  text-overflow: ellipsis;
  margin-top:    2px;
  text-decoration: none;
  transition:    color var(--transition-fast);
}
.lcard-url:hover { color: var(--text-accent); }

.lcard-fav {
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           28px;
  height:          28px;
  background:      transparent;
  border:          none;
  border-radius:   var(--radius-sm);
  color:           var(--text-tertiary);
  cursor:          pointer;
  flex-shrink:     0;
  transition:      color var(--transition-fast), transform var(--transition-fast);
}
.lcard-fav:hover       { color: #fbbf24; transform: scale(1.15); }
.lcard-fav--active     { color: #fbbf24; }
.lcard-fav:disabled    { opacity: 0.5; pointer-events: none; }

/* Description */
.lcard-desc {
  font-size:   var(--text-xs);
  color:       var(--text-secondary);
  line-height: var(--leading-snug);
  display:     -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow:    hidden;
}

/* Credentials */
.lcard-creds {
  display:       flex;
  flex-direction: column;
  gap:           5px;
  padding:       10px 12px;
  background:    var(--bg-elevated);
  border:        1px solid var(--border-subtle);
  border-radius: var(--radius-md);
}
.lcard-cred-row {
  display:     flex;
  align-items: center;
  gap:         7px;
  font-size:   var(--text-xs);
  color:       var(--text-secondary);
}
.lcard-cred-row svg { color: var(--text-tertiary); flex-shrink: 0; }
.lcard-password { font-family: var(--font-mono); letter-spacing: 0.05em; }
.lcard-eye {
  display:      flex;
  align-items:  center;
  background:   transparent;
  border:       none;
  color:        var(--text-tertiary);
  cursor:       pointer;
  padding:      0;
  margin-left:  2px;
  transition:   color var(--transition-fast);
}
.lcard-eye:hover { color: var(--text-primary); }

/* Tags */
.lcard-tags { display: flex; flex-wrap: wrap; gap: 5px; }

/* Footer */
.lcard-footer {
  display:         flex;
  align-items:     center;
  justify-content: space-between;
  gap:             8px;
  padding-top:     10px;
  border-top:      1px solid var(--border-subtle);
  margin-top:      auto;
}
.lcard-date    { font-size: var(--text-xs); color: var(--text-tertiary); }
.lcard-actions { display: flex; align-items: center; gap: 4px; }

.lcard-action-btn {
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           30px;
  height:          30px;
  background:      transparent;
  border:          1px solid transparent;
  border-radius:   var(--radius-sm);
  color:           var(--text-tertiary);
  cursor:          pointer;
  transition:      background var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast);
  /* Good tap target on mobile */
  min-width:       44px;
  min-height:      44px;
}
.lcard-action-btn:hover              { background: var(--bg-overlay); border-color: var(--border-default); color: var(--text-primary); }
.lcard-action-btn--danger:hover      { background: var(--danger-muted); border-color: rgba(239,68,68,0.2); color: var(--danger); }

/* Confirm modal */
.lcard-confirm         { display: flex; flex-direction: column; gap: 20px; }
.lcard-confirm-text    { font-size: var(--text-sm); color: var(--text-secondary); line-height: var(--leading-relaxed); }
.lcard-confirm-text strong { color: var(--text-primary); }
.lcard-confirm-actions { display: flex; justify-content: flex-end; gap: 8px; }
`