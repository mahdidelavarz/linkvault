"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNetworkStatus } from "@/features/shared/hooks/useNetworkStatus";
import { replayQueuedMutations, type ReplayResult } from "@/lib/offlineSync";
import { offlineQueue } from "@/lib/offlineQueue";

/**
 * Replays the offline mutation queue when the connection returns. Mount once
 * near the root of the dashboard layout.
 */
export function useOfflineSync() {
  const { isOnline } = useNetworkStatus();
  const queryClient = useQueryClient();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastResult, setLastResult] = useState<ReplayResult | null>(null);
  const wasOnline = useRef(isOnline);

  const sync = useCallback(async () => {
    if (typeof navigator !== "undefined" && !navigator.onLine) return;
    setIsSyncing(true);
    try {
      const result = await replayQueuedMutations(queryClient);
      setLastResult(result);
    } finally {
      setIsSyncing(false);
    }
  }, [queryClient]);

  // Replay as soon as we come back online.
  useEffect(() => {
    if (isOnline && !wasOnline.current) sync();
    wasOnline.current = isOnline;
  }, [isOnline, sync]);

  // Replay on mount if there's already a queue and we're online (e.g. after a reload).
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.onLine) return;
    offlineQueue.getAll().then((entries) => {
      if (entries.length > 0) sync();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Best-effort: wake up via Background Sync when the SW relays a message (Chromium only).
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    const handler = (event: MessageEvent) => {
      if (event.data?.type === "REPLAY_MUTATIONS") sync();
    };
    navigator.serviceWorker.addEventListener("message", handler);
    return () => navigator.serviceWorker.removeEventListener("message", handler);
  }, [sync]);

  useEffect(() => {
    if (!isOnline || typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.ready
      .then((reg) => reg.sync?.register("replay-mutations"))
      .catch(() => {});
  }, [isOnline]);

  return { isSyncing, lastResult, sync };
}
