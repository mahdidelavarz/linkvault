# PWA — Dev Map

---

## Current State

**Phase 1 (Install & Standalone) — complete as of 2026-06-05.**

Serwist is installed and configured. A service worker is compiled to `public/sw.js` with caching strategies for static assets. The manifest is fully specified with `display_override`, shortcuts, categories and maskable icons. iOS metadata (apple-touch-icon, splash startup images) is wired in `layout.tsx`.

**What works:**
- Service worker registers and caches static assets
- Manifest passes the installability checklist on Android Chrome
- `usePwaInstall` captures `beforeinstallprompt`; `install()` triggers the native prompt
- `InstallBanner` renders: Android install button, iOS Share-sheet walkthrough, SW update toast (priority)
- `useSwUpdate` detects waiting service worker; "Update available" toast lets user apply without manual refresh
- Mobile LAN access works via Next.js proxy rewrite (`/api/*` → backend). Phone never connects to backend port directly
- Root page shows a spinner instead of blank dark screen during JS boot on mobile

**Outstanding manual action (Phase 1):**
- Splash screen PNGs in `public/splash/` must be generated (metadata links exist, files don't). Run `pwa-asset-generator` or export from Figma at the sizes listed in `layout.tsx`
- PWA install prompt and service worker require **HTTPS**. On LAN HTTP (development), core app works but `beforeinstallprompt` and SW registration are blocked by browser security. Manual testing on Android Chrome / iOS Safari needs production HTTPS or `mkcert` + local HTTPS


---

## Remaining Work — P5-9 (Not Started)

[DEVMAP.md](DEVMAP.md) P5-9: offline UX is currently misleading (banner says read-only but write buttons still work). PW-1 through PW-3 complete the offline story; PW-4 is the first Phase 3 item.



Use a separate IndexedDB store from `linkvault-query-cache` (React Query persister) and `SecureVaultDB` (vault key storage, see [dev_security.md](dev_security.md)).

**Critical rule:** the offline queue must not queue vault operations — if the vault is locked or offline, sensitive mutations must fail explicitly, not silently queue.

### PW-3 — Background sync registration + replay
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

After PW-1 through PW-3: test by turning off network → browse → make changes → turn on → verify queued mutations sync.

### PW-4 — Share Target (Phase 3)
Let users share URLs from other apps directly into the Links module:
```typescript
// In manifest.ts
share_target: {
  action: '/links/new',
  method: 'GET',
  params: { title: 'title', text: 'text', url: 'url' },
}
```
In `src/app/links/new/page.tsx`, read the `url` search param and pre-fill the form.

