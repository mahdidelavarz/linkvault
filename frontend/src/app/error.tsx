'use client';

import { useEffect } from 'react';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to an error reporting service when available
    console.error('[RootError]', error);
  }, [error]);

  return (
    <>
      <style>{CSS}</style>
      <div className="err-page">
        <div className="err-card">
          <span className="err-icon">⚠️</span>
          <h1 className="err-title">Something went wrong</h1>
          <p className="err-body">
            An unexpected error occurred. The issue has been noted.
          </p>
          {error.digest && (
            <code className="err-digest">Error ID: {error.digest}</code>
          )}
          <div className="err-actions">
            <button className="err-btn err-btn--primary" onClick={reset}>
              Try again
            </button>
            <button
              className="err-btn err-btn--ghost"
              onClick={() => (window.location.href = '/')}
            >
              Go to dashboard
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

const CSS = `
.err-page {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--bg-base, #0f172a);
}
.err-card {
  max-width: 460px;
  width: 100%;
  background: var(--bg-surface, #1e293b);
  border: 1px solid var(--border-default, #334155);
  border-radius: var(--radius-lg, 12px);
  padding: 40px 32px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.err-icon { font-size: 40px; line-height: 1; }
.err-title {
  font-size: var(--text-lg, 18px);
  font-weight: 600;
  color: var(--text-primary, #f1f5f9);
  margin: 0;
}
.err-body {
  font-size: var(--text-sm, 14px);
  color: var(--text-secondary, #94a3b8);
  line-height: 1.6;
  margin: 0;
}
.err-digest {
  font-size: 12px;
  font-family: var(--font-mono, monospace);
  color: var(--text-tertiary, #475569);
  background: var(--bg-elevated, #0f172a);
  padding: 4px 10px;
  border-radius: 6px;
}
.err-actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
  flex-wrap: wrap;
  justify-content: center;
}
.err-btn {
  padding: 9px 20px;
  border-radius: var(--radius-md, 8px);
  font-size: var(--text-sm, 14px);
  font-weight: 500;
  font-family: var(--font-sans, system-ui, sans-serif);
  cursor: pointer;
  border: none;
  transition: opacity 0.15s;
}
.err-btn:hover { opacity: 0.85; }
.err-btn--primary { background: var(--accent, #3b82f6); color: #fff; }
.err-btn--ghost {
  background: transparent;
  color: var(--text-secondary, #94a3b8);
  border: 1px solid var(--border-default, #334155);
}
`;
