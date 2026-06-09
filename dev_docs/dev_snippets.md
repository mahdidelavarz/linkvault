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

## Potential Bugs & Issues

### 1. ~~`leftIcon="lucide:server"` string passed as component prop~~ ✅ Fixed (P1-10)
Was already fixed before P1 implementation began.

### 2. `sc-actions` CSS class defined but never applied to any DOM element
**File:** `SnippetCard.tsx` CSS
`.sc-actions { margin-left: auto; }` is defined but never used as a class in the JSX. The footer layout relies on `ActionButtons` having its own internal spacer logic. If it doesn't, the date collapses against the action buttons instead of being right-aligned.

### 3. ~~Auto-detect hint can suggest a language not in the current type's list~~ ✅ Fixed (P1-8)
Gated with `typeLangs.includes(detectedLang)`. Hint only appears when the detected language is valid for the current type.

### 4. ~~`regex` type has no metadata fields in the form~~ ✅ Fixed (P3-3)
Flag toggles (g/i/m/s) and test string input added to form. Live match count and highlighted matches shown on card. Uses existing `testRegex()` from `snippetUtils.ts`. Values saved to `metadata.testString` and `metadata.flags`.

### 5. ~~Tag filter missing from filter bar UI~~ ✅ Fixed (P1)
Tag filter UI added — `TagSelector variant="filter"` in the expandable filter panel; selected tags shown as dismissible chips. `Snippet.service.ts` `findAll` now also applies the tagIds WHERE clause (was previously missing despite the controller passing the value).

### 6. ~~Validation errors on the hidden tab are invisible~~ ✅ Fixed (P1)
Red 6px dot indicator added to the Content tab button when `errors.title || errors.content` are present. The dot disappears once the errors are resolved.

### 7. Infinite scroll + delete causes layout jump
**File:** `snippets/page.tsx`
`useDeleteSnippet` invalidates the infinite query on success, causing all fetched pages to refetch from page 1. This produces a visible layout jump on large lists. A known React Query edge case.

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
- **Filter bar** with type, language, category, favorites filters
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

---

## Missing Features

### S-Tier — Completed

1. ~~**Syntax highlighting**~~ ✅ **Done (P3-1)** — `react-syntax-highlighter` PrismLight with custom dark theme; 35 languages; expand/collapse preserved. `CodeBlock` component in `src/components/ui/CodeBlock.tsx`; wired into `SnippetCard.tsx`.

2. ~~**SQL / JSON formatter button**~~ ✅ **Done (P3-2)** — "Format" button in code editor toolbar for `sql`/`json` types; only shown when content is non-empty; uses existing `formatSQL()` / `formatJSON()`.

3. ~~**Regex metadata + inline tester**~~ ✅ **Done (P3-3)** — Flag toggles (g/i/m/s) + test string input in form; live match count and highlighted matches on card; values saved to `metadata.testString` + `metadata.flags`.

4. ~~**Smart type detection on paste**~~ ✅ **Done (P3-4)** — `onPaste` handler in `SnippetForm.tsx` auto-detects type + language; brief "Auto-detected: cURL" toast fades after 2.5s.

5. ~~**Duplicate / clone snippet**~~ ✅ **Done (P3-5)** — Copy button in card footer; `initialValues` prop on form; `openDuplicate` handler on page; "Copy of X" title pre-filled.

### A-Tier — Completed

- ~~**Tag filter in the filter bar**~~ ✅ **Done (P1)** — `TagSelector variant="filter"` added; backend service tagIds filtering implemented across all services.

### A-Tier — Remaining

6. **Sort controls** — Hardcoded `isFavorite DESC, updatedAt DESC`. Add: title A–Z, date created, type. Becomes essential once a user has 100+ snippets.
7. **Result count badge** — "12 snippets" shown in the filter bar when filters are active. Simple, very useful.
8. **Duplicate detection** — When the user types a title in the create form, debounce-query for snippets with the same title or identical content hash. Show a non-blocking inline warning: "A snippet with a similar name already exists — still create?" Prevents accidental duplicates without blocking the flow.

### B-Tier — Later

9. **Execute / preview per type** — Snippet as a tool, not just storage:
   - Regex → live match results (covered by #3 above)
   - JSON → validate and pretty-print
   - cURL → generate equivalent `fetch()`, `axios`, or `python requests` code
   - SQL → format + syntax check
10. **List / grid view toggle** — Useful once a user has many snippets. Grid for browsing, list for scanning.
11. **Line numbers in the code editor** — Standard expectation for a code input area.
12. **Bulk actions** — Multi-select + delete. Links has this; snippets don't.

### C-Tier — Low Priority

13. **Import / export** — Export snippets to JSON for sharing or backup.
14. **Keyboard shortcuts** — `E` to edit, `C` to copy, `Esc` to close.
15. **Version history** — Once overwritten, previous content is gone permanently.
16. **Pin to top** — Separate from "favorite" — anchor a snippet regardless of sort order.

---

## Filter Bar Rule

Snippets has **4 active filters** (type, language, category, favorites). Rule: more than 2 filters → use the Snippets pattern: a `[Filters]` button alongside the search bar; clicking it reveals the filter selects below the bar. This is already correct for Snippets. Do not change it.

---

## Card UI/UX — Best Idea

### Core Problems
- All 7 types look nearly identical — type is conveyed only by a small dot that reads as decoration, not information
- The code block is monochromatic cyan with no highlighting
- Tags sit below the code block, making card heights inconsistent across the grid
- Copy button is far from the code content (footer)
- No hover interactivity — the card is static

### Proposed Design

**Left-border type accent stripe**
A 3px left border in the type's color (code=blue, sql=orange, regex=green, command=yellow, curl=teal, json=purple, script=red). The fastest visual differentiator — users scan types without reading.

**Compact header reorganization**
Remove the plain accent dot (replaced by the stripe). Move type label and category into a single meta row below the title. Favorite button stays top-right.

**Tags relocated above the code block**
Move tags from below code to between the description and the code block. All metadata is now grouped at the top, and the code block + footer form a stable bottom section. Height variance in the grid is reduced.

**Code block: prompt-card style — scrollable dark container, no expand button**
The code preview uses the same pattern as PromptCard: dark background (`#1e1e2e`), fixed `max-height: 160px`, `overflow-y: auto`. Content scrolls inside the block. There is no expand/collapse button — the container height is fixed regardless of content length. A copy icon overlays in the top-right corner of the block on hover; keep the footer copy button too since hover doesn't exist on mobile.

**Footer reduced to essentials**
Date on left, edit + delete icons on right.

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

---

## Form UI/UX — Best Idea

### Core Problems
- Two-tab layout (Content | Details) hides validation errors — user submits and sees no feedback if the error is on the inactive tab
- Type-specific metadata is buried in the Details tab, invisible during content writing
- The regex type has no metadata fields despite the data model supporting them

### Proposed Design

**Keep tabs, but add error indicator dots**
Removing tabs entirely was considered, but the code editor can be 50–300 lines — mixing it with metadata in one vertical scroll makes the form very long and loses focus. Better solution: keep the two tabs (`Editor` | `Metadata`) but add a red dot indicator on the tab button if it contains a validation error.

```
[Editor ●]  [Metadata]     ← red dot on Editor tab if content/title is empty
```

This solves the invisible error problem without sacrificing the focused editing experience.

**Type-specific metadata inline in Editor tab**
Move the metadata section out of the Metadata tab and into the Editor tab, appearing just below the type selector. It collapses by default for new snippets and expands when a type is selected. For regex, show flag toggles + test string inline.

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

**Inline regex tester (Editor tab, regex type only)**
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
