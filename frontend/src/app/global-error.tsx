'use client';

// Replaces the entire root layout when an error is thrown inside it.
// Must include its own <html> and <body> tags.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#0f172a', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}>
          <div style={{
            maxWidth: 480,
            width: '100%',
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 12,
            padding: '32px 28px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
            <h1 style={{ color: '#f1f5f9', fontSize: 18, fontWeight: 600, margin: '0 0 8px' }}>
              Something went wrong
            </h1>
            <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 24px', lineHeight: 1.6 }}>
              An unexpected error occurred. You can try refreshing the page.
            </p>
            {error.digest && (
              <p style={{ color: '#475569', fontSize: 12, margin: '0 0 20px', fontFamily: 'monospace' }}>
                Error ID: {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              style={{
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '10px 24px',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
