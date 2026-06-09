# Links Module — Frontend Optimization Plan

Ordered by priority. Review and pick which to implement.
https://github.com
---

## 🔴 High Impact

### 1. Metadata auto-fetch ✅
When the user types or pastes a URL in LinkForm, automatically fetch the page title, description, and favicon and pre-fill the form fields. User can still override any auto-filled value.

**Backend:** new `GET /api/links/meta?url=` endpoint — scrapes `<title>`, `og:title`, `og:description`, `og:image`, and favicon using `axios` + regex (no heavy scraping library needed for basic tags).  
**Frontend:** `useEffect` with a 600ms debounce on the URL field → calls the meta endpoint → fills title/description if the fields are still empty.

---

### 2. Bulk actions (multi-select) ✅
Allow selecting multiple cards at once, then act on all of them.

**UI:** checkbox appears on card hover (or via a "Select" mode toggle); a floating action bar slides in at the bottom showing "Delete X" and "Favorite X" buttons.  
**Actions:** Delete (call `useDeleteLink` per item, or a new `DELETE /api/links/bulk` endpoint with `{ ids[] }`); Toggle favorite.  
**State:** `selectedIds: Set<number>` in page state, cleared on any navigation or modal open.

---

### 3. Draggable link cards (custom order)
Drag cards to reorder them. Order persists across sessions.

**Backend:** add `position` integer column to `links` table; new `PATCH /api/links/reorder` endpoint accepts `[{ id, position }]` and bulk-updates positions.  
**Frontend:** `@dnd-kit/core` + `@dnd-kit/sortable` (lightweight, accessible). `SortableContext` wraps the grid; on drag end, optimistically reorder locally and patch the backend.  
**Sort logic:** when a user has set a custom order, switch the default sort from `updatedAt DESC` to `position ASC`. A "Reset order" button in the filters bar restores recency sort.

---

## 🟠 Medium

### 4. Sort & filter controls
Add a "Sort by" dropdown to the filters bar: **Newest · Oldest · A–Z · Z–A · Recently visited**.

Currently the backend hard-codes `ORDER BY link.updatedAt DESC`. Accept `sortBy` and `sortDir` query params in the controller and pass them through the service's query builder.

---

### 5. Tag filter in UI
Tag filtering already works in the backend and hook (`tagIds` param) but there's no UI control for it. Add a tag multi-select to the filters bar.

Reuse the existing `TagSelector` component (`src/components/tags/TagSelector.tsx`) — already has search, checkboxes, and removable pills. Wire it to the `tagIds` filter in `useLinks`.

---

### 6. OG image / preview thumbnail
Show the page's `og:image` at the top of the LinkCard as a thumbnail strip. Falls back to a colored placeholder with the domain initial if no image is available.

Extends item 1 (metadata auto-fetch) — just also store `thumbnailUrl` on the Link entity at save time. In LinkCard, render `<img src={link.thumbnailUrl}>` with an `onError` fallback.

---

### 7. URL duplicate detection
When typing a URL that the user already saved, show an inline warning inside the form: *"You already have this link — [view it]"* with a link to the existing card. Prevents accidental duplicates.

Frontend-only check: scan the current `useLinks` pages data for a matching URL before or during form submission. No backend change needed.

---

### 8. Favicon fallback (letter avatar)
The current favicon source is Google's API (`s2/favicons`). Privacy-focused browsers block it, leaving an empty icon slot.

Add an `onError` handler to the favicon `<img>` in `LinkCard.tsx` that replaces it with a small `<div>` letter avatar (first letter of the domain, accent background). Already styled like the category badges in the design system.

---

### 9. Grid density toggle
Let users switch between **Comfortable** (current large cards) and **Compact** (smaller cards, more per row). Preference stored in `localStorage`.

CSS-only change: a `data-density` attribute on the grid element drives two size variants via CSS. A toggle button (two-column icon) sits in the filters bar.

---

## 🟡 Nice-to-Have

### 10. Link health check (dead link detection)
Detect links that return 4xx/5xx or time out.

**Backend:** a manual "Check links" button → hits each URL from the server side (avoids CORS) and stores `isAlive: boolean` + `lastCheckedAt` on the entity.  
**Frontend:** dead link warning badge on the card; a filter "Show broken links only" in the filters bar.

---


### 13. Copy URL button
A copy icon on each card that copies the full URL to clipboard and flashes a brief "Copied!" state (same pattern as the Snippets module which already has this).

No backend change. Reuse `navigator.clipboard.writeText` + a `copiedId` state already present in the Snippets page.

---

## Summary table

| # | Item | Scope | Effort |
|---|---|---|---|
| 1 | Metadata auto-fetch | Full-stack | Medium |
| 2 | Bulk actions | Full-stack | Medium |
| 3 | Draggable cards | Full-stack | High |
| 4 | Sort controls | Full-stack | Low |
| 5 | Tag filter UI | Frontend | Low |
| 6 | OG image thumbnail | Full-stack | Low (extends #1) |
| 7 | Duplicate detection | Frontend | Low |
| 8 | Favicon fallback | Frontend | Low |
| 9 | Grid density toggle | Frontend | Low |
| 10 | Dead link detection | Full-stack | High |
| 11 | Import / export | Full-stack | Medium |
| 13 | Copy URL button | Frontend | Low |
| 14 | Recently visited | Full-stack | Low |




### 11. Import / export

| Direction | Format | Notes |
|---|---|---|
| Export | CSV | id, title, url, description, tags, category |
| Export | Netscape Bookmarks HTML | Compatible with all browsers for re-import |
| Import | Netscape Bookmarks HTML | Parse file client-side, bulk-create via existing API |

Export button in the page header; import via a file `<input>` in a small modal.

---
### 14. Recently visited tracking
Track the last time the user clicked a link to open it. Store `lastVisitedAt` on the entity and patch it via `PATCH /api/links/:id/visit` on every open-click.

Show "Last visited X days ago" on the card footer. Adds a new sort option to item 4.

--- 
