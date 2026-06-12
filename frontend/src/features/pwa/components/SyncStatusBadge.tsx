"use client";

import { useEffect, useState } from "react";
import { useOfflineQueue } from "@/features/shared/hooks/useOfflineQueue";
import { useOfflineSync } from "@/features/shared/hooks/useOfflineSync";
import { useNetworkStatus } from "@/features/shared/hooks/useNetworkStatus";
import { LucideRefreshCw, LucideCheck, LucideCircleAlert } from "@/Icons/Icons";

export default function SyncStatusBadge() {
  const { isOnline } = useNetworkStatus();
  const { count } = useOfflineQueue();
  const { isSyncing, lastResult, sync } = useOfflineSync();
  const [showSynced, setShowSynced] = useState(false);

  // Briefly show a "Synced" confirmation after the queue drains.
  useEffect(() => {
    if (!isSyncing && lastResult && lastResult.succeeded > 0 && count === 0) {
      setShowSynced(true);
      const timer = setTimeout(() => setShowSynced(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSyncing, lastResult, count]);

  const failures = lastResult?.failed ?? [];

  if (count === 0 && !showSynced && failures.length === 0) return null;

  return (
    <>
      <style>{CSS}</style>
      <div className="sync-status" role="status">
        {count > 0 && (
          <div className="sync-status-row">
            <LucideRefreshCw width={13} className={isSyncing ? "sync-spin" : undefined} />
            <span>
              {isSyncing
                ? `Syncing ${count} change${count === 1 ? "" : "s"}…`
                : isOnline
                  ? `${count} change${count === 1 ? "" : "s"} pending sync`
                  : `${count} change${count === 1 ? "" : "s"} saved offline — will sync when you're back online`}
            </span>
            {isOnline && !isSyncing && (
              <button type="button" className="sync-retry" onClick={() => sync()}>
                Retry now
              </button>
            )}
          </div>
        )}

        {showSynced && count === 0 && (
          <div className="sync-status-row sync-status-done">
            <LucideCheck width={13} />
            <span>All changes synced</span>
          </div>
        )}

        {failures.map((failure) => (
          <div className="sync-status-row sync-status-error" key={failure.mutation.id}>
            <LucideCircleAlert width={13} />
            <span>A queued change couldn&apos;t be saved: {failure.message}</span>
          </div>
        ))}
      </div>
    </>
  );
}

const CSS = `
.sync-status {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 7px 16px;
  background: var(--bg-elevated, #111827);
  border-bottom: 1px solid var(--border, #1f2937);
  font-size: var(--text-xs, 12px);
  flex-shrink: 0;
  z-index: 89;
}
.sync-status-row {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary, #9ca3af);
}
.sync-status-row svg { flex-shrink: 0; }
.sync-status-done { color: var(--green-400, #4ade80); }
.sync-status-error { color: var(--red-400, #f87171); }
.sync-retry {
  margin-left: auto;
  background: none;
  border: 1px solid var(--border, #374151);
  border-radius: 4px;
  color: inherit;
  font-size: inherit;
  padding: 2px 8px;
  cursor: pointer;
}
.sync-retry:hover { background: var(--bg-hover, rgba(255,255,255,0.05)); }
.sync-spin { animation: sync-spin 1s linear infinite; }
@keyframes sync-spin { to { transform: rotate(360deg); } }
`;
