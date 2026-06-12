"use client";

import { useCallback, useEffect, useState } from "react";
import { offlineQueue, type QueuedMutation } from "@/lib/offlineQueue";

/** Live view of the pending offline-mutation queue (updates across tabs too). */
export function useOfflineQueue() {
  const [entries, setEntries] = useState<QueuedMutation[]>([]);

  const refresh = useCallback(() => {
    offlineQueue.getAll().then(setEntries);
  }, []);

  useEffect(() => {
    refresh();
    return offlineQueue.subscribe(refresh);
  }, [refresh]);

  return { entries, count: entries.length };
}
