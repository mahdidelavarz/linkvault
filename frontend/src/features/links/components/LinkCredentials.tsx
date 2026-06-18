"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { type Link as LinkType } from "@/features/links/types/link";
import { useVault } from "@/features/settings/security/hooks/useVault";
import {
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
  const [vaultLoadFailed, setVaultLoadFailed] = useState(false);
  const [show, setShow] = useState(false);

  const isVaultProtected =
    isEnabled && (!link.passwordEncrypted || link.passwordEncrypted === 'vault:encrypted');

  useEffect(() => {
    if (!isVaultProtected || !isUnlocked) { setVaultValue(null); setVaultLoadFailed(false); return; }
    decrypt('link', String(link.id), 'password').then(v => {
      setVaultValue(v);
      // The field is marked vault-protected (sentinel) but no decryptable value came back —
      // surface it instead of silently rendering it as empty/"(not set)".
      setVaultLoadFailed(v === null);
    });
  }, [isUnlocked, isVaultProtected, link.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sentinel left after vault was disabled — the secure_fields were wiped, data is gone
  if (!isEnabled && link.passwordEncrypted === 'vault:encrypted') return null;

  // Pre-vault plaintext password (backward compat)
  if (!isVaultProtected && link.passwordEncrypted) {
    return (
      <div className="lcred-row">
        <LucideLock width={12} />
        <span className="lcred-password">{show ? link.passwordEncrypted : '••••••••'}</span>
        <button className="lcred-eye" onClick={(e) => { e.stopPropagation(); setShow(p => !p); }}>
          {show ? <LucideEyeOff width={11} /> : <LucideEye width={11} />}
        </button>
      </div>
    );
  }

  // Vault not set up
  if (!isEnabled) {
    return (
      <div className="lcred-row lcred-row--vault">
        <LucideLock width={12} />
        <span className="lcred-password">••••••••</span>
        <Link href="/settings/vault" className="lcred-vault-hint" onClick={e => e.stopPropagation()}>
          Enable vault
        </Link>
      </div>
    );
  }

  // Vault enabled but locked
  if (!isUnlocked) {
    return (
      <div className="lcred-row lcred-row--vault">
        <LucideLock width={12} />
        <span className="lcred-password">••••••••</span>
        <button className="lcred-eye lcred-eye--lock" onClick={(e) => { e.stopPropagation(); requestUnlock(); }} disabled={vaultLoading}>
          🔒
        </button>
      </div>
    );
  }

  // Vault unlocked but the protected value could not be decrypted — flag it clearly
  // rather than letting it look like an empty/unset password.
  if (vaultLoadFailed) {
    return (
      <div className="lcred-row lcred-row--vault">
        <LucideLock width={12} />
        <span className="lcred-password lcred-error">Couldn’t decrypt — re-enter password</span>
      </div>
    );
  }

  // Vault unlocked
  const displayValue = vaultValue ?? '(not set)';
  return (
    <div className="lcred-row">
      <LucideLock width={12} />
      <span className="lcred-password">{show ? displayValue : '••••••••'}</span>
      <button className="lcred-eye" onClick={(e) => { e.stopPropagation(); setShow(p => !p); }}>
        {show ? <LucideEyeOff width={11} /> : <LucideEye width={11} />}
      </button>
    </div>
  );
}

// ─── Credentials section ─────────────────────────────────────────────────────
// When vault is enabled + locked: ALL credential rows are masked and not in the DOM.
// When vault is disabled or unlocked: render normally.

export function CredentialsSection({ link, isSelectMode = false }: { link: LinkType; isSelectMode?: boolean }) {
  const { isEnabled, isUnlocked, requestUnlock } = useVault();
  const vaultLocked = isEnabled && !isUnlocked;

  if (vaultLocked) {
    return (
      <>
        <style>{CSS}</style>
        <div className="lcred-creds">
          <div className="lcred-row lcred-row--vault">
            <LucideLock width={12} />
            <span className="lcred-password lcred-masked">Credentials hidden</span>
            <button
              className="lcred-eye lcred-eye--lock"
              onClick={e => { e.stopPropagation(); requestUnlock(); }}
              title="Unlock vault to view"
            >
              🔒
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="lcred-creds">
        {link.username && <div className="lcred-row"><LucideUser width={12} /><span>{link.username}</span></div>}
        {link.email    && <div className="lcred-row"><LucideMail width={12} /><span>{link.email}</span></div>}
        {link.phone    && <div className="lcred-row"><LucidePhone width={12} /><span>{link.phone}</span></div>}
        {link.passwordEncrypted && (
          !isSelectMode ? <VaultPasswordRow link={link} /> : (
            <div className="lcred-row"><LucideLock width={12} /><span className="lcred-password">••••••••</span></div>
          )
        )}
      </div>
    </>
  );
}

const CSS = `
.lcred-creds {
  display: flex; flex-direction: column; gap: 5px; padding: 10px 12px;
  background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-md);
  overflow: hidden; min-width: 0;
}
@media (max-width: 479px) { .lcred-creds { padding: 8px 10px; } }
.lcred-row { display: flex; align-items: center; gap: 7px; font-size: var(--text-xs); color: var(--text-secondary); min-width: 0; }
.lcred-row svg  { color: var(--text-tertiary); flex-shrink: 0; }
.lcred-row span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; flex: 1; }
.lcred-password { font-family: var(--font-mono); letter-spacing: 0.05em; }
.lcred-eye {
  display: flex; align-items: center; background: transparent; border: none;
  color: var(--text-tertiary); cursor: pointer; padding: 2px; flex-shrink: 0;
  transition: color var(--transition-fast);
}
.lcred-eye:hover { color: var(--text-primary); }
.lcred-eye--lock { font-size: 11px; }
.lcred-eye:disabled { opacity: 0.5; cursor: default; }

.lcred-row--vault .lcred-password { color: var(--text-muted); }
.lcred-masked { font-style: italic; font-size: 11px; }
.lcred-error { color: var(--danger, #ef4444); font-size: 11px; font-style: italic; }
.lcred-vault-hint {
  font-size: 10px; font-weight: 600;
  color: var(--accent); text-decoration: none; flex-shrink: 0;
  padding: 1px 6px; border: 1px solid rgba(6,182,212,0.3); border-radius: 4px;
  white-space: nowrap;
}
.lcred-vault-hint:hover { opacity: 0.8; }
`;
