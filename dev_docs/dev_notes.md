# Notes Module — Dev Analysis

---

## Module Overview

The Notes module is a sidebar-plus-editor layout: a scrollable list of note cards on the left, a full-height markdown editor on the right. Notes have a title, content (plain text / light markdown), optional category, tags, and a pin-to-top feature. The editor auto-saves with a 2s debounce. Notes are included in global search and project membership.

**Key files:**
- `frontend/src/app/(dashboard)/notes/page.tsx` — page, sidebar, filter bar
- `frontend/src/components/notes/NoteEditor.tsx` — editor with write/preview tabs, format buttons, auto-save
- `frontend/src/components/notes/NoteCard.tsx` — sidebar card (title, preview, tags, pin/edit/delete)
- `frontend/src/components/notes/NoteForm.tsx` — metadata modal (title, category, tags, pin)
- `frontend/src/hooks/useNote.ts` — React Query hooks + auto-save debounce
- `frontend/src/types/note.ts` — `Note`, `CreateNoteDto`, `UpdateNoteDto`
- `backend/src/routes/note.route.ts` — REST routes
- `backend/src/controllers/Notes.controller.ts` — request handlers
- `backend/src/services/Note.service.ts` — business logic, tag sync
- `backend/src/entities/Note.ts` — TypeORM entity

---

## Bugs & Issues

### 1. Markdown list items each get their own `<ul>` wrapper
**File:** `NoteEditor.tsx` `toHtml()` line 81
The list wrapping regex wraps each individual `<li>` instead of grouping consecutive ones:
```js
.replace(/^- (.+)$/gm,     '<li>$1</li>')
.replace(/(<li>.*<\/li>)/g,'<ul>$1</ul>')  // ← matches one li at a time
```
Result: `- A\n- B\n- C` renders as three separate `<ul><li>…</li></ul>` instead of one `<ul>` with three items. The extra `<ul>` nesting breaks vertical spacing.
**Fix:** After replacing all `- …` lines with `<li>`, replace runs of consecutive `<li>` elements with a single `<ul>` wrapper using a multiline-aware pass.

### 2. Paragraph wrapping produces orphaned tags
**File:** `NoteEditor.tsx` `toHtml()` line 83
```js
.replace(/\n\n/g, '</p><p>')
```
This inserts `</p><p>` between paragraphs but never opens the first `<p>` or closes the last one. The preview renders with a leading `</p>` (invalid, browser silently ignores) and the last paragraph is never wrapped in `<p>`. Styling like `margin: 6px 0` on `.neditor-preview p` has no effect on the last paragraph as a result.
**Fix:** Wrap the whole string: `'<p>' + md.replace(/\n\n/g, '</p><p>') + '</p>'` — applied only after block-level elements (headings, lists, blockquotes) are already replaced.

### 3. Last `toHtml` line is a no-op but misleading
**File:** `NoteEditor.tsx` `toHtml()` line 84
```js
.replace(/^(?!<[hublp])/gm, '')
```
Replaces the zero-width string at the start of non-tag lines with `''` — effectively does nothing. Intent was likely to strip plain text lines or wrap them in `<p>`, but the replacement string `''` achieves neither. Safe to remove.

### 4. No `isFavorite` on notes — inconsistent with all other modules
**File:** `backend/src/entities/Note.ts`
Links, Snippets, Prompts, and Infrastructure all have `isFavorite` + a `PATCH /:id/favorite` toggle. Notes only have `isPinned`. Pinning (keeps note at top of list) and favoriting (cross-module bookmark) are different concepts. The dashboard stat card and global "Favorites" filter exclude notes entirely.
**Fix:** Add `is_favorite` column via migration, `PATCH /:id/favorite` route, favorite button on `NoteCard`, and favorites filter on the notes page.

### 5. Title max length mismatch
**File:** `frontend/src/components/notes/NoteForm.tsx` schema (max 200) vs `backend/src/validation/schemas.ts` (max 255)
DB column is `varchar(255)`. A title created via API at 240 chars cannot be re-saved via the form.
**Fix:** Align frontend schema to 255.

### 6. Sort is hardcoded — no user control
**File:** `backend/src/services/Note.service.ts` `findAll()`
Always sorts pinned DESC then `updatedAt DESC`. No `sortBy` / `sortDir` params exist on the backend or frontend.
**Fix:** Add sort params (same pattern as Links P5-2: `title`, `createdAt`, `updatedAt`).

---

## Current Features

- **Write/Preview tabs** — textarea editor + rendered markdown preview
- **Format toolbar** — Bold, Italic, Code, H2, List, Quote insertion at cursor
- **Auto-save** — 2s debounce on title or content change; "Saving…" / timestamp indicator
- **Auto-resize title** — textarea grows with content
- **Word and character count** in status bar
- **Pin to top** — `isPinned` toggle; pinned notes float to top of list
- **Filter sidebar** — search, category dropdown, tag selector, "Pinned only" toggle
- **Infinite scroll pagination** — sidebar list
- **Deep-link support** — `/notes?open=<id>` from search results opens the note directly
- **Category and tag display** on cards
- **Project membership** — ProjectBadge on card, AddToProjectModal
- **Delete confirmation** — modal before deletion
- **Mobile layout** — sidebar collapses on small screens; back button returns to list
- **Dashboard integration** — stat card, recent activity feed
- **Global search integration** — notes appear in Ctrl+K palette and search page

---

## Missing Features

### S-tier — Implement

| # | Feature | Why |
|---|---------|-----|
| S-1 | **Fix markdown renderer** (bugs 1–3) | Bulleted lists render as broken nested `<ul>` stacks; paragraphs have orphaned tags. The preview is the main reason to use markdown. |
| S-2 | **Sort controls** — title A–Z, date added, date updated | Notes has the same hardcoded sort as Links did. As vaults grow, alphabetical or date-created sort is essential. |
| S-3 | **Duplicate/Clone note** | Consistent with Snippets (P3-5) and Prompts (P3-7). High daily-use feature for template-like notes. |

### A-tier — Implement

| # | Feature | Why |
|---|---------|-----|
| A-1 | **`isFavorite` field** — DB column + migration + toggle endpoint + card button + filter | The only module without favorites. Breaks cross-module consistency and the global favorites filter. Requires a migration. |
| A-2 | **Copy note content button** on editor toolbar | One-click copy of full note content. Consistent with the copy-URL pattern added to Links in P5-2. |
| A-3 | **Fix title max length** (200 → 255 in frontend schema) | Tiny validation alignment fix. |

### B-tier — Defer

| # | Feature | Why deferred |
|---|---------|-------------|
| B-1 | Bulk operations (multi-select, bulk delete/tag) | Notes are usually managed one at a time. Large scope for the gain. |
| B-2 | Archive / soft delete | Legitimate need but requires `isArchived` column + filter UI. Large scope. |
| B-3 | Content field in NoteForm | Would duplicate the editor. The current split (metadata modal vs editor) is workable. |
| B-4 | Markdown enhancements (tables, links, strikethrough, cheat sheet) | Nice polish but the core bugs need fixing first. |

### C-tier — Not building

| Feature | Reason |
|---------|--------|
| Note templates | Duplicating a pinned "template" note achieves the same result once S-3 is done |
| Version history | Complex — only Prompts has this (P3-9). Revisit in a future sprint. |
| Export (JSON / Markdown) | Low priority, deferred to post-P5 |

---

## Implementation Plan (N-3)

> Decided items for P5-3 implementation:

**Bugs to fix:**
- [x] Bug 1 — List wrapping in `toHtml()`
- [x] Bug 2 — Paragraph wrapping in `toHtml()`
- [x] Bug 3 — Remove no-op last line in `toHtml()`
- [x] Bug 5 — Title max 200 → 255 in NoteForm schema

**Features to add:**
- [x] S-1 — Fix markdown renderer (covers bugs 1–3)
- [x] S-2 — Sort controls (title A–Z, date added, date updated)
- [x] S-3 — Duplicate/Clone note
- [x] A-1 — `isFavorite` field (migration + backend + UI)
- [x] A-2 — Copy note content button

---

*Created: 2026-06-09 — P5-3 N-1 exploration complete*
