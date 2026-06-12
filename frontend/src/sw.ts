/// <reference lib="webworker" />

import { defaultCache } from "@serwist/next/worker";
import {
  NetworkFirst,
  NetworkOnly,
  StaleWhileRevalidate,
  Serwist,
} from "serwist";
import type { PrecacheEntry } from "workbox-precaching";

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: (PrecacheEntry | string)[];
};

// Background Sync API isn't in the default TS DOM lib.
interface SyncEvent extends ExtendableEvent {
  readonly tag: string;
}

const serwist = new Serwist({
  // In dev, Next.js doesn't generate a precache manifest (__SW_MANIFEST is
  // undefined), so the /offline fallback below would never be precached and
  // a fully-offline document request (no cache entry yet) would surface as
  // an uncaught "no-response" error instead of the fallback page.
  // Precaching it explicitly here makes the fallback work in both dev and prod.
  precacheEntries: [...(self.__SW_MANIFEST ?? []), "/offline"],
  skipWaiting: true,
  clientsClaim: true,

  runtimeCaching: [
    // SECURITY: Never cache vault routes. Encrypted blobs are useless without
    // the vault key, and caching auth/unlock routes would be dangerous.
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/vault/"),
      handler: new NetworkOnly(),
    },

    // All other API routes: try network first (5 s timeout), fall back to cache.
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/"),
      handler: new NetworkFirst({
        networkTimeoutSeconds: 5,
        cacheName: "linkvault-api",
      }),
    },

    // Images: serve from cache, refresh in background.
    {
      matcher: ({ request }) => request.destination === "image",
      handler: new StaleWhileRevalidate({ cacheName: "linkvault-images" }),
    },

    // Next.js static assets, fonts, scripts — handled by defaultCache.
    ...defaultCache,
  ],

  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();

// PW-3: when the page registers a 'replay-mutations' background sync (on reconnect),
// wake up any open clients so they can replay the offline mutation queue. The actual
// replay runs on the page (it needs the live React Query client + auth token) — see
// features/shared/hooks/useOfflineSync.ts.
self.addEventListener("sync", (event) => {
  const syncEvent = event as SyncEvent;
  if (syncEvent.tag === "replay-mutations") {
    syncEvent.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => client.postMessage({ type: "REPLAY_MUTATIONS" }));
      }),
    );
  }
});
