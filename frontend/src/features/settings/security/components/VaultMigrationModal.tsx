'use client';

import { useState } from 'react';

interface VaultMigrationModalProps {
  itemCount: number;
  progress: { done: number; total: number } | null;
  onEncryptAll: () => Promise<void>;
  onDismiss: () => void;
}

export function VaultMigrationModal({
  itemCount, progress, onEncryptAll, onDismiss,
}: VaultMigrationModalProps) {
  const [running, setRunning] = useState(false);

  const handleEncrypt = async () => {
    setRunning(true);
    await onEncryptAll();
    setRunning(false);
  };

  const pct = progress ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <div className="vmm-overlay" onClick={!progress ? onDismiss : undefined}>
      <style>{CSS}</style>
      <div className="vmm-card" onClick={(e) => e.stopPropagation()}>
        {progress ? (
          <>
            <div className="vmm-icon">🔒</div>
            <p className="vmm-title">Encrypting sensitive data…</p>
            <div className="vmm-progress-track">
              <div className="vmm-progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <p className="vmm-progress-text">{progress.done} of {progress.total} items encrypted</p>
          </>
        ) : (
          <>
            <div className="vmm-icon">🔒</div>
            <p className="vmm-title">Protect your existing data</p>
            <p className="vmm-body">
              You have <strong>{itemCount}</strong> item{itemCount !== 1 ? 's' : ''} with
              sensitive fields stored as plaintext on the server. Encrypting them now removes
              the plaintext permanently — only your vault can decrypt them afterward.
            </p>
            <div className="vmm-actions">
              <button
                className="vmm-btn vmm-btn--primary"
                onClick={handleEncrypt}
                disabled={running}
              >
                {running ? 'Encrypting…' : `Encrypt all now`}
              </button>
              <button className="vmm-btn vmm-btn--ghost" onClick={onDismiss}>
                Remind me later
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const CSS = `
.vmm-overlay {
  position:        fixed;
  inset:           0;
  z-index:         1000;
  display:         flex;
  align-items:     center;
  justify-content: center;
  background:      rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  padding:         24px;
  animation:       fadeIn 0.2s ease;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.vmm-card {
  display:          flex;
  flex-direction:   column;
  align-items:      center;
  gap:              14px;
  padding:          28px 32px;
  background:       var(--bg-surface);
  border:           1px solid var(--border-default);
  border-radius:    var(--radius-xl, 12px);
  box-shadow:       0 20px 60px rgba(0,0,0,0.4);
  max-width:        420px;
  width:            100%;
  text-align:       center;
  animation:        slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: none; opacity: 1; } }

.vmm-icon { font-size: 36px; margin-bottom: 4px; }

.vmm-title {
  font-size:   var(--text-lg, 17px);
  font-weight: 700;
  color:       var(--text-primary);
  margin:      0;
}

.vmm-body {
  font-size:   var(--text-sm, 13px);
  color:       var(--text-secondary);
  line-height: var(--leading-relaxed, 1.6);
  margin:      0;
}
.vmm-body strong { color: var(--text-primary); }

.vmm-progress-track {
  width:         100%;
  height:        6px;
  background:    var(--bg-elevated);
  border:        1px solid var(--border-subtle);
  border-radius: 99px;
  overflow:      hidden;
}
.vmm-progress-fill {
  height:      100%;
  background:  var(--accent);
  border-radius: 99px;
  transition:  width 0.3s ease;
}
.vmm-progress-text {
  font-size:  var(--text-xs, 12px);
  color:      var(--text-tertiary);
  margin:     0;
}

.vmm-actions {
  display:        flex;
  flex-direction: column;
  gap:            8px;
  width:          100%;
  margin-top:     4px;
}
.vmm-btn {
  display:       flex;
  align-items:   center;
  justify-content: center;
  height:        42px;
  padding:       0 20px;
  font-size:     var(--text-sm, 13px);
  font-family:   var(--font-sans);
  font-weight:   600;
  border-radius: var(--radius-md, 8px);
  border:        none;
  cursor:        pointer;
  transition:    background var(--transition-fast), opacity var(--transition-fast);
}
.vmm-btn:disabled { opacity: 0.6; cursor: default; }
.vmm-btn--primary {
  background: var(--accent);
  color:      #fff;
}
.vmm-btn--primary:hover:not(:disabled) { opacity: 0.88; }
.vmm-btn--ghost {
  background: transparent;
  color:      var(--text-tertiary);
  border:     1px solid var(--border-default);
}
.vmm-btn--ghost:hover { color: var(--text-primary); background: var(--bg-overlay); }
`;
