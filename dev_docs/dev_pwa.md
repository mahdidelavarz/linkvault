# PWA — Dev Map

## Current State

**Phase 1 complete as of 2026-06-05.**

Serwist is installed and configured. A service worker is compiled to `public/sw.js` with caching strategies for static assets. The manifest is fully specified with `display_override`, shortcuts, categories and maskable icons. iOS metadata (apple-touch-icon, splash startup images) is wired in `layout.tsx`.

**What works:**
- Service worker registers and caches static assets
- Manifest passes the installability checklist on Android Chrome
- `usePwaInstall` captures `beforeinstallprompt`; `install()` triggers the native prompt
- `InstallBanner` renders: Android install button, iOS Share-sheet walkthrough, SW update toast (priority)
- `useSwUpdate` detects waiting service worker; "Update available" toast lets user apply without manual refresh
- Mobile LAN access works via Next.js proxy rewrite (`/api/*` → backend). Phone never connects to backend port directly
- Root page shows a spinner instead of blank dark screen during JS boot on mobile

**What still needs manual action:**
- Splash screen PNGs in `public/splash/` must be generated (metadata links exist, files don't). Run `pwa-asset-generator` or export from Figma at the sizes listed in `layout.tsx`
- PWA install prompt and service worker require **HTTPS**. On LAN HTTP (development), core app works but `beforeinstallprompt` and SW registration are blocked by browser security. Works in production or with `mkcert` + local HTTPS

**Phase 2 (offline support) is complete as of 2026-06-08 (P4-C):**
- ✅ `/offline` fallback page (`src/app/offline/page.tsx`)
- ✅ `src/sw.ts` updated: `NetworkOnly` for `/api/vault/*` (security rule), `NetworkFirst` for `/api/*` (5s timeout), `StaleWhileRevalidate` for images, `/offline` fallback for navigation
- ✅ IndexedDB persistence for React Query cache (`src/lib/idb-persister.ts` + `persistQueryClient` in providers.tsx). Vault queries excluded.
- ✅ `useNetworkStatus` hook (`src/hooks/useNetworkStatus.ts`) + `OfflineBanner` component in dashboard layout
- ⬜ Mutation queue for offline writes — not yet built
- ⬜ Background sync replay — not yet built

---

## Why Issue 2 Happens (The Root Cause)

The browser hides its chrome (address bar, navigation) only when **all three conditions** are met simultaneously:
1. The manifest is valid, linked, and served with the correct `Content-Type: application/manifest+json`
2. The manifest contains `"display": "standalone"`
3. The app was installed through the proper install flow — not just bookmarked

On iOS, there's a fourth requirement: the `<meta name="apple-mobile-web-app-capable" content="yes">` tag must be present **and** the app must be added via the Share → "Add to Home Screen" flow specifically. If the user uses any other method, standalone mode does not activate.

The current setup has `display: standalone` in the manifest and the apple meta tag set via Next.js metadata API. The most likely culprits are:
- Icons don't fully satisfy the installability checklist (maskable variant missing or incorrectly sized)
- Manifest `Content-Type` header not returned correctly in production
- Users using "Add to Home Screen" incorrectly on iOS (tapping address bar bookmark instead of Share sheet)

---

## Phase 1 — Fix Installability & Standalone Mode

### 1.1 Manifest Audit and Fix

The current manifest (`src/app/manifest.ts`) needs additions:

```typescript
// src/app/manifest.ts
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LinkVault',
    short_name: 'LinkVault',
    description: 'Developer knowledge vault',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
    orientation: 'portrait',
    theme_color: '#0f172a',
    background_color: '#0f172a',
    categories: ['productivity', 'developer-tools'],
    icons: [
      { src: '/icons/icon-192.png',  sizes: '192x192',  type: 'image/png' },
      { src: '/icons/icon-512.png',  sizes: '512x512',  type: 'image/png' },
      { src: '/icons/icon-512.png',  sizes: '512x512',  type: 'image/png', purpose: 'maskable' },
      { src: '/icons/icon-192.png',  sizes: '192x192',  type: 'image/png', purpose: 'any' },
    ],
    screenshots: [
      {
        src: '/screenshots/mobile-home.png',
        sizes: '390x844',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Dashboard',
      },
    ],
    shortcuts: [
      { name: 'New Snippet', url: '/snippets?new=1',       icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
      { name: 'New Prompt',  url: '/prompts?new=1',        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
      { name: 'Search',      url: '/search',                icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
    ],
  }
}
```

**`display_override`** is the key addition — modern browsers check this array in order before falling back to `display`. `window-controls-overlay` hides the browser chrome on desktop PWA installs as well.

---

### 1.2 iOS-Specific Icons and Splash Screens

iOS does not use the manifest for icons or splash screens — it reads `<link rel="apple-touch-icon">` and `<link rel="apple-touch-startup-image">` tags only.

Add to `src/app/layout.tsx` inside the `metadata` export:

```typescript
export const metadata: Metadata = {
  // ...existing...
  appleWebApp: {
    capable: true,
    title: 'LinkVault',
    statusBarStyle: 'black-translucent',
    startupImage: [
      // iPhone 14 Pro Max
      { url: '/splash/splash-1290x2796.png', media: '(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)' },
      // iPhone 14 / 13 / 12
      { url: '/splash/splash-1170x2532.png', media: '(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)' },
      // iPhone SE
      { url: '/splash/splash-750x1334.png',  media: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)' },
    ],
  },
  icons: {
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180' },
    ],
  },
}
```

Generate `apple-touch-icon.png` at 180×180 and the splash screen PNGs at the standard sizes. Tools: `pwa-asset-generator` or Figma export.

---

### 1.3 Install Prompt — Custom UI

The `beforeinstallprompt` event fires on Android Chrome/Edge when the app meets installability criteria. iOS does not fire this event — show a manual instruction instead.

Create `src/hooks/usePwaInstall.ts`:

```typescript
'use client';
import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePwaInstall() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone === true;
    setIsStandalone(standalone);
    setIsIos(/iPad|iPhone|iPod/.test(navigator.userAgent));

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setIsInstalled(true));

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setInstallPrompt(null);
  };

  return { canInstall: !!installPrompt, isInstalled, isIos, isStandalone, install };
}
```

Create `src/components/pwa/InstallBanner.tsx` — show a bottom sheet banner:
- **Android:** "Install LinkVault for faster access" with an Install button that calls `install()`
- **iOS:** "Tap the Share button, then 'Add to Home Screen'" with a step-by-step visual
- **Already installed / standalone:** render nothing

Show the banner once (store dismissal in localStorage). A good trigger is 3 minutes after first visit.

---

### 1.4 Service Worker Update Notification

When a new service worker is waiting, notify the user:

```typescript
// src/hooks/useSwUpdate.ts
export function useSwUpdate() {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.ready.then(reg => {
      reg.addEventListener('updatefound', () => {
        const newSw = reg.installing!;
        newSw.addEventListener('statechange', () => {
          if (newSw.state === 'installed' && navigator.serviceWorker.controller) {
            setWaiting(newSw);
          }
        });
      });
    });
  }, []);

  const update = () => {
    waiting?.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
  };

  return { updateAvailable: !!waiting, update };
}
```

Show a non-blocking toast: "Update available — Refresh to get the latest version" with a Refresh button.

---

## Phase 2 — Offline Support

### 2.1 Offline Fallback Page

Create `src/app/offline/page.tsx`. This is the page served when the user is offline and navigates to a route that isn't cached:

```tsx
export default function OfflinePage() {
  return (
    <div className="offline-page">
      <WifiOff />
      <h1>You're offline</h1>
      <p>Your vault is still accessible — any items you've viewed recently are available below.</p>
      {/* Link to cached modules */}
    </div>
  )
}
```

Register this page as the offline fallback in `src/sw.ts`:

```typescript
// src/sw.ts
import { defaultCache } from '@serwist/next/worker';
import { Serwist } from 'serwist';

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  offlineAnalyticsConfig: false,
  fallbacks: {
    entries: [
      {
        url: '/offline',
        matcher({ request }) {
          return request.destination === 'document';
        },
      },
    ],
  },
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();
```

---

### 2.2 API Caching Strategy

The current service worker uses generated default caching. API calls to `/api/*` need explicit strategy configuration in `src/sw.ts`:

```typescript
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'serwist';

const runtimeCaching = [
  // API responses — NetworkFirst with 48-hour cache fallback
  {
    matcher: ({ url }) => url.pathname.startsWith('/api/') && !url.pathname.startsWith('/api/vault'),
    handler: new NetworkFirst({
      cacheName: 'api-cache',
      networkTimeoutSeconds: 5,
      plugins: [{
        cacheWillUpdate: async ({ response }) => response.status === 200 ? response : null,
      }],
    }),
    method: 'GET',
  },

  // Vault API — NetworkOnly, never cache secrets
  {
    matcher: ({ url }) => url.pathname.startsWith('/api/vault'),
    handler: new NetworkOnly(),
  },

  // Static assets — CacheFirst (they have content hashes)
  {
    matcher: ({ request }) => ['style', 'script', 'font'].includes(request.destination),
    handler: new CacheFirst({ cacheName: 'static-assets' }),
  },

  // Images — StaleWhileRevalidate
  {
    matcher: ({ request }) => request.destination === 'image',
    handler: new StaleWhileRevalidate({ cacheName: 'images' }),
  },
];
```

**Critical rule:** Never cache `/api/vault/*` responses. Encrypted blobs are useless without the vault key, but more importantly, you don't want sensitive auth routes cached anywhere.

---

### 2.3 IndexedDB — Persistent Data Cache

The goal: when the user is offline, they can still browse items they've previously viewed. Use `idb` (already a dependency) to persist React Query's cache across sessions.

Create `src/lib/idb-persister.ts`:

```typescript
import { openDB } from 'idb';
import { createPersister } from '@tanstack/query-persist-client-core';

const DB_NAME = 'linkvault-query-cache';
const STORE_NAME = 'cache';

export async function getIdbPersister() {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME);
    },
  });

  return createPersister({
    storage: {
      getItem: (key) => db.get(STORE_NAME, key),
      setItem: (key, value) => db.put(STORE_NAME, value, key),
      removeItem: (key) => db.delete(STORE_NAME, key),
    },
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    key: 'linkvault-rq-cache',
  });
}
```

Wire it into `src/app/providers.tsx`:

```typescript
// In the QueryClientProvider setup, add:
const [persister] = useState(() => /* lazy init getIdbPersister() */);

<PersistQueryClientProvider
  client={queryClient}
  persistOptions={{ persister, maxAge: 24 * 60 * 60 * 1000 }}
>
  {children}
</PersistQueryClientProvider>
```

**Result:** On first load, data is fetched from the network. On subsequent loads (online or offline), data is served instantly from IndexedDB. The network fetch happens in the background to update the cache.

**Separate IndexedDB stores** (to avoid namespace collision with the vault's `SecureVaultDB`):
- `linkvault-query-cache` — React Query persister (read-only offline access)
- `SecureVaultDB` — vault key storage (already defined in dev_security.md)

---

### 2.4 Network Status Hook and Offline UI

Create `src/hooks/useNetworkStatus.ts`:

```typescript
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const online  = () => setIsOnline(true);
    const offline = () => setIsOnline(false);
    window.addEventListener('online',  online);
    window.addEventListener('offline', offline);
    return () => {
      window.removeEventListener('online',  online);
      window.removeEventListener('offline', offline);
    };
  }, []);

  return isOnline;
}
```

Use it to show a persistent offline banner at the top of the app and disable write actions (create, edit, delete buttons go grey with a tooltip: "Available when online").

---

### 2.5 Background Sync — Queue Mutations While Offline

When the user creates or edits an item while offline, queue the action rather than failing silently.

Create `src/lib/offline-queue.ts` using IndexedDB:

```typescript
// Store pending mutations in IDB
interface PendingMutation {
  id: string;
  type: 'create' | 'update' | 'delete';
  module: string;   // 'snippets' | 'prompts' | etc.
  payload: unknown;
  createdAt: number;
}

export const offlineQueue = {
  add:    (mutation: Omit<PendingMutation, 'id' | 'createdAt'>) => { /* idb write */ },
  getAll: (): Promise<PendingMutation[]> => { /* idb readAll */ },
  remove: (id: string) => { /* idb delete */ },
};
```

Register a background sync event in `src/sw.ts`:
```typescript
self.addEventListener('sync', (event) => {
  if (event.tag === 'replay-mutations') {
    event.waitUntil(replayQueuedMutations());
  }
});
```

On reconnect, trigger `navigator.serviceWorker.ready.then(r => r.sync.register('replay-mutations'))`.

Show a subtle badge on the affected module: "2 changes pending sync" that clears when the sync completes.

---

## Phase 3 — Full PWA Feature Set

### 3.1 Manifest Enhancements

**Screenshots** (required for modern Chrome install UI to show the rich install dialog):
- Add at least one `narrow` (mobile) screenshot: 390×844 showing the dashboard
- Optional: one `wide` screenshot for desktop

**Share Target** — let users share URLs from other apps directly into the Links module:
```typescript
// In manifest.ts
share_target: {
  action: '/links/new',
  method: 'GET',
  params: { title: 'title', text: 'text', url: 'url' },
}
```

In `src/app/links/new/page.tsx`, read the `url` search param and pre-fill the form.

**Protocol Handler** — optional but powerful:
```typescript
protocol_handlers: [
  { protocol: 'web+linkvault', url: '/handle?url=%s' }
]
```

---

### 3.2 App Shortcuts (Already in Phase 1 Manifest)

The shortcuts defined in the manifest create long-press quick actions on Android. Ensure the `?new=1` query param is handled by the relevant pages to auto-open the create form.

---

### 3.3 Push Notifications (Future)

Structure when ready:
1. Register push subscription in `useVault` or a dedicated `useNotifications` hook
2. Store `PushSubscription` on the server (new `PushSubscription` entity/table)
3. Server sends notifications via Web Push (use `web-push` library)
4. Use cases: "5 items pending sync", "Vault auto-locked"

Not a priority for MVP.

---

### 3.4 Periodic Background Sync (Future)

Refresh stale cached data while the app is closed, so when the user opens it offline the data is still recent:

```typescript
// In sw.ts
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'refresh-vault-data') {
    event.waitUntil(prefetchRecentItems());
  }
});
```

Requires the app to be installed (not just added to home screen).

---

## Implementation Order

```
Phase 1 — Install & Standalone ✅ Done (2026-06-05)
  1. ✅ Audit manifest — add display_override, screenshots array, shortcuts
  2. ⚠️  Generate apple-touch-icon.png (180x180) and iOS splash screens — metadata wired, PNG files still need to be generated
  3. ✅ Add apple touch icon links to layout.tsx
  4. ✅ Build usePwaInstall hook (beforeinstallprompt + iOS detection)
  5. ✅ Build InstallBanner component (Android prompt + iOS instructions)
  6. ✅ Build useSwUpdate hook + "Update available" toast
  7. Manual test on Android Chrome requires HTTPS (not yet available on LAN HTTP dev setup)
  8. Manual test on iOS Safari requires HTTPS

Phase 2 — Offline (P4-C — 2026-06-08)
  9.  ✅ Create /offline page
  10. ✅ Update src/sw.ts with fallbacks config and explicit API caching rules
  11. ✅ Add @tanstack/query-persist-client-core dependency
  12. ✅ Implement idb-persister.ts (DB: linkvault-query-cache, separate from SecureVaultDB)
  13. ✅ Wire persistQueryClient in providers.tsx (vault queries excluded via shouldDehydrateQuery)
  14. ✅ Build useNetworkStatus hook
  15. ✅ Add offline banner to dashboard layout
  16. ⬜ Disable write action buttons when offline
  17. ⬜ Build offline-queue.ts for pending mutations
  18. ⬜ Register background sync in sw.ts
  19. ⬜ Test: turn off network → browse → turn on → verify sync

Phase 3 — Full Feature Set
  20. Add share target to manifest, handle in /links/new page
  21. Ensure ?new=1 param opens create form in all modules
  22. Add screenshots to /public/screenshots/ for rich install UI
  23. Push notifications setup (when backend is ready)
  24. Periodic background sync (after install base is established)
```

---

## Checklist — PWA Installability Criteria

Before testing installation, verify all of these:

- [ ] Served over HTTPS (required)
- [ ] Valid `manifest.webmanifest` linked in `<head>` with `rel="manifest"`
- [ ] Manifest has `name`, `short_name`, `start_url`, `display: standalone`
- [ ] Manifest has at least one icon ≥192×192 with `purpose: any`
- [ ] Manifest has at least one icon ≥512×512 with `purpose: maskable`
- [ ] Service worker registered and active
- [ ] Service worker intercepts fetch events
- [ ] `apple-mobile-web-app-capable` meta tag present (iOS)
- [ ] `apple-touch-icon` link present (iOS)
- [ ] App not already installed (Chrome won't re-prompt)

Use Chrome DevTools → Application → Manifest to verify. Chrome will show a "Installability" section listing what's missing.

---

## Common Pitfalls

**Android:** If the user dismisses the install prompt twice, Chrome will not show `beforeinstallprompt` again for 90 days. Always provide a permanent install button in settings as a fallback.

**iOS:** `beforeinstallprompt` does not exist on iOS Safari. You must show a manual instruction UI with screenshots. Do not show the Android install flow on iOS.

**Standalone detection:** `window.matchMedia('(display-mode: standalone)').matches` is the reliable cross-platform way. `navigator.standalone` only works on iOS. Check both.

**Cache busting:** When updating the service worker, the old cache needs to be cleared. Serwist handles this via the precache manifest, but custom runtime caches must be versioned manually (change `cacheName` in the strategy when the schema changes).

**Vault + offline:** Never cache `/api/vault/*` responses. The offline queue should not queue vault operations — if the vault is locked or offline, sensitive mutations must fail explicitly, not silently queue.
