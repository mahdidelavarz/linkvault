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

## Remaining Work — P5-3 N-3 (Not Started)

[DEVMAP.md](DEVMAP.md) marks N-3 ("Implement decided items") as not started. This is the decided scope:

### To Implement

1. **Fix markdown renderer** — `NoteEditor.tsx` `toHtml()`:
   - List items each get their own `<ul>` wrapper instead of grouping consecutive `<li>`s. Fix: after replacing `- ...` lines with `<li>`, collapse runs of consecutive `<li>` elements into a single `<ul>` with a multiline-aware pass.
   - Paragraph wrapping (`.replace(/\n\n/g, '</p><p>')`) produces orphaned `<p>`/`</p>` tags — the first `<p>` is never opened and the last is never closed. Fix: wrap the whole string in `<p>...</p>` after block-level elements (headings, lists, blockquotes) are already replaced.
   - Final `.replace(/^(?!<[hublp])/gm, '')` line is a no-op — safe to remove.

2. **Sort controls** — title A–Z, date added, date updated. `Note.service.ts findAll()` always sorts pinned DESC then `updatedAt DESC` with no `sortBy`/`sortDir` params. Same pattern as Links (P5-2) / Snippets (P5-5).

3. **Duplicate/Clone note** — consistent with Snippets (P3-5) and Prompts (P3-7). High daily-use feature for template-like notes.

4. **`isFavorite` field** — Notes is the only module without `isFavorite` (Links, Snippets, Prompts, Infrastructure all have it). Add `is_favorite` column via migration, `PATCH /:id/favorite` route, favorite button on `NoteCard`, and a favorites filter on the notes page. Required for the global Favorites filter/dashboard stat card to include notes.

5. **Copy note content button** on editor toolbar — one-click copy of full note content, consistent with the copy-URL pattern added to Links (P5-2).

6. **Title max length mismatch** — `NoteForm.tsx` schema caps at 200 chars, but `backend/src/validation/schemas.ts` and the `varchar(255)` DB column allow 255. A title created via API at 240 chars cannot be re-saved via the form. Align the frontend schema to 255.

### Deferred (B-tier)
- **Bulk operations** (multi-select, bulk delete/tag) — notes are usually managed one at a time; large scope for the gain
- **Archive / soft delete** — legitimate need but requires `isArchived` column + filter UI; large scope
- **Content field in `NoteForm`** — would duplicate the editor; the current split (metadata modal vs editor) is workable
- **Markdown enhancements** (tables, links, strikethrough, cheat sheet) — nice polish, but item 1 (renderer bugs) needs fixing first

### Decided Against (C-tier)
- **Note templates** — duplicating a pinned "template" note achieves the same result once item 3 (duplicate/clone) is done
- **Version history** — complex; only Prompts has this (P3-9); revisit in a future sprint
- **Export (JSON / Markdown)** — low priority, deferred to post-P5

---

*Created: 2026-06-09 — P5-3 N-1/N-2 exploration and audit complete.*
