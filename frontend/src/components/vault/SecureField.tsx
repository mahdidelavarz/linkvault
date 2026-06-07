'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useVault } from '@/hooks/useVault';

interface SecureFieldProps {
    module: string;
    recordId: string;
    fieldName: string;
    label: string;
    type?: 'text' | 'password' | 'textarea';
    placeholder?: string;
}

export function SecureField({
    module, recordId, fieldName, label, type = 'text', placeholder = '••••••••',
}: SecureFieldProps) {
    const { isEnabled, isUnlocked, isLoading, decrypt, requestUnlock } = useVault();
    const [value, setValue] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [decrypting, setDecrypting] = useState(false);

    const load = useCallback(async () => {
        if (!isUnlocked) return;
        setDecrypting(true);
        try {
            const v = await decrypt(module, recordId, fieldName);
            setValue(v);
        } finally {
            setDecrypting(false);
        }
    }, [isUnlocked, decrypt, module, recordId, fieldName]);

    useEffect(() => { load(); }, [load]);

    // ─── Locked / not set up state ────────────────────────────────────────────

    if (!isEnabled || !isUnlocked) {
        return (
            <div className="sf-wrap">
                <style>{CSS}</style>
                <span className="sf-label">{label}</span>
                <div className="sf-locked-container">
                    <div className="sf-blur-content" aria-hidden="true">{placeholder}</div>
                    <div className="sf-overlay">
                        <span className="sf-overlay-icon">🔒</span>
                        {!isEnabled ? (
                            <>
                                <span className="sf-overlay-text">Vault not set up</span>
                                <Link href="/settings/vault" className="sf-overlay-btn">Enable Vault</Link>
                            </>
                        ) : (
                            <>
                                <span className="sf-overlay-text">Vault locked</span>
                                <button
                                    className="sf-overlay-btn"
                                    onClick={requestUnlock}
                                >
                                    Unlock
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ─── Unlocked state ──────────────────────────────────────────────────────

    const displayValue = decrypting ? '…' : (value ?? '(not set)');
    const isPassword = type === 'password';

    return (
        <div className="sf-wrap">
            <style>{CSS}</style>
            <span className="sf-label">{label}</span>
            <div className="sf-unlocked-container">
                {type === 'textarea' ? (
                    <pre className="sf-textarea-value">{displayValue}</pre>
                ) : (
                    <span className="sf-value">
                        {isPassword && !showPassword
                            ? '•'.repeat(Math.min((value?.length ?? 8), 24))
                            : displayValue}
                    </span>
                )}
                <div className="sf-actions">
                    {isPassword && (
                        <button
                            className="sf-action-btn"
                            onClick={() => setShowPassword(v => !v)}
                            title={showPassword ? 'Hide' : 'Show'}
                        >
                            {showPassword ? '🙈' : '👁️'}
                        </button>
                    )}
                    {value && (
                        <button
                            className="sf-action-btn"
                            onClick={() => navigator.clipboard.writeText(value)}
                            title="Copy"
                        >
                            ⧉
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

const CSS = `
.sf-wrap { display: flex; flex-direction: column; gap: 4px; }
.sf-label { font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }

.sf-locked-container {
    position: relative;
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid var(--border-subtle);
    background: var(--surface-2);
}
.sf-blur-content {
    padding: 8px 12px;
    font-size: 13px;
    color: var(--text-muted);
    filter: blur(6px);
    pointer-events: none;
    user-select: none;
    min-height: 36px;
}
.sf-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: rgba(0,0,0,0.45);
    backdrop-filter: blur(2px);
    padding: 8px 12px;
}
.sf-overlay-icon { font-size: 14px; }
.sf-overlay-text { font-size: 12px; color: var(--text-secondary); white-space: nowrap; }
.sf-overlay-btn {
    padding: 4px 10px;
    font-size: 11px;
    font-weight: 600;
    border: none;
    border-radius: 4px;
    background: var(--accent);
    color: #fff;
    cursor: pointer;
    text-decoration: none;
    white-space: nowrap;
    transition: opacity 0.15s;
}
.sf-overlay-btn:hover { opacity: 0.85; }
.sf-overlay-btn:disabled { opacity: 0.5; cursor: default; }

.sf-unlocked-container {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    padding: 8px 10px;
    border-radius: 6px;
    border: 1px solid var(--border-subtle);
    background: var(--surface-2);
    min-height: 36px;
}
.sf-value {
    flex: 1;
    font-size: 13px;
    color: var(--text-primary);
    font-family: var(--font-mono, monospace);
    word-break: break-all;
}
.sf-textarea-value {
    flex: 1;
    font-size: 12px;
    color: var(--text-primary);
    font-family: var(--font-mono, monospace);
    white-space: pre-wrap;
    word-break: break-all;
    margin: 0;
    max-height: 200px;
    overflow-y: auto;
}
.sf-actions { display: flex; gap: 4px; flex-shrink: 0; }
.sf-action-btn {
    padding: 2px 6px;
    font-size: 13px;
    border: none;
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.15s, color 0.15s;
}
.sf-action-btn:hover { background: var(--surface-3); color: var(--text-primary); }
`;
