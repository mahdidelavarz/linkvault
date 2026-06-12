import type { QueryClient, QueryKey } from "@tanstack/react-query";
import { offlineQueue, type QueuedMutation } from "@/lib/offlineQueue";
import { callApi, isOfflineError } from "@/lib/offlineApi";

export interface ReplayFailure {
  mutation: QueuedMutation;
  message: string;
}

export interface ReplayResult {
  succeeded: number;
  failed: ReplayFailure[];
}

/** Recursively replaces tempId placeholders (negative ids) with their real ids. */
function resolvePlaceholders(value: unknown, idMap: Map<number, number>): unknown {
  if (typeof value === "number") return idMap.get(value) ?? value;
  if (typeof value === "string") {
    let out = value;
    idMap.forEach((realId, tempId) => {
      out = out.split(String(tempId)).join(String(realId));
    });
    return out;
  }
  if (Array.isArray(value)) return value.map((item) => resolvePlaceholders(item, idMap));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [key, resolvePlaceholders(val, idMap)]),
    );
  }
  return value;
}

/** Finds the numeric `id` of the entity in a create response, regardless of wrapper key. */
function extractId(data: unknown): number | undefined {
  if (!data || typeof data !== "object") return undefined;
  const obj = data as Record<string, unknown>;
  if (typeof obj.id === "number") return obj.id;
  for (const value of Object.values(obj)) {
    if (value && typeof value === "object" && typeof (value as Record<string, unknown>).id === "number") {
      return (value as Record<string, unknown>).id as number;
    }
  }
  return undefined;
}

function remapEntity(item: unknown, tempId: number, realId: number): unknown {
  if (item && typeof item === "object" && (item as { id?: unknown }).id === tempId) {
    return { ...item, id: realId };
  }
  return item;
}

/** Rewrites any cached list/page data for `module`, replacing tempId with realId. */
function remapListCache(queryClient: QueryClient, module: string, tempId: number, realId: number) {
  queryClient.setQueriesData({ queryKey: [module], exact: false }, (old: unknown) => {
    if (!old) return old;
    if (Array.isArray(old)) return old.map((item) => remapEntity(item, tempId, realId));

    const data = old as { pages?: unknown[]; items?: unknown[] };
    if (Array.isArray(data.pages)) {
      return {
        ...data,
        pages: data.pages.map((page) => {
          const p = page as { items?: unknown[] };
          return Array.isArray(p.items)
            ? { ...p, items: p.items.map((item) => remapEntity(item, tempId, realId)) }
            : page;
        }),
      };
    }
    if (Array.isArray(data.items)) {
      return { ...data, items: data.items.map((item) => remapEntity(item, tempId, realId)) };
    }
    return remapEntity(old, tempId, realId);
  });
}

/**
 * Replays all queued offline mutations in order. Stops (leaving the remainder queued)
 * the moment a request fails with a network error — anything that already succeeded
 * stays applied. 4xx failures are dropped from the queue and reported in `failed`.
 */
export async function replayQueuedMutations(queryClient: QueryClient): Promise<ReplayResult> {
  let entries = await offlineQueue.getAll();
  if (entries.length === 0) return { succeeded: 0, failed: [] };

  // Collapse create+delete pairs that target the same offline-created (tempId) entity —
  // net effect is nothing, so skip both without calling the API.
  const dropIds = new Set<string>();
  for (const entry of entries) {
    if (entry.method !== "delete" || entry.tempId !== undefined) continue;
    const created = entries.find(
      (e) => e.method === "post" && e.tempId !== undefined && entry.url.includes(String(e.tempId)),
    );
    if (created) {
      dropIds.add(entry.id);
      dropIds.add(created.id);
    }
  }
  for (const id of dropIds) await offlineQueue.remove(id);
  entries = entries.filter((e) => !dropIds.has(e.id));

  const idMap = new Map<number, number>();
  const invalidateKeys: QueryKey[] = [];
  const failed: ReplayFailure[] = [];
  let succeeded = 0;

  for (const entry of entries) {
    const url = resolvePlaceholders(entry.url, idMap) as string;
    const payload = entry.payload !== undefined ? resolvePlaceholders(entry.payload, idMap) : undefined;

    try {
      const res = await callApi(entry.method, url, payload);
      await offlineQueue.remove(entry.id);
      succeeded++;

      if (entry.method === "post" && entry.tempId !== undefined) {
        const realId = extractId(res.data);
        if (realId !== undefined) {
          idMap.set(entry.tempId, realId);
          remapListCache(queryClient, entry.module, entry.tempId, realId);

          if (entry.detailKey) {
            const cached = queryClient.getQueryData([entry.detailKey, entry.tempId]);
            if (cached) {
              queryClient.setQueryData([entry.detailKey, realId], remapEntity(cached, entry.tempId, realId));
              queryClient.removeQueries({ queryKey: [entry.detailKey, entry.tempId] });
            }
          }
        }
      }

      entry.invalidates.forEach((key) => invalidateKeys.push(key as QueryKey));
    } catch (err) {
      if (isOfflineError(err)) break; // still offline — leave remaining entries queued
      await offlineQueue.remove(entry.id);
      failed.push({ mutation: entry, message: err instanceof Error ? err.message : "Unknown error" });
    }
  }

  invalidateKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
  return { succeeded, failed };
}
