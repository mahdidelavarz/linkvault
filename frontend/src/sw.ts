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

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
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
