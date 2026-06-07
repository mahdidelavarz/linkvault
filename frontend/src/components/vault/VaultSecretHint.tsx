'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useVault } from '@/hooks/useVault';

interface VaultSecretHintProps {
    secretType: string | null;
    onEncrypt?: () => void;
}

/**
 * Inline hint shown when a secret pattern is detected in a form field.
 * If vault is not enabled: prompts to enable.
 * If vault is enabled + unlocked: prompts to encrypt now.
 * If vault is locked: prompts to unlock first.
 */
export function VaultSecretHint({ secretType, onEncrypt }: VaultSecretHintProps) {
    const { isEnabled, isUnlocked } = useVault();
    const [dismissed, setDismissed] = useState(false);

    if (!secretType || dismissed) return null;

    return (
        <div className="vsh-wrap">
            <style>{HINT_CSS}</style>
            <span className="vsh-icon">🔒</span>
            <span className="vsh-text">
                Looks like a {secretType}
                {!isEnabled && ' — enable vault to protect it'}
                {isEnabled && !isUnlocked && ' — unlock vault to protect it'}
                {isEnabled && isUnlocked && ' — encrypt with vault?'}
            </span>
            <div className="vsh-actions">
                {!isEnabled && (
                    <Link href="/settings/vault" className="vsh-btn vsh-btn--primary">Enable Vault</Link>
                )}
                {isEnabled && !isUnlocked && (
                    <Link href="/settings/vault" className="vsh-btn vsh-btn--primary">Unlock</Link>
                )}
                {isEnabled && isUnlocked && onEncrypt && (
                    <button className="vsh-btn vsh-btn--primary" type="button" onClick={onEncrypt}>Encrypt</button>
                )}
                <button className="vsh-btn vsh-btn--ghost" type="button" onClick={() => setDismissed(true)}>Skip</button>
            </div>
        </div>
    );
}

const HINT_CSS = `
.vsh-wrap {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    padding: 7px 10px;
    background: rgba(var(--accent-rgb, 6,182,212), 0.07);
    border: 1px solid rgba(var(--accent-rgb, 6,182,212), 0.2);
    border-radius: 6px;
    margin-top: 4px;
    animation: fadeIn 0.2s ease;
}
.vsh-icon { font-size: 12px; flex-shrink: 0; }
.vsh-text { font-size: 12px; color: var(--text-secondary); flex: 1; }
.vsh-actions { display: flex; gap: 4px; flex-shrink: 0; }
.vsh-btn {
    padding: 3px 10px;
    font-size: 11px;
    font-weight: 600;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    text-decoration: none;
    transition: opacity 0.15s;
    white-space: nowrap;
}
.vsh-btn--primary { background: var(--accent); color: #fff; }
.vsh-btn--primary:hover { opacity: 0.85; }
.vsh-btn--ghost { background: transparent; color: var(--text-muted); }
.vsh-btn--ghost:hover { color: var(--text-primary); }
`;
