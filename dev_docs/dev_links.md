# Links Module — Dev Analysis

---

## Module Overview

The Links module is the most-used feature in LinkVault — a bookmark/credentials manager where users save URLs with optional title, description, category, tags, and credential fields (username, password, email, phone). It supports metadata auto-fetch, vault-encrypted passwords, infinite scroll, bulk operations, and project membership.

**Key files:**
- `src/app/(dashboard)/links/page.tsx` — page, filter bar, grid, bulk select mode
- `src/components/links/LinkCard.tsx` — card component with vault-aware credential display
- `src/components/links/LinkForm.tsx` — create/edit form with URL metadata auto-fetch
- `src/hooks/useLinks.ts` — React Query hooks (infinite scroll, mutations)
- `src/types/link.ts` — `Link`, `CreateLinkDto`, `UpdateLinkDto` interfaces
- `src/lib/api/links.ts` — API client
- `backend/src/routes/links.route.ts` — 8 REST endpoints
- `backend/src/controllers/Links.controller.ts` — request handlers
- `backend/src/services/Link.service.ts` — business logic, metadata fetch, tag sync
- `backend/src/entities/Link.ts` — TypeORM entity

---

## Bugs & Issues

### 1. SSRF vulnerability in `fetchMeta()` ✅ (partial — Api.service.ts fixed, links missed)
**File:** `backend/src/services/Link.service.ts` `fetchMeta()`
The `ssrf.util.ts` SSRF validator was added for `Api.service.ts` but not wired into `Link.service.ts fetchMeta()`. The metadata fetch calls `axios.get(url)` directly — an attacker can trigger server-side requests to internal/loopback addresses via any link URL.
**Fix:** Import and call `validateUrl()` from `ssrf.util.ts` in `fetchMeta()` before the axios call.

### 2. N+1 tag loading on list query
**File:** `backend/src/services/Link.service.ts` `loadTagsForLinks()`
`loadTagsForLinks()` runs one query per link to fetch its tags (lines 249–254). With 20 links per page, that's 20 extra round-trips per page load.
**Fix:** Batch query: `taggableRepository.find({ where: { taggableId: In(linkIds), taggableType: 'link' } })`, then group by `taggableId` in JS.

### 3. N+1 tags via `getItemIdsByTags()`
**File:** `backend/src/services/Link.service.ts` `getItemIdsByTags()`
Loads ALL taggables from DB and filters in JS instead of using a `WHERE taggableType = 'link' AND tagId IN (...)` query.
**Fix:** Add proper WHERE clause to the taggable query.

### 4. Bulk delete is N+1 HTTP requests
**File:** `src/app/(dashboard)/links/page.tsx` `handleBulkDelete()`
Frontend calls `deleteLink.mutateAsync(id)` in a loop. No backend bulk endpoint exists.
**Fix:** Add `DELETE /api/links/bulk` endpoint (accepts `{ ids: string[] }`), update frontend to use it.

### 5. Password "clear on edit" not possible
**File:** `backend/src/services/Link.service.ts` `update()`
If a user edits a link and leaves the password field empty, the backend treats `undefined` as "no change" and keeps the old encrypted value. There is no way to remove a saved password.
**Fix:** Pass an explicit `clearPassword: true` field in the DTO, or treat empty string (`""`) as an explicit clear signal.

### 6. Metadata fetch errors are silent
**File:** `backend/src/services/Link.service.ts` `fetchMeta()` + `src/components/links/LinkForm.tsx`
When the metadata fetch fails (404, network error, CORS), the controller catches the error and returns `{}`. The form gets no feedback — the auto-fill fields just stay blank with no indication of what happened.
**Fix:** Return a `{ error: string }` field from the endpoint, detect it in `useFetchLinkMeta`, and show a brief toast ("Couldn't fetch page info").

### 7. Favicon shows broken slot when Google API blocked
**File:** `src/components/links/LinkCard.tsx`
Uses only `https://www.google.com/s2/favicons?domain=...` with an `onError` that hides the image. Privacy-focused browsers (Firefox ETP, Brave, Safari ITP) block this API. The favicon slot renders empty — looks like a visual bug.
**Fix:** On error, render a letter avatar using the first character of the domain (same pattern used elsewhere in the app).

### 8. Description length limit mismatch
**File:** `src/components/links/LinkForm.tsx` (zod schema, max 1000) vs `backend/src/validation/schemas.ts` (max 5000)
API accepts up to 5000 chars but the form caps at 1000. A description pasted via API that's 2000 chars will save but cannot be re-edited via the form.
**Fix:** Align both to 2000 characters.

### 9. URL max length not validated
**File:** `src/components/links/LinkForm.tsx` + `backend/src/validation/schemas.ts`
DB column is `varchar(2048)` but neither frontend nor backend schema enforces a max length on the URL field.
**Fix:** Add `.max(2048)` to both zod schemas.

---

## Current Features

- **URL with auto-fill** — 600ms debounce on URL change triggers metadata fetch (og:title, og:description, favicon); "Auto-filled" badge appears; paste handler upgrades `http://` to `https://`
- **Credential storage** — username, password (encrypted), email, phone; show/hide password toggle
- **Vault integration** — VaultGuard wraps credentials section; `vault:encrypted` sentinel in DB; card handles locked/unlocked/pre-vault states
- **Full-text search** — title, description, URL, username
- **Filter bar** — search input, category dropdown, TagSelector, favorites toggle; all filters additive
- **Active filter chips** with individual clear buttons
- **Infinite scroll pagination** — 20 links per page with sentinel ref
- **Bulk select mode** — checkbox on cards, SelectBar with bulk delete + bulk favorite
- **Favorite toggle** — instant optimistic update
- **Category assignment** — single category per link
- **Multi-tag support** — TagSelector in form + tag chips on card
- **Project membership** — ProjectBadge on card, AddToProjectModal, multi-project edit warning
- **Skeleton loaders** during initial and paginated fetch
- **Contextual empty state** — message changes based on active filters
- **Delete confirmation** — modal before deletion
- **Responsive CSS grid** — auto-fill, 340px minimum column width
- **Dashboard integration** — quick-action button, stat card, recent activity feed
- **Global search integration** — links appear in site-wide Ctrl+K palette and search page

---

## Missing Features

### S-tier — Implement

| # | Feature | Why |
|---|---------|-----|
| S-1 | **Sort controls** — title A–Z, date added (asc/desc), date updated (asc/desc) | Hardcoded `updatedAt DESC`. As vaults grow past 100 links, alphabetical sort becomes essential. |
| S-2 | **Copy URL button** on card footer | Every bookmark manager has this. Currently user must open the link or copy from address bar. One-line addition with Clipboard API + "Copied!" toast. |
| S-3 | **Duplicate URL detection** on form save | Users frequently save the same link twice. Should warn (not block) with a "You already have this URL saved as X — save anyway?" confirmation. |

### A-tier — Implement

| # | Feature | Why |
|---|---------|-----|
| A-1 | **Result count badge** in filter bar | Filter bar shows active filters but not how many links matched. Mirrors the pattern in Snippets/Prompts/Infra. |
| A-2 | **Link visit tracking** — open external link records `lastVisitedAt` | Enables "Recently visited" sort and surfaces stale links. Low effort: update `lastVisitedAt` on the `GET /:id` route. |
| A-3 | **Open count** — increment a `visitCount` on external link open | Enables "Most visited" sort variant. Same endpoint as A-2. |

### B-tier — Defer

| # | Feature | Why deferred |
|---|---------|-------------|
| B-1 | Import from browser bookmarks (Netscape HTML) | High user value but scoped feature. Defer post-P5. |
| B-2 | Export to CSV / Netscape HTML | Same as B-1. |
| B-3 | Grid density toggle (comfortable / compact) | Nice-to-have polish. Not a workflow blocker. |
| B-4 | Link health check (detect 404/dead links) | Requires background job or batch endpoint. Large scope. |
| B-5 | OG image thumbnails | Needs DB column + migration + storage. Scope creep. |

### C-tier — Not building

| Feature | Reason |
|---------|--------|
| Drag-to-reorder on links page | Complex with infinite scroll. Projects page already has drag-to-reorder. |
| `position` column for custom sort | Only needed if drag-to-reorder is built. |
| `lastVisitedAt` as a DB column | Could use A-2's `lastVisitedAt` but high-churn data belongs in a separate lightweight log, not the main `links` row. |

---

## Performance Notes

- `loadTagsForLinks()` — N+1 per link (see Bug #2)
- `getItemIdsByTags()` — full table scan (see Bug #3)
- Search runs LIKE wildcards on `description` and `username` columns with no index — acceptable for MVP vault sizes (< 10k rows) but will degrade

---

## Implementation Plan (L-3)

> Decided items for P5-2 implementation:

**Bugs to fix:**
- [x] Bug 1 — SSRF in `fetchMeta()`
- [x] Bug 2+3 — N+1 tag loading (batch queries)
- [x] Bug 4 — Bulk delete endpoint + frontend
- [x] Bug 5 — Password clear on edit
- [x] Bug 6 — Metadata fetch error toast
- [x] Bug 7 — Favicon letter-avatar fallback
- [x] Bug 8+9 — Validation length alignment

**Features to add:**
- [x] S-1 — Sort controls (title A–Z, date added, date updated)
- [x] S-2 — Copy URL button
- [x] S-3 — Duplicate URL detection
- [x] A-1 — Result count badge in filter bar

> A-2/A-3 (visit tracking) deferred — requires a DB migration and `PATCH /:id/visit` endpoint, not blocking.

---

*Created: 2026-06-09 — P5-2 L-1 exploration complete*
