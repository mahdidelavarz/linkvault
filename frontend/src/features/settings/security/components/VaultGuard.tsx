'use client';

import Link from 'next/link';
import { useVault } from '@/features/settings/security/hooks/useVault';

interface VaultGuardProps {
    children: React.ReactNode;
    /** If false, passes children through with no guarding (use for conditional application). */
    enabled?: boolean;
}

/**
 * Security gate for sensitive UI sections.
 *
 * When locked: renders ONLY the prompt card — children are NOT in the DOM.
 * This prevents DevTools bypass (removing a CSS blur still reveals nothing).
 *
 * When unlocked: renders children directly with no wrapper.
 */
export function VaultGuard({ children, enabled = true }: VaultGuardProps) {
    if (!enabled) return <>{children}</>;

    const { isEnabled, isUnlocked, requestUnlock } = useVault();

    if (isUnlocked) return <>{children}</>;

    return (
        <div className="vg-locked">
            <style>{CSS}</style>
            <span className="vg-icon">🔒</span>
            {!isEnabled ? (
                <>
                    <span className="vg-text">Vault protects sensitive fields</span>
                    <Link href="/settings/vault" className="vg-btn vg-btn--primary">
                        Enable Vault
                    </Link>
                </>
            ) : (
                <>
                    <span className="vg-text">Vault locked</span>
                    <button className="vg-btn vg-btn--primary" onClick={requestUnlock}>
                        Unlock
                    </button>
                </>
            )}
        </div>
    );
}

const CSS = `
.vg-locked {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 20px 16px;
    background: var(--bg-elevated);
    border: 1px solid var(--border-subtle);
    border-radius: 10px;
    text-align: center;
    min-height: 80px;
}
.vg-icon { font-size: 20px; }
.vg-text { font-size: 13px; font-weight: 600; color: var(--text-primary); }
.vg-btn {
    padding: 6px 16px;
    font-size: 12px;
    font-weight: 600;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: opacity 0.15s;
    text-decoration: none;
    white-space: nowrap;
}
.vg-btn--primary { background: var(--accent); color: #fff; }
.vg-btn--primary:hover { opacity: 0.88; }
`;
