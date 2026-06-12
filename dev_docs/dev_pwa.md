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

## Phase 2/3 — Offline CRUD (PW-1 to PW-3) — Links done, 2026-06-12

PW-1 through PW-3 are implemented as shared infrastructure plus a reference rollout to the **Links** module. The pattern is in place and working; the remaining modules still need to be converted (see "Remaining Work" below).

**Shared infrastructure (used by every module once converted):**
- `frontend/src/lib/offlineQueue.ts` — separate IndexedDB DB `linkvault-offline-queue` (store `mutations`, keyPath `id`), distinct from `linkvault-query-cache` (React Query persister) and `SecureVaultDB` (vault key storage, see [dev_security.md](dev_security.md)). `enqueue()` / `getAll()` / `remove()` / `update()` / `clear()`, with `BroadcastChannel` notifications for live badge updates.
- `frontend/src/features/shared/hooks/useOfflineMutation.ts` — generic `useMutation` wrapper. While offline, applies `optimisticUpdate` to the React Query cache and enqueues the mutation instead of calling the API. Uses `networkMode: "always"` (see "Bug fixes" below for why this matters).
- `frontend/src/lib/offlineSync.ts` + `frontend/src/features/shared/hooks/useOfflineSync.ts` — replays the queue in order on reconnect (online event, app mount with a non-empty queue, or a Background Sync wake-up message from the SW), remaps temp negative ids to real ids, and re-invalidates affected queries.
- `frontend/src/sw.ts` — `sync` event listener for tag `replay-mutations`, posts `REPLAY_MUTATIONS` to open clients (Background Sync is Chromium-only; the `online` event listener is the primary trigger).
- `frontend/src/features/pwa/components/SyncStatusBadge.tsx` + `useOfflineQueue.ts` — "N changes pending sync" indicator, mounted in `(dashboard)/layout.tsx` next to `OfflineBanner`.
- `OfflineBanner.tsx` copy updated to "You're offline — changes will be saved locally and synced when you're back online" (no longer claims read-only).

**Critical rule:** the offline queue must not queue vault operations — if the vault is locked or offline, sensitive mutations fail explicitly via `OfflineVaultError` (checked through each hook's `vaultSensitive` predicate), not silently queued.

**Links module (`frontend/src/features/links/hooks/useLinks.ts`) — full offline CRUD:**
- Create/update/delete/toggle-favorite all go through `useOfflineMutation`.
- Create uses a negative `tempId` for the optimistic item; `vaultSensitive` blocks offline create/update when a password is set and the vault is enabled.
- `LinkForm.tsx`'s Credentials section is only gated behind vault-unlock when editing an existing link that already has an encrypted secret (`isEditing && !!link?.passwordEncrypted`) — a brand-new link with no sensitive fields never prompts for the vault PIN.

**Other modules — offline CRUD NOT yet implemented.** Snippets, Prompts (+ Prompt Collections), Notes, Projects, Infrastructure, Tags, and Categories still call the API directly; their create/update/delete will fail with "You are offline" while offline (no optimistic update, no queueing). Converting each follows the same pattern as `useLinks.ts` — see "Remaining Work".

### Bug fixes from manual offline testing of Links (2026-06-12)

Three bugs found during manual testing were fixed:

1. **Query cache persistence breaking on restore** ("promise.then is not a function" / dehydrated-as-pending `CancelledError`). Fixed in `frontend/src/app/providers.tsx`: `shouldDehydrateQuery` now only persists queries with `state.status === "success"` — persisting an in-flight ("pending") query serialized its promise to `{}`, which broke on rehydration.
2. **Vault PIN prompt on new links with no sensitive data.** Fixed in `LinkForm.tsx` by scoping `<VaultGuard>` to `isEditing && !!link?.passwordEncrypted` (was previously gating the whole Credentials section any time the vault was enabled, even for brand-new links).
3. **Create-link form stuck on submit forever while offline** (spinner never resolves, nothing queued). Root cause: React Query's default `networkMode: "online"` *pauses* mutations entirely while `navigator.onLine === false` — `mutationFn` never runs, so the offline-queueing branch is never reached. Fixed by setting `networkMode: "always"` in `useOfflineMutation.ts`, so `mutationFn`'s own offline check takes over.
4. **Offline navigation/reload (`/links/[id]` RSC fetch failure, "no-response" on hard reload of `/links`).** Root cause: `sw.ts`'s `fallbacks.entries` pointed at `/offline`, but `/offline` was never actually precached (`self.__SW_MANIFEST` is empty in dev, so `matchPrecache('/offline')` always returned `undefined` and the fallback silently failed). Fixed by explicitly adding `"/offline"` to `precacheEntries` in `sw.ts` regardless of dev/prod.

---

## Remaining Work — P5-9

### PW-3 rollout — convert remaining modules to offline CRUD
Apply the `useOfflineMutation` pattern from `useLinks.ts` to:
- `frontend/src/features/snippets/hooks/useSnippet.ts`
- `frontend/src/features/prompts/hooks/usePrompts.ts` and `usePromptCollections.ts`
- `frontend/src/features/notes/hooks/useNotes.ts` (auto-save → treat as `update`)
- `frontend/src/features/projects/hooks/useProjects.ts` (membership add/remove, `useReorderProjectItems`)
- `frontend/src/features/infrastructure/hooks/useInfrastructure.ts` (`vaultSensitive` for `env` content, same as Links' password)
- `frontend/src/features/categories/hooks/useCategories.ts`, `frontend/src/features/tags/hooks/useTags.ts`

After each module: test by turning off network → browse → make changes → turn on → verify queued mutations sync and `SyncStatusBadge` clears.

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

