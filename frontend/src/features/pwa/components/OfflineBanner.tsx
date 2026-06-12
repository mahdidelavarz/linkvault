"use client";

import { useNetworkStatus } from "@/features/shared/hooks/useNetworkStatus";
import { LucideWifiOff } from "@/Icons/Icons";

export default function OfflineBanner() {
  const { isOnline } = useNetworkStatus();

  if (isOnline) return null;

  return (
    <>
      <style>{CSS}</style>
      <div className="offline-banner" role="alert" aria-live="assertive">
        <LucideWifiOff width={13} />
        <span>You're offline — changes will be saved locally and synced when you're back online</span>
      </div>
    </>
  );
}

const CSS = `
.offline-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 16px;
  background: var(--yellow-950, #1c0a00);
  border-bottom: 1px solid var(--yellow-800, #854d0e);
  color: var(--yellow-200, #fef08a);
  font-size: var(--text-xs, 12px);
  font-weight: 500;
  flex-shrink: 0;
  z-index: 90;
}
.offline-banner svg { flex-shrink: 0; color: var(--yellow-400, #facc15); }
`;
