'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useVault } from '@/hooks/useVault';
import { PinSetupInput } from '@/components/vault/PinModal';

type SetupStep = 'pin' | 'mnemonic' | 'verify';

// ─── View: Not set up ─────────────────────────────────────────────────────────

function NotSetupView({ onStart, onRecover }: { onStart: () => void; onRecover: () => void }) {
    return (
        <div className="vs-card">
            <div className="vs-icon">🔐</div>
            <h2 className="vs-title">Secure Vault</h2>
            <p className="vs-desc">
                The vault encrypts your sensitive data on your device before sending it to the server —
                API tokens, SSH keys, and passwords are stored as ciphertext the server can never read.
            </p>
            <ul className="vs-feature-list">
                <li>Infrastructure .env content and SSH keys</li>
                <li>API Client auth tokens and credentials</li>
                <li>Link passwords</li>
            </ul>
            <p className="vs-desc vs-desc--muted">
                You will choose a 4-digit PIN and generate a 12-word recovery phrase.
                Keep the phrase safe — if you lose it, your encrypted data cannot be recovered.
            </p>
            <button className="vs-btn vs-btn--primary" onClick={onStart}>
                Set Up Secure Vault
            </button>
            <button className="vs-btn vs-btn--ghost" onClick={onRecover}>
                Recover with existing phrase
            </button>
        </div>
    );
}

// ─── View: Choose PIN ─────────────────────────────────────────────────────────

function PinSetupView({ onConfirm }: { onConfirm: (pin: string) => void }) {
    return (
        <div className="vs-card">
            <div className="vs-icon">🔢</div>
            <h2 className="vs-title">Choose Your PIN</h2>
            <p className="vs-desc">
                Your 4-digit PIN encrypts the vault key on this device.
                It is never stored — the wrong PIN is a cryptographic failure, not a logic check.
            </p>
            <PinSetupInput onConfirm={onConfirm} />
        </div>
    );
}

// ─── View: Show mnemonic ──────────────────────────────────────────────────────

function MnemonicView({ mnemonic, onNext }: { mnemonic: string; onNext: () => void }) {
    const words = mnemonic.split(' ');
    const [confirmed, setConfirmed] = useState(false);

    return (
        <div className="vs-card">
            <h2 className="vs-title">Your Recovery Phrase</h2>
            <div className="vs-warning">
                ⚠️ Write these 12 words down in order. We do not store them.
                If you lose them, your encrypted data <strong>cannot be recovered</strong>.
            </div>
            <div className="vs-mnemonic-grid">
                {words.map((word, i) => (
                    <div key={i} className="vs-mnemonic-cell">
                        <span className="vs-mnemonic-num">{i + 1}</span>
                        <span className="vs-mnemonic-word">{word}</span>
                    </div>
                ))}
            </div>
            <label className="vs-checkbox-label">
                <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />
                I have written down my recovery phrase
            </label>
            <button className="vs-btn vs-btn--primary" disabled={!confirmed} onClick={onNext}>
                Continue →
            </button>
        </div>
    );
}

// ─── View: Verify mnemonic ────────────────────────────────────────────────────

function VerifyView({ mnemonic, onNext }: { mnemonic: string; onNext: () => void }) {
    const words = mnemonic.split(' ');
    const [positions] = useState<number[]>(() => {
        const picks: number[] = [];
        while (picks.length < 3) {
            const r = Math.floor(Math.random() * 12);
            if (!picks.includes(r)) picks.push(r);
        }
        return picks.sort((a, b) => a - b);
    });
    const [answers, setAnswers] = useState(['', '', '']);
    const [error, setError] = useState('');

    function verify() {
        const allCorrect = positions.every((pos, i) => answers[i].trim().toLowerCase() === words[pos]);
        if (allCorrect) { onNext(); }
        else { setError('One or more words are incorrect. Check your phrase and try again.'); }
    }

    return (
        <div className="vs-card">
            <h2 className="vs-title">Verify Your Phrase</h2>
            <p className="vs-desc">Enter the words at the positions below to confirm you saved your phrase.</p>
            {positions.map((pos, i) => (
                <div key={pos} className="vs-verify-row">
                    <label className="vs-verify-label">Word #{pos + 1}</label>
                    <input
                        className="vs-input"
                        type="text"
                        value={answers[i]}
                        onChange={e => { const c = [...answers]; c[i] = e.target.value; setAnswers(c); setError(''); }}
                        placeholder={`Word ${pos + 1}`}
                        autoComplete="off"
                        spellCheck={false}
                    />
                </div>
            ))}
            {error && <div className="vs-error">{error}</div>}
            <button className="vs-btn vs-btn--primary" onClick={verify}>Confirm</button>
        </div>
    );
}

// ─── View: Recover vault ──────────────────────────────────────────────────────

function RecoverView({
    onRecover, onBack, isLoading,
}: {
    onRecover: (mnemonic: string, pin: string) => Promise<boolean>;
    onBack: () => void;
    isLoading: boolean;
}) {
    const [phrase, setPhrase] = useState('');
    const [pin, setPin] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [step, setStep] = useState<'phrase' | 'pin'>('phrase');

    async function handleSubmit() {
        if (pin.length < 4) { setError('PIN must be 4 digits.'); return; }
        if (pin !== confirm) { setError("PINs don't match."); return; }
        const ok = await onRecover(phrase.trim(), pin);
        if (!ok) setError('Recovery failed. Check your phrase and try again.');
    }

    return (
        <div className="vs-card">
            <div className="vs-icon">🔑</div>
            <h2 className="vs-title">Recover Vault</h2>

            {step === 'phrase' ? (
                <>
                    <p className="vs-desc">Enter your 12-word recovery phrase (space-separated).</p>
                    <textarea
                        className="vs-input vs-textarea"
                        value={phrase}
                        onChange={e => { setPhrase(e.target.value); setError(''); }}
                        placeholder="word1 word2 word3 … word12"
                        rows={3}
                        spellCheck={false}
                        autoComplete="off"
                    />
                    {error && <div className="vs-error">{error}</div>}
                    <button
                        className="vs-btn vs-btn--primary"
                        disabled={phrase.trim().split(/\s+/).length < 12}
                        onClick={() => setStep('pin')}
                    >
                        Continue →
                    </button>
                </>
            ) : (
                <>
                    <p className="vs-desc">Set a new 4-digit PIN for this device.</p>
                    <div className="vs-verify-row">
                        <label className="vs-verify-label">New PIN</label>
                        <input className="vs-input" type="password" inputMode="numeric"
                            maxLength={4} value={pin}
                            onChange={e => { setPin(e.target.value.replace(/\D/g, '').slice(0, 4)); setError(''); }}
                            placeholder="••••" autoComplete="new-password" />
                    </div>
                    <div className="vs-verify-row">
                        <label className="vs-verify-label">Confirm PIN</label>
                        <input className="vs-input" type="password" inputMode="numeric"
                            maxLength={4} value={confirm}
                            onChange={e => { setConfirm(e.target.value.replace(/\D/g, '').slice(0, 4)); setError(''); }}
                            placeholder="••••" autoComplete="new-password" />
                    </div>
                    {error && <div className="vs-error">{error}</div>}
                    <button
                        className="vs-btn vs-btn--primary"
                        disabled={isLoading || pin.length < 4 || confirm.length < 4}
                        onClick={handleSubmit}
                    >
                        {isLoading ? 'Recovering…' : 'Recover Vault'}
                    </button>
                </>
            )}

            <button className="vs-btn vs-btn--ghost" onClick={onBack}>← Back</button>
        </div>
    );
}

// ─── View: Active vault ───────────────────────────────────────────────────────

function ActiveView({
    isUnlocked, onLock, onRequestUnlock, onDisable, isLoading,
}: {
    isUnlocked: boolean; onLock: () => void; onRequestUnlock: () => void;
    onDisable: () => void; isLoading: boolean;
}) {
    const [showDisableConfirm, setShowDisableConfirm] = useState(false);

    return (
        <div className="vs-card">
            <div className="vs-status-row">
                <span className="vs-status-dot vs-status-dot--active" />
                <span className="vs-status-label">Vault Active</span>
                <span className="vs-status-lock">{isUnlocked ? '🔓 Unlocked' : '🔒 Locked'}</span>
            </div>

            <div className="vs-section">
                <h3 className="vs-section-title">Session</h3>
                {isUnlocked ? (
                    <button className="vs-btn vs-btn--secondary" onClick={onLock}>Lock Vault Now</button>
                ) : (
                    <button className="vs-btn vs-btn--primary" onClick={onRequestUnlock} disabled={isLoading}>
                        {isLoading ? 'Unlocking…' : 'Unlock Vault'}
                    </button>
                )}
                <p className="vs-hint">Vault auto-locks after 5 minutes of inactivity or when the app tab is hidden.</p>
                <p className="vs-hint">Unlock is protected by your 4-digit PIN — stored nowhere, verified by cryptography.</p>
            </div>

            <div className="vs-section">
                <h3 className="vs-section-title">Recovery</h3>
                <p className="vs-desc">
                    To recover your vault on a new device, use the "Recover with existing phrase" option
                    on the Vault setup screen and enter your 12-word recovery phrase.
                </p>
            </div>

            <div className="vs-section vs-section--danger">
                <h3 className="vs-section-title vs-section-title--danger">Danger Zone</h3>
                {!showDisableConfirm ? (
                    <button className="vs-btn vs-btn--danger" onClick={() => setShowDisableConfirm(true)}>
                        Disable Vault
                    </button>
                ) : (
                    <div className="vs-confirm-box">
                        <p className="vs-confirm-text">
                            This will permanently delete all encrypted field values from the server.
                            Plaintext data will NOT be restored — encrypted values will be gone forever.
                        </p>
                        <div className="vs-confirm-actions">
                            <button className="vs-btn vs-btn--ghost" onClick={() => setShowDisableConfirm(false)}>Cancel</button>
                            <button className="vs-btn vs-btn--danger" onClick={onDisable} disabled={isLoading}>
                                {isLoading ? 'Disabling…' : 'Confirm — Delete All'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VaultSettingsPage() {
    const router = useRouter();
    const { isEnabled, isUnlocked, isLoading, setup, requestUnlock, lock, recover, disable } = useVault();

    const [mode, setMode] = useState<'idle' | 'setup' | 'recover'>('idle');
    const [setupStep, setSetupStep] = useState<SetupStep>('pin');
    const [mnemonic, setMnemonic] = useState('');
    const [pendingPin, setPendingPin] = useState('');
    const [error, setError] = useState('');

    const handlePinConfirmed = useCallback(async (pin: string) => {
        setError('');
        setPendingPin(pin);
        try {
            const phrase = await setup(pin);
            setMnemonic(phrase);
            setSetupStep('mnemonic');
        } catch {
            setError('Setup failed. Please try again.');
        }
    }, [setup]);

    const finishSetup = useCallback(() => {
        setMode('idle');
        setMnemonic('');
        setPendingPin('');
        router.refresh();
    }, [router]);

    const handleRecover = useCallback(async (phrase: string, pin: string) => {
        const ok = await recover(phrase, pin);
        if (ok) { setMode('idle'); router.refresh(); }
        return ok;
    }, [recover, router]);

    const handleDisable = useCallback(async () => {
        await disable();
        router.refresh();
    }, [disable, router]);

    return (
        <div className="vs-page">
            <style>{CSS}</style>
            <div className="vs-header">
                <h1 className="vs-page-title">Vault Settings</h1>
            </div>

            {error && <div className="vs-error vs-error--page">{error}</div>}

            {/* ─── Setup flow ─── */}
            {mode === 'setup' && !isEnabled && (
                <>
                    {setupStep === 'pin' && (
                        <PinSetupView onConfirm={handlePinConfirmed} />
                    )}
                    {setupStep === 'mnemonic' && (
                        <MnemonicView mnemonic={mnemonic} onNext={() => setSetupStep('verify')} />
                    )}
                    {setupStep === 'verify' && (
                        <VerifyView mnemonic={mnemonic} onNext={finishSetup} />
                    )}
                </>
            )}

            {/* ─── Recovery flow ─── */}
            {mode === 'recover' && !isEnabled && (
                <RecoverView
                    onRecover={handleRecover}
                    onBack={() => setMode('idle')}
                    isLoading={isLoading}
                />
            )}

            {/* ─── Not set up ─── */}
            {!isEnabled && mode === 'idle' && (
                <NotSetupView
                    onStart={() => { setSetupStep('pin'); setMode('setup'); }}
                    onRecover={() => setMode('recover')}
                />
            )}

            {/* ─── Active ─── */}
            {isEnabled && (
                <ActiveView
                    isUnlocked={isUnlocked}
                    onLock={lock}
                    onRequestUnlock={requestUnlock}
                    onDisable={handleDisable}
                    isLoading={isLoading}
                />
            )}
        </div>
    );
}

const CSS = `
.vs-page {
    flex: 1;
    overflow-y: auto;
    padding: 32px 24px;
    max-width: 560px;
    margin: 0 auto;
    width: 100%;
}
.vs-header { margin-bottom: 24px; }
.vs-page-title { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }

.vs-card {
    background: var(--surface-1);
    border: 1px solid var(--border-subtle);
    border-radius: 12px;
    padding: 28px 24px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    margin-bottom: 20px;
}

.vs-icon { font-size: 36px; text-align: center; }
.vs-title { font-size: 18px; font-weight: 700; color: var(--text-primary); margin: 0; }
.vs-desc { font-size: 14px; color: var(--text-secondary); line-height: 1.55; margin: 0; }
.vs-desc--muted { color: var(--text-muted); font-size: 12px; }
.vs-hint { font-size: 12px; color: var(--text-muted); margin: 0; }

.vs-warning {
    background: rgba(239,68,68,0.1);
    border: 1px solid rgba(239,68,68,0.3);
    border-radius: 8px;
    padding: 12px 16px;
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.5;
}

.vs-feature-list {
    padding-left: 20px; margin: 0;
    display: flex; flex-direction: column; gap: 6px;
}
.vs-feature-list li { font-size: 13px; color: var(--text-secondary); }

.vs-mnemonic-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.vs-mnemonic-cell {
    display: flex; align-items: center; gap: 6px;
    background: var(--surface-2); border: 1px solid var(--border-subtle);
    border-radius: 6px; padding: 7px 10px;
}
.vs-mnemonic-num { font-size: 11px; color: var(--text-muted); min-width: 16px; }
.vs-mnemonic-word { font-size: 13px; font-weight: 600; color: var(--text-primary); font-family: var(--font-mono, monospace); }

.vs-checkbox-label {
    display: flex; align-items: center; gap: 8px;
    font-size: 13px; color: var(--text-secondary); cursor: pointer;
}
.vs-checkbox-label input[type=checkbox] { width: 15px; height: 15px; cursor: pointer; accent-color: var(--accent); }

.vs-verify-row { display: flex; flex-direction: column; gap: 4px; }
.vs-verify-label { font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
.vs-input {
    padding: 8px 12px; font-size: 13px;
    background: var(--surface-2); border: 1px solid var(--border-subtle);
    border-radius: 6px; color: var(--text-primary); outline: none;
    font-family: var(--font-mono, monospace);
    transition: border-color 0.15s;
}
.vs-input:focus { border-color: var(--accent); }
.vs-textarea { resize: vertical; font-family: var(--font-mono, monospace); line-height: 1.6; }

.vs-error { color: var(--danger, #ef4444); font-size: 13px; }
.vs-error--page { margin-bottom: 16px; padding: 10px 14px; background: rgba(239,68,68,0.08); border-radius: 8px; }

.vs-btn {
    padding: 10px 20px; font-size: 14px; font-weight: 600;
    border-radius: 8px; border: none; cursor: pointer;
    transition: opacity 0.15s, background 0.15s; text-align: center;
}
.vs-btn:disabled { opacity: 0.5; cursor: default; }
.vs-btn--primary { background: var(--accent); color: #fff; }
.vs-btn--primary:hover:not(:disabled) { opacity: 0.88; }
.vs-btn--secondary { background: var(--surface-2); color: var(--text-primary); border: 1px solid var(--border-subtle); }
.vs-btn--secondary:hover:not(:disabled) { background: var(--surface-3); }
.vs-btn--ghost { background: transparent; color: var(--text-muted); }
.vs-btn--ghost:hover { color: var(--text-primary); }
.vs-btn--danger { background: var(--danger, #ef4444); color: #fff; }
.vs-btn--danger:hover:not(:disabled) { opacity: 0.88; }

.vs-status-row {
    display: flex; align-items: center; gap: 10px;
    padding-bottom: 8px; border-bottom: 1px solid var(--border-subtle);
}
.vs-status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.vs-status-dot--active { background: var(--success, #22c55e); box-shadow: 0 0 6px var(--success, #22c55e); }
.vs-status-label { font-size: 14px; font-weight: 600; color: var(--text-primary); flex: 1; }
.vs-status-lock { font-size: 13px; color: var(--text-muted); }

.vs-section { display: flex; flex-direction: column; gap: 10px; }
.vs-section--danger { border-top: 1px solid var(--border-subtle); padding-top: 16px; margin-top: 4px; }
.vs-section-title { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; margin: 0; }
.vs-section-title--danger { color: var(--danger, #ef4444); }

.vs-confirm-box {
    background: rgba(239,68,68,0.07); border: 1px solid rgba(239,68,68,0.25);
    border-radius: 8px; padding: 16px; display: flex; flex-direction: column; gap: 12px;
}
.vs-confirm-text { font-size: 13px; color: var(--text-secondary); line-height: 1.5; margin: 0; }
.vs-confirm-actions { display: flex; gap: 8px; }

@media (max-width: 600px) {
    .vs-page { padding: 20px 16px; }
    .vs-mnemonic-grid { grid-template-columns: repeat(2, 1fr); }
}
`;
