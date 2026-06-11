# Snippets Module — Dev Analysis

---

## Module Overview

The snippets module is a code-snippet manager supporting 7 distinct snippet types, each with type-specific metadata. It has its own page, form, card, and a set of utility functions. It is well-integrated with the rest of the app (dashboard, global search, categories, tags).

**Key files:**
- `frontend/src/app/(dashboard)/snippets/page.tsx` — page, filter bar, grid
- `frontend/src/components/snippets/SnippetCard.tsx` — card component
- `frontend/src/components/snippets/SnippetForm.tsx` — create/edit form
- `frontend/src/components/snippets/TypeSelector.tsx` — pill-button type picker
- `frontend/src/components/snippets/FormSelect.tsx` — styled select for forms
- `frontend/src/hooks/useSnippet.ts` — React Query hooks
- `frontend/src/types/snippet.ts` — interfaces, constants
- `frontend/src/lib/snippetUtils.ts` — SQL formatter, regex tester, cURL parser, JSON formatter
- `frontend/src/lib/languageDetector.ts` — pattern-based language detection
- `backend/src/routes/snippet.route.ts` — REST routes
- `backend/src/controllers/Snippet.controller.ts` — request handlers
- `backend/src/services/Snippet.service.ts` — business logic
- `backend/src/entities/Snippet.ts` — TypeORM entity

---

## Current Features

- **7 snippet types:** code, sql, regex, command, curl, json, script — each with its own icon, color, and language set
- **40+ language support** across all types, with type-aware language dropdown
- **Auto language detection** from code content using pattern matching (shebangs, syntax, keywords)
- **Type-specific metadata in form:**
  - SQL → database type selector
  - Command → shell type + working directory
  - Script → runtime + dependencies
  - cURL → HTTP method + base URL
- **Full-text search** across title, description, and content
- **Filter bar** with type, language, category, favorites filters (button+expand pattern)
- **Active filter chips** with individual clear buttons
- **Infinite scroll pagination** (20 items per page)
- **Favorite toggle** on every card (instant, with pending state)
- **Category assignment** (single category per snippet)
- **Multi-tag support** with tag selector and tag display on card
- **Copy to clipboard** in card footer with "Copied!" feedback
- **Expandable code preview** (6 lines collapsed → full content expanded with smooth transition)
- **Language pill label** in code block corner (card) and editor header (form)
- **Edit and delete** with confirmation modal before deletion
- **Responsive CSS grid** (auto-fill, 320px minimum column width)
- **Contextual empty state** that changes message based on active filters
- **Skeleton loaders** during initial and paginated fetch
- **Dashboard integration:** quick-action button, stat card, recent activity feed
- **Global search integration:** snippets appear in site-wide search results
- **Utility functions:** `formatSQL()`, `testRegex()`, `parseCurlCommand()`, `formatJSON()` — available and surfaced in UI
- **Syntax highlighting** — `react-syntax-highlighter` PrismLight with custom dark theme; 35 languages registered; expand/collapse preserved (P3-1)
- **SQL / JSON format button** — "Format" toolbar button in code editor for `sql`/`json` types; uses existing `formatSQL()` and `formatJSON()` (P3-2)
- **Regex metadata + inline tester** — flag toggles (g/i/m/s) + test string in form; live match count on card (P3-3)
- **Smart type detection on paste** — `onPaste` handler auto-detects type + language; brief "Auto-detected: cURL" toast fades after 2.5s (P3-4)
- **Duplicate snippet** — Copy button in card footer; form pre-filled with "Copy of X" title; all content/tags/metadata carried over (P3-5)
- **ProjectBadge** — badge in card footer showing project membership count; click opens `AddToProjectModal` (P4-B)
- **Multi-project edit warning** — `useProjectAwareEdit` hook warns before editing a snippet that belongs to multiple projects (P4-B)
- **Sort controls** — Recently updated (default) / Recently created / Title A–Z / Title Z–A / By type
- **List / grid view toggle** — persisted to `localStorage`; list view shows compact single-line rows
- **JSON validation** — live "Valid/Invalid JSON" indicator in the form for `json` type
- **SQL syntax check** — lightweight balanced-parens/quotes + statement-keyword check in the form for `sql` type
- **cURL → code converter** — generates equivalent `fetch()`, `axios()`, or Python `requests` code with copy button
- **Result count badge** — `sp-result-count` shows "N snippets" next to the filter toggle
- **Duplicate title detection** — debounced check on create with a non-blocking inline warning

---

## Remaining Work

### P5-5 SN-4 (DEVMAP) — Not Started

**Audit remaining C-tier items below — cut or keep.**

### C-Tier — Not Yet Done
- **Bulk actions** — Multi-select + delete. Links has this; snippets don't.
- **Import / export** — Export snippets to JSON for sharing or backup.
- **Keyboard shortcuts** — `E` to edit, `C` to copy, `Esc` to close.
- **Version history** — Once overwritten, previous content is gone permanently.
- **Pin to top** — Separate from "favorite" — anchor a snippet regardless of sort order.

---

## Future Redesign Proposals

Not scheduled — kept as reference for the SN-4 audit and any future card/form redesign.

### Card UI/UX — Best Idea

**Core Problems**
- All 7 types look nearly identical — type is conveyed only by a small dot that reads as decoration, not information
- The code block is monochromatic cyan with no highlighting
- Tags sit below the code block, making card heights inconsistent across the grid
- Copy button is far from the code content (footer)
- No hover interactivity — the card is static

**Proposed Design**

*Left-border type accent stripe* — A 3px left border in the type's color (code=blue, sql=orange, regex=green, command=yellow, curl=teal, json=purple, script=red). The fastest visual differentiator — users scan types without reading.

*Compact header reorganization* — Remove the plain accent dot (replaced by the stripe). Move type label and category into a single meta row below the title. Favorite button stays top-right.

*Tags relocated above the code block* — Move tags from below code to between the description and the code block. All metadata is now grouped at the top, and the code block + footer form a stable bottom section. Height variance in the grid is reduced.

*Code block: prompt-card style — scrollable dark container, no expand button* — The code preview uses the same pattern as PromptCard: dark background (`#1e1e2e`), fixed `max-height: 160px`, `overflow-y: auto`. Content scrolls inside the block. There is no expand/collapse button — the container height is fixed regardless of content length. A copy icon overlays in the top-right corner of the block on hover; keep the footer copy button too since hover doesn't exist on mobile.

*Footer reduced to essentials* — Date on left, edit + delete icons on right.

**Responsive rule:** Card must follow the LinkCard pattern — `width: 100%`, `min-width: 0`, `overflow: hidden`, `box-sizing: border-box` on the root element; `min-width: 0` on all flex children with text to prevent overflow.

**Mockup:**
```
┌─┬────────────────────────────────────────┐
│█│ Fetch user with JOIN            [★]    │  ← type stripe + title + fav
│ │ [sql · orange]  SQL  📁 Backend        │  ← compact meta row
├─┴────────────────────────────────────────┤
│  Returns full user profile with...      │  ← description (2-line clamp)
│  [#auth] [#users]                       │  ← tags above code
│ ┌─────────────────────────────── sql ─┐ │
│ │ SELECT u.*, p.name            [⧉]  │ │  ← copy on hover, dark #1e1e2e bg
│ │ FROM users u                       │ │
│ │ JOIN profiles p ON p.user_id=u.id  │ │
│ │ WHERE u.active = true;     ↕ scroll│ │  ← scrollable, no expand button
│ └────────────────────────────────────┘ │
│ May 28                        [✏] [🗑] │  ← minimal footer
└─────────────────────────────────────────┘
```

### Form UI/UX — Best Idea

**Core Problems**
- Two-tab layout (Content | Details) hides validation errors — user submits and sees no feedback if the error is on the inactive tab
- Type-specific metadata is buried in the Details tab, invisible during content writing
- The regex type has no metadata fields despite the data model supporting them

**Proposed Design**

*Keep tabs, but add error indicator dots* — Removing tabs entirely was considered, but the code editor can be 50–300 lines — mixing it with metadata in one vertical scroll makes the form very long and loses focus. Better solution: keep the two tabs (`Editor` | `Metadata`) but add a red dot indicator on the tab button if it contains a validation error.

```
[Editor ●]  [Metadata]     ← red dot on Editor tab if content/title is empty
```

This solves the invisible error problem without sacrificing the focused editing experience.

*Type-specific metadata inline in Editor tab* — Move the metadata section out of the Metadata tab and into the Editor tab, appearing just below the type selector. It collapses by default for new snippets and expands when a type is selected. For regex, show flag toggles + test string inline.

**Field order in Editor tab:**
1. Title (autofocus)
2. Type selector (horizontal pills — current TypeSelector is good)
3. Type-specific metadata (collapsible, below type selector, always visible when type is selected)
4. Language selector (type-aware, with auto-detect hint)
5. Code editor with slim toolbar (language pill, Format button for SQL/JSON, Regex toggle)
6. Description (optional, 2 rows)

**Field order in Metadata tab:**
1. Category + Tags (side-by-side grid)
2. Favorite checkbox

*Inline regex tester (Editor tab, regex type only)*
```
┌─ Regex Tester ────────────────────────────────┐
│ Flags: [g] [i] [m]                            │
│ Test string: [___________________________]    │
│ Result: ✓ 2 matches: ["foo", "bar"]           │
└───────────────────────────────────────────────┘
```
Uses the existing `testRegex()` utility. Values are saved to `metadata.testString` and `metadata.flags`.

**Mockup:**
```
┌─────────────────────────────────────────────────┐
│ [Editor ●]  [Metadata]                          │
│ ─────────────────────────────────────────────── │
│ Title *    [__________________________________]  │
│                                                 │
│ Type * [💻Code] [🗄️SQL] [📝Regex] [⚡Cmd]...    │
│                                                 │
│ ▸ SQL Options (collapsed for other types)       │
│   Database  [PostgreSQL ▾]                      │
│                                                 │
│ Language * [TypeScript ▾]                       │
│ ⚡ Detected: TypeScript — click to apply        │
│                                                 │
│  Code *           [ts]  [Format]                │
│ ┌───────────────────────────────────────────┐   │
│ │ const x = ...                            │   │
│ └───────────────────────────────────────────┘   │
│                                                 │
│ Description  [_______________________________]  │
└─────────────────────────────────────────────────┘
         [Cancel]              [Create snippet →]
```
