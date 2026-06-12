'use client';

import { useEffect } from 'react';

// Catches errors thrown inside the dashboard route segment.
// Has access to the full root layout (sidebar, theme, etc.) since it sits inside it.
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[DashboardError]', error);
  }, [error]);

  return (
    <>
      <style>{CSS}</style>
      <div className="derr-wrap">
        <div className="derr-card">
          <span className="derr-icon">⚠️</span>
          <h2 className="derr-title">Something went wrong</h2>
          <p className="derr-body">
            This page encountered an unexpected error.
          </p>
          {error.digest && (
            <code className="derr-digest">Error ID: {error.digest}</code>
          )}
          <div className="derr-actions">
            <button className="derr-btn derr-btn--primary" onClick={reset}>
              Try again
            </button>
            <button
              className="derr-btn derr-btn--ghost"
              onClick={() => (window.location.href = '/dashboard')}
            >
              Back to dashboard
            </button>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <details className="derr-dev">
              <summary>Error details (dev only)</summary>
              <pre>{error.message}</pre>
              <pre>{error.stack}</pre>
            </details>
          )}
        </div>
      </div>
    </>
  );
}

const CSS = `
.derr-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  min-height: 60dvh;
}
.derr-card {
  max-width: 460px;
  width: 100%;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 40px 32px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.derr-icon { font-size: 36px; line-height: 1; }
.derr-title {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}
.derr-body {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}
.derr-digest {
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--text-tertiary);
  background: var(--bg-elevated);
  padding: 3px 8px;
  border-radius: 4px;
}
.derr-actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
  flex-wrap: wrap;
  justify-content: center;
}
.derr-btn {
  padding: 8px 18px;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;
  font-family: var(--font-sans);
  cursor: pointer;
  border: none;
  transition: opacity 0.15s;
}
.derr-btn:hover { opacity: 0.85; }
.derr-btn--primary { background: var(--accent); color: #fff; }
.derr-btn--ghost {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-default);
}
.derr-dev {
  margin-top: 16px;
  text-align: left;
  font-size: 11px;
  color: var(--text-tertiary);
  width: 100%;
}
.derr-dev summary { cursor: pointer; margin-bottom: 8px; }
.derr-dev pre { overflow-x: auto; white-space: pre-wrap; word-break: break-all; }
`;
