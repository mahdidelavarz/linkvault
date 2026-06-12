"use client";

import { useMutation, useQueryClient, type QueryClient, type QueryKey } from "@tanstack/react-query";
import { offlineQueue, type HttpMethod } from "@/lib/offlineQueue";
import { callApi, isOfflineError, OfflineVaultError } from "@/lib/offlineApi";

export interface OfflineMutationConfig<TVars, TResult> {
  /** Query key prefix for this entity, e.g. "links" — also used as the offline-queue grouping key. */
  module: string;
  method: HttpMethod;
  /** Builds the request URL. `tempId` is set only while queueing an offline `post`. */
  url: (vars: TVars, tempId?: number) => string;
  payload?: (vars: TVars, tempId?: number) => unknown;
  /** Maps a raw response body to TResult. Defaults to the response body itself. */
  parseResponse?: (data: never, vars: TVars) => TResult;
  /** Return true if this mutation touches vault-encrypted fields — blocks offline instead of queueing. */
  vaultSensitive?: (vars: TVars) => boolean;
  /** Applies the change directly to the React Query cache and returns the resulting entity. */
  optimisticUpdate: (queryClient: QueryClient, vars: TVars, tempId?: number) => TResult;
  /** Query keys to invalidate after a successful (online or replayed) mutation. */
  invalidates?: (vars: TVars, result: TResult) => QueryKey[];
  /** Query key prefix for this entity's detail query (e.g. "link") — enables tempId -> realId remap. */
  detailKey?: string;
}

function nextTempId(): number {
  return -(Date.now() * 1000 + Math.floor(Math.random() * 1000));
}

/**
 * Wraps useMutation so that, when offline (or a request fails with a network error),
 * the change is applied optimistically to the cache and queued in IndexedDB for replay
 * once the connection returns (see lib/offlineSync.ts).
 */
export function useOfflineMutation<TVars, TResult>(config: OfflineMutationConfig<TVars, TResult>) {
  const queryClient = useQueryClient();

  return useMutation<TResult, Error, TVars>({
    // Default networkMode "online" pauses the mutation entirely while
    // navigator.onLine is false — mutationFn never runs, so it can't reach
    // the offline-queueing branch below. "always" lets it run unconditionally
    // and we handle the offline case ourselves.
    networkMode: "always",
    mutationFn: async (vars: TVars) => {
      const offline = typeof navigator !== "undefined" && !navigator.onLine;

      if (offline && config.vaultSensitive?.(vars)) {
        throw new OfflineVaultError();
      }

      const queueOffline = async (): Promise<TResult> => {
        const tempId = config.method === "post" ? nextTempId() : undefined;
        const result = config.optimisticUpdate(queryClient, vars, tempId);
        await offlineQueue.enqueue({
          module: config.module,
          method: config.method,
          url: config.url(vars, tempId),
          payload: config.payload?.(vars, tempId),
          tempId,
          detailKey: config.detailKey,
          invalidates: (config.invalidates?.(vars, result) ?? []) as unknown[][],
        });
        return result;
      };

      if (offline) return queueOffline();

      try {
        const res = await callApi(config.method, config.url(vars), config.payload?.(vars));
        const result = config.parseResponse
          ? config.parseResponse(res.data as never, vars)
          : (res.data as TResult);
        config.invalidates?.(vars, result).forEach((key) =>
          queryClient.invalidateQueries({ queryKey: key }),
        );
        return result;
      } catch (err) {
        if (isOfflineError(err)) return queueOffline();
        throw err;
      }
    },
  });
}
