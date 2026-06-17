'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

// ─── PIN digit input (4 boxes, hidden input underneath) ──────────────────────

function PinInput({
    value,
    onChange,
    disabled,
    autoFocus,
}: {
    value: string;
    onChange: (v: string) => void;
    disabled?: boolean;
    autoFocus?: boolean;
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (autoFocus) inputRef.current?.focus();
    }, [autoFocus]);

    return (
        <div className="pin-wrap" onClick={() => inputRef.current?.focus()}>
            <input
                ref={inputRef}
                // type="text" (not "password") so the browser does not treat this as a
                // login credential and offer saved-username autofill. The value is never
                // visible anyway — masking is done by the .pin-dots row below.
                type="text"
                name="vault-pin"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={value}
                onChange={e => onChange(e.target.value.replace(/\D/g, '').slice(0, 4))}
                disabled={disabled}
                autoComplete="one-time-code"
                className="pin-hidden"
                aria-label="4-digit PIN"
            />
            <div className="pin-dots" aria-hidden>
                {[0, 1, 2, 3].map(i => (
                    <div
                        key={i}
                        className={['pin-dot', i < value.length ? 'pin-dot--filled' : ''].filter(Boolean).join(' ')}
                    />
                ))}
            </div>
        </div>
    );
}

// ─── Modal ───────────────────────────────────────────────────────────────────

interface PinModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** Called with the entered PIN. Return false to show "Incorrect PIN" error. */
    onSubmit: (pin: string) => Promise<boolean>;
    title?: string;
    subtitle?: string;
}

export function PinModal({
    isOpen,
    onClose,
    onSubmit,
    title = 'Unlock Vault',
    subtitle = 'Enter your 4-digit PIN',
}: PinModalProps) {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) { setPin(''); setError(''); }
    }, [isOpen]);

    // Auto-submit when 4th digit entered
    useEffect(() => {
        if (pin.length === 4 && !loading) submit(pin);
    }, [pin]); // eslint-disable-line react-hooks/exhaustive-deps

    async function submit(value: string) {
        setLoading(true);
        setError('');
        try {
            const ok = await onSubmit(value);
            if (ok) {
                onClose();
            } else {
                setError('Incorrect PIN. Try again.');
                setPin('');
            }
        } finally {
            setLoading(false);
        }
    }

    if (!isOpen || typeof document === 'undefined') return null;

    return createPortal(
        <>
            <style>{CSS}</style>
            <div className="pinm-backdrop" onClick={onClose} />
            <div className="pinm-modal" role="dialog" aria-modal aria-label={title}>
                <div className="pinm-icon">🔐</div>
                <h2 className="pinm-title">{title}</h2>
                <p className="pinm-sub">{subtitle}</p>

                <PinInput
                    value={pin}
                    onChange={v => { setPin(v); setError(''); }}
                    disabled={loading}
                    autoFocus={isOpen}
                />

                {error && <p className="pinm-error">{error}</p>}

                {loading && <p className="pinm-hint">Verifying…</p>}
                {!loading && pin.length < 4 && (
                    <p className="pinm-hint">{4 - pin.length} digit{4 - pin.length !== 1 ? 's' : ''} remaining</p>
                )}

                <button className="pinm-cancel" onClick={onClose} disabled={loading}>
                    Cancel
                </button>
            </div>
        </>,
        document.body
    );
}

// ─── PinSetupInput — confirm PIN during setup ─────────────────────────────────

interface PinSetupInputProps {
    onConfirm: (pin: string) => void;
}

export function PinSetupInput({ onConfirm }: PinSetupInputProps) {
    const [pin, setPin] = useState('');
    const [confirm, setConfirm] = useState('');
    const [step, setStep] = useState<'enter' | 'confirm'>('enter');
    const [error, setError] = useState('');

    function handleFirst() {
        if (pin.length < 4) return;
        setStep('confirm');
        setConfirm('');
        setError('');
    }

    function handleConfirm() {
        if (confirm !== pin) {
            setError("PINs don't match. Start over.");
            setStep('enter');
            setPin('');
            setConfirm('');
            return;
        }
        onConfirm(pin);
    }

    return (
        <div className="pin-setup">
            <style>{CSS}</style>
            {step === 'enter' ? (
                <>
                    <p className="pinm-sub">Choose a 4-digit PIN to unlock your vault</p>
                    <PinInput value={pin} onChange={setPin} autoFocus />
                    {error && <p className="pinm-error">{error}</p>}
                    <button
                        className="vs-btn vs-btn--primary"
                        onClick={handleFirst}
                        disabled={pin.length < 4}
                    >
                        Continue →
                    </button>
                </>
            ) : (
                <>
                    <p className="pinm-sub">Confirm your PIN</p>
                    <PinInput value={confirm} onChange={v => { setConfirm(v); setError(''); }} autoFocus />
                    {error && <p className="pinm-error">{error}</p>}
                    <button
                        className="vs-btn vs-btn--primary"
                        onClick={handleConfirm}
                        disabled={confirm.length < 4}
                    >
                        Set PIN
                    </button>
                    <button className="vs-btn vs-btn--ghost" onClick={() => { setStep('enter'); setPin(''); setConfirm(''); }}>
                        Back
                    </button>
                </>
            )}
        </div>
    );
}

const CSS = `
/* Hidden input */
.pin-hidden {
    position: absolute;
    opacity: 0;
    width: 1px; height: 1px;
    pointer-events: none;
}

/* Visual dot row */
.pin-wrap {
    display: flex;
    justify-content: center;
    cursor: text;
    position: relative;
}
.pin-dots {
    display: flex;
    gap: 16px;
    padding: 8px 0;
}
.pin-dot {
    width: 18px; height: 18px;
    border-radius: 50%;
    border: 2px solid var(--border-strong);
    background: transparent;
    transition: background 0.15s, border-color 0.15s, transform 0.1s;
}
.pin-dot--filled {
    background: var(--accent);
    border-color: var(--accent);
    transform: scale(1.1);
}

/* Modal overlay — rendered via createPortal so z-index is relative to document root,
   not the Header stacking context. Must be above --z-modal (400). */
.pinm-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.55);
    backdrop-filter: blur(3px);
    z-index: 600;
    animation: fadeIn 0.15s ease;
}
.pinm-modal {
    position: fixed;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    z-index: 601;
    background: var(--bg-elevated);
    border: 1px solid var(--border-default);
    border-radius: 16px;
    padding: 32px 28px;
    width: min(340px, 90vw);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    box-shadow: var(--shadow-xl, 0 20px 60px rgba(0,0,0,0.4));
    animation: slideUp 0.2s cubic-bezier(0.32,0.72,0,1);
}
@keyframes slideUp {
    from { transform: translate(-50%, calc(-50% + 16px)); opacity: 0; }
    to   { transform: translate(-50%, -50%); opacity: 1; }
}

.pinm-icon  { font-size: 36px; }
.pinm-title { font-size: 18px; font-weight: 700; color: var(--text-primary); margin: 0; }
.pinm-sub   { font-size: 13px; color: var(--text-secondary); margin: 0; text-align: center; }
.pinm-error { font-size: 12px; color: var(--danger, #ef4444); font-weight: 600; margin: 0; text-align: center; }
.pinm-hint  { font-size: 12px; color: var(--text-muted); margin: 0; }
.pinm-cancel {
    background: transparent; border: none;
    font-size: 13px; color: var(--text-muted);
    cursor: pointer; padding: 4px 12px;
    border-radius: 6px;
    transition: color 0.15s;
}
.pinm-cancel:hover { color: var(--text-primary); }
.pinm-cancel:disabled { opacity: 0.4; cursor: default; }

/* Setup variant */
.pin-setup {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    width: 100%;
}
`;
