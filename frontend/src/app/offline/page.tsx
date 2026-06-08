"use client";

import { LucideWifiOff } from "@/Icons/Icons";

export default function OfflinePage() {
  return (
    <div className="offline-page">
      <LucideWifiOff width={48} className="offline-icon" />
      <div className="offline-text">
        <h1>You're offline</h1>
        <p>
          LinkVault can't reach the server. Your cached data is still available
          if you were recently connected.
        </p>
      </div>
      <button className="offline-retry" onClick={() => window.location.reload()}>
        Try again
      </button>
      <style>{CSS}</style>
    </div>
  );
}

const CSS = `
.offline-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  min-height: 100dvh;
  padding: 24px;
  text-align: center;
  background: var(--bg-base, #0f172a);
  color: var(--text-primary, #f1f5f9);
}
.offline-icon { color: var(--yellow-400, #facc15); opacity: 0.9; }
.offline-text h1 {
  font-size: 22px; font-weight: 700; margin: 0 0 8px;
  color: var(--text-primary, #f1f5f9);
}
.offline-text p {
  color: var(--text-secondary, #94a3b8); font-size: 14px;
  margin: 0; max-width: 320px; line-height: 1.5;
}
.offline-retry {
  padding: 9px 20px;
  border-radius: 8px;
  background: var(--bg-surface, #1e293b);
  border: 1px solid var(--border-default, #334155);
  color: var(--text-primary, #f1f5f9);
  font-size: 14px;
  cursor: pointer;
  transition: background 0.15s;
}
.offline-retry:hover { background: var(--bg-surface-hover, #273549); }
`;
