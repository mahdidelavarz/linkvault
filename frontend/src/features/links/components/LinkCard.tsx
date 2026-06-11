"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { type Link as LinkType } from "@/features/links/types/link";
import { useToggleFavorite, useDeleteLink } from "@/features/links/hooks/useLinks";
import { useVault } from "@/features/settings/security/hooks/useVault";
import FavoriteButton from "@/features/shared/components/FavoriteButton";
import ActionButtons from "@/features/shared/components/ActionButtons";
import TagSection from "@/features/shared/components/TagSection";
import ConfirmDeleteModal from "@/features/shared/components/ConfirmDeleteModal";
import ProjectBadge from "@/features/projects/components/ProjectBadge";
import MultiProjectEditWarning from "@/features/projects/components/MultiProjectEditWarning";
import { useProjectAwareEdit } from "@/features/shared/hooks/useProjectAwareEdit";
import {
  LucideCheck,
  LucideCopy,
  LucideExternalLink,
  LucideEye,
  LucideEyeOff,
  LucideLock,
  LucideMail,
  LucidePhone,
  LucideUser,
} from "@/Icons/Icons";

// ─── Vault-aware password row ────────────────────────────────────────────────

function VaultPasswordRow({ link }: { link: LinkType }) {
  const { isEnabled, isUnlocked, decrypt, requestUnlock, isLoading: vaultLoading } = useVault();

  const [vaultValue, setVaultValue] = useState<string | null>(null);
  const [show, setShow] = useState(false);

  const isVaultProtected =
    isEnabled && (!link.passwordEncrypted || link.passwordEncrypted === 'vault:encrypted');

  useEffect(() => {
    if (!isVaultProtected || !isUnlocked) { setVaultValue(null); return; }
    decrypt('link', String(link.id), 'password').then(v => setVaultValue(v));
  }, [isUnlocked, isVaultProtected, link.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sentinel left after vault was disabled — data is gone
  if (link.passwordEncrypted === 'vault:encrypted') return null;

  // Pre-vault plaintext password (backward compat)
  if (!isVaultProtected && link.passwordEncrypted) {
    return (
      <div className="lcard-cred-row">
        <LucideLock width={12} />
        <span className="lcard-password">{show ? link.passwordEncrypted : '••••••••'}</span>
        <button className="lcard-eye" onClick={(e) => { e.stopPropagation(); setShow(p => !p); }}>
          {show ? <LucideEyeOff width={11} /> : <LucideEye width={11} />}
        </button>
      </div>
    );
  }

  // Vault not set up
  if (!isEnabled) {
    return (
      <div className="lcard-cred-row lcard-cred-row--vault">
        <LucideLock width={12} />
        <span className="lcard-password">••••••••</span>
        <Link href="/settings/vault" className="lcard-vault-hint" onClick={e => e.stopPropagation()}>
          Enable vault
        </Link>
      </div>
    );
  }

  // Vault enabled but locked
  if (!isUnlocked) {
    return (
      <div className="lcard-cred-row lcard-cred-row--vault">
        <LucideLock width={12} />
        <span className="lcard-password">••••••••</span>
        <button className="lcard-eye lcard-eye--lock" onClick={(e) => { e.stopPropagation(); requestUnlock(); }} disabled={vaultLoading}>
          🔒
        </button>
      </div>
    );
  }

  // Vault unlocked
  const displayValue = vaultValue ?? '(not set)';
  return (
    <div className="lcard-cred-row">
      <LucideLock width={12} />
      <span className="lcard-password">{show ? displayValue : '••••••••'}</span>
      <button className="lcard-eye" onClick={(e) => { e.stopPropagation(); setShow(p => !p); }}>
        {show ? <LucideEyeOff width={11} /> : <LucideEye width={11} />}
      </button>
    </div>
  );
}

// ─── Credentials section ─────────────────────────────────────────────────────
// When vault is enabled + locked: ALL credential rows are masked and not in the DOM.
// When vault is disabled or unlocked: render normally.

function CredentialsSection({ link, isSelectMode }: { link: LinkType; isSelectMode: boolean }) {
  const { isEnabled, isUnlocked, requestUnlock } = useVault();
  const vaultLocked = isEnabled && !isUnlocked;

  if (vaultLocked) {
    return (
      <div className="lcard-creds">
        <div className="lcard-cred-row lcard-cred-row--vault">
          <LucideLock width={12} />
          <span className="lcard-password lcard-cred-masked">Credentials hidden</span>
          <button
            className="lcard-eye lcard-eye--lock"
            onClick={e => { e.stopPropagation(); requestUnlock(); }}
            title="Unlock vault to view"
          >
            🔒
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lcard-creds">
      {link.username && <div className="lcard-cred-row"><LucideUser width={12} /><span>{link.username}</span></div>}
      {link.email    && <div className="lcard-cred-row"><LucideMail width={12} /><span>{link.email}</span></div>}
      {link.phone    && <div className="lcard-cred-row"><LucidePhone width={12} /><span>{link.phone}</span></div>}
      {link.passwordEncrypted && (
        !isSelectMode ? <VaultPasswordRow link={link} /> : (
          <div className="lcard-cred-row"><LucideLock width={12} /><span className="lcard-password">••••••••</span></div>
        )
      )}
    </div>
  );
}

interface LinkCardProps {
  link: LinkType;
  onEdit: (link: LinkType) => void;
  isSelectMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: number) => void;
}

export default function LinkCard({
  link, onEdit,
  isSelectMode = false, isSelected = false, onToggleSelect,
}: LinkCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(link.url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const toggleFavorite = useToggleFavorite();
  const deleteLink = useDeleteLink();

  const { handleEdit, confirmEdit, cancelEdit, isWarnOpen, projectNames } =
    useProjectAwareEdit({ itemType: 'link', itemId: link.id, onEdit });

  const hostname = (() => {
    try { return new URL(link.url).hostname.replace("www.", ""); }
    catch { return link.url; }
  })();

  const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
  const hasCredentials = link.username || link.email || link.phone || link.passwordEncrypted;

  const handleCardClick = () => { if (isSelectMode) onToggleSelect?.(link.id); };

  return (
    <>
      <style>{CSS}</style>

      <div
        className={["lcard", isSelectMode ? "lcard--selectable" : "", isSelected ? "lcard--selected" : ""].filter(Boolean).join(" ")}
        onClick={handleCardClick}
        role={isSelectMode ? "checkbox" : undefined}
        aria-checked={isSelectMode ? isSelected : undefined}
        tabIndex={isSelectMode ? 0 : undefined}
        onKeyDown={isSelectMode ? (e) => { if (e.key === " " || e.key === "Enter") handleCardClick(); } : undefined}
      >
        {/* Selection checkbox */}
        {isSelectMode && (
          <div className={["lcard-checkbox", isSelected ? "lcard-checkbox--checked" : ""].filter(Boolean).join(" ")}>
            {isSelected && <LucideCheck width={10} />}
          </div>
        )}

        {/* Top row */}
        <div className="lcard-top">
          <div className="lcard-favicon">
            <img src={faviconUrl} alt="" width={16} height={16}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </div>
          <div className="lcard-info">
            <button className="lcard-title"
              onClick={(e) => {
                if (isSelectMode) { e.stopPropagation(); onToggleSelect?.(link.id); return; }
                window.open(link.url, "_blank", "noopener,noreferrer");
              }}
            >{link.title}</button>
            <a href={link.url} target="_blank" rel="noopener noreferrer" className="lcard-url" title={link.url}
              onClick={(e) => { if (isSelectMode) e.preventDefault(); }}
            >{hostname}</a>
          </div>
          {!isSelectMode && (
            <FavoriteButton
              active={link.isFavorite}
              pending={toggleFavorite.isPending}
              onToggle={() => toggleFavorite.mutate(link.id)}
            />
          )}
        </div>

        {/* Description */}
        {link.description && <p className="lcard-desc">{link.description}</p>}

        {/* Credentials */}
        {hasCredentials && (
          <CredentialsSection link={link} isSelectMode={isSelectMode} />
        )}

        {/* Tags & category */}
        <TagSection tags={link.tags} category={link.category} />

        {/* Footer */}
        {!isSelectMode && (
          <div className="lcard-footer">
            <span className="lcard-date">
              {new Date(link.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
            <ProjectBadge itemType="link" itemId={link.id} />
            <ActionButtons
              onEdit={() => handleEdit(link)}
              onDelete={() => setConfirmDelete(true)}
              extra={
                <>
                  <button className={["ab-btn", copied ? "ab-btn--copied" : ""].filter(Boolean).join(" ")}
                    onClick={handleCopyUrl} aria-label="Copy URL" type="button" title={copied ? "Copied!" : "Copy URL"}
                  >
                    {copied ? <LucideCheck width={14} /> : <LucideCopy width={14} />}
                  </button>
                  <button className="ab-btn"
                    onClick={(e) => { e.stopPropagation(); window.open(link.url, "_blank", "noopener,noreferrer"); }}
                    aria-label="Open link" type="button"
                  >
                    <LucideExternalLink width={14} />
                  </button>
                </>
              }
            />
          </div>
        )}
      </div>

      <ConfirmDeleteModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        itemName={link.title}
        isLoading={deleteLink.isPending}
        onConfirm={() => deleteLink.mutate(link.id, { onSuccess: () => setConfirmDelete(false) })}
      />
      <MultiProjectEditWarning
        isOpen={isWarnOpen}
        projectNames={projectNames}
        onConfirm={confirmEdit}
        onCancel={cancelEdit}
      />
    </>
  );
}

const CSS = `
.lcard {
  display: flex; flex-direction: column; gap: 12px;
  padding: 14px 16px;
  background: var(--bg-surface); border: 1px solid var(--border-default); border-radius: var(--radius-lg);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast), background var(--transition-fast);
  width: 100%; min-width: 0; overflow: hidden; box-sizing: border-box; position: relative;
}
.lcard:hover { border-color: var(--border-strong); box-shadow: var(--shadow-md); }
@media (max-width: 479px) { .lcard { padding: 12px; gap: 10px; } }

.lcard--selectable { cursor: pointer; user-select: none; }
.lcard--selectable:active { opacity: 0.85; }
.lcard--selected { border-color: var(--accent-border); background: var(--accent-muted); box-shadow: 0 0 0 1px var(--accent-border); }

.lcard-checkbox {
  position: absolute; top: 10px; left: 10px;
  display: flex; align-items: center; justify-content: center;
  width: 20px; height: 20px;
  border: 2px solid var(--border-strong); border-radius: var(--radius-sm);
  background: var(--bg-surface); z-index: 2; pointer-events: none;
  transition: background var(--transition-fast), border-color var(--transition-fast);
}
.lcard-checkbox--checked { background: var(--accent); border-color: var(--accent); color: #fff; }
.lcard--selectable .lcard-top { padding-left: 28px; }

.lcard-top    { display: flex; align-items: flex-start; gap: 10px; min-width: 0; }
.lcard-favicon {
  display: flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; min-width: 30px;
  background: var(--bg-overlay); border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md); flex-shrink: 0; overflow: hidden;
}
.lcard-info  { flex: 1; min-width: 0; overflow: hidden; }
.lcard-title {
  display: block; width: 100%; font-size: var(--text-sm); font-weight: 600; color: var(--text-primary);
  text-align: left; background: none; border: none; cursor: pointer; padding: 0;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  font-family: var(--font-sans); transition: color var(--transition-fast); line-height: 1.4;
}
.lcard-title:hover { color: var(--text-accent); }
.lcard-url {
  display: block; font-size: var(--text-xs); color: var(--text-tertiary);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  margin-top: 2px; text-decoration: none; transition: color var(--transition-fast);
}
.lcard-url:hover { color: var(--text-accent); }

.lcard-desc {
  font-size: var(--text-xs); color: var(--text-secondary); line-height: var(--leading-snug);
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow: hidden; word-break: break-word;
}

.lcard-creds {
  display: flex; flex-direction: column; gap: 5px; padding: 10px 12px;
  background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-md);
  overflow: hidden; min-width: 0;
}
@media (max-width: 479px) { .lcard-creds { padding: 8px 10px; } }
.lcard-cred-row { display: flex; align-items: center; gap: 7px; font-size: var(--text-xs); color: var(--text-secondary); min-width: 0; }
.lcard-cred-row svg  { color: var(--text-tertiary); flex-shrink: 0; }
.lcard-cred-row span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; flex: 1; }
.lcard-password { font-family: var(--font-mono); letter-spacing: 0.05em; }
.lcard-eye {
  display: flex; align-items: center; background: transparent; border: none;
  color: var(--text-tertiary); cursor: pointer; padding: 2px; flex-shrink: 0;
  transition: color var(--transition-fast);
}
.lcard-eye:hover { color: var(--text-primary); }
.lcard-eye--lock { font-size: 11px; }
.lcard-eye:disabled { opacity: 0.5; cursor: default; }

.lcard-cred-row--vault .lcard-password { color: var(--text-muted); }
.lcard-cred-masked { font-style: italic; font-size: 11px; }
.lcard-vault-hint {
  font-size: 10px; font-weight: 600;
  color: var(--accent); text-decoration: none; flex-shrink: 0;
  padding: 1px 6px; border: 1px solid rgba(6,182,212,0.3); border-radius: 4px;
  white-space: nowrap;
}
.lcard-vault-hint:hover { opacity: 0.8; }

.lcard-footer {
  display: flex; align-items: center; justify-content: space-between;
  gap: 8px; padding-top: 10px; border-top: 1px solid var(--border-subtle); margin-top: auto; min-width: 0;
}
.lcard-date {
  font-size: var(--text-xs); color: var(--text-tertiary);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; flex-shrink: 1;
}
.ab-btn--copied { color: var(--success) !important; }
`;
