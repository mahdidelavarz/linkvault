# Search Module — Dev Analysis

---

## Module Overview

The search module is the global cross-module search for the app. It supports full-text search across links, notes, and snippets, with filtering by type, category, and tags. It uses PostgreSQL trigram GIN indexes for efficient `LIKE '%term%'` queries and returns results grouped by type. Search state is URL-encoded for shareable links.

Search is the most important module in the entire app. If a user cannot find something they saved six months ago in under five seconds, the entire vault has failed — regardless of how well the individual modules work.

**Key files:**
- `frontend/src/app/(dashboard)/search/page.tsx` — page, debounced input, URL state
- `frontend/src/components/search/SearchFilters.tsx` — type radio, category select, tag multi-select
- `frontend/src/components/search/SearchResultCard.tsx` — per-result card with term highlighting
- `frontend/src/components/search/SearchEmptyState.tsx` — no-query and no-results states
- `frontend/src/hooks/useSearch.ts` — React Query wrapper with 300ms debounce
- `frontend/src/types/search.ts` — SearchResult, SearchResults, SearchFilters types
- `backend/src/services/Search.service.ts` — parallel LIKE queries per type
- `backend/src/controllers/Search.controller.ts` — query parsing, type validation, response shape
- `backend/src/routes/search.route.ts` — GET /search
- `backend/src/config/searchIndexes.ts` — trigram GIN index definitions

---

## Current Features

- **Full-text search** across 5 modules: links, notes, snippets, prompts, infrastructure
- **Searched fields per type:**
  - Links: title, url, description, username
  - Notes: title, content
  - Snippets: title, description, content
  - Prompts: title, description, content
  - Infrastructure: title, description, content
- **Relevance scoring** — title exact match (+10), title contains (+6), tag match (+3), recently updated ≤7 days (+2), favorited (+1); results sorted by score DESC (P3-11)
- **PostgreSQL trigram GIN indexes** on all searched columns
- **Parallel queries** (Promise.all) — all types searched simultaneously; `take(100)` per type
- **300ms debounce** on input
- **URL-based state** — all filters in URL (shareable / bookmarkable)
- **Ctrl+K / Cmd+K Quick Open Palette** — floating overlay with arrow navigation and Enter-to-open (P3-10)
- **Type filter:** all, links, notes, snippets, prompts, infrastructure
- **Category filter:** single-select dropdown
- **Tag filter:** multi-select toggle buttons (scrollable)
- **Results grouped by type** with "Showing X of Y" per-group count (P3-12)
- **Load More** button per group — progressive reveal in steps of 20 (P3-12)
- **Search term highlighting** in title and preview (yellow background)
- **200-char preview** with markdown stripped
- **Category and tag metadata** on each result
- **Two empty states:** no query vs. no results
- **Responsive layout** (sidebar on desktop ≥1024px, stacked on mobile)
- **Loading spinner** during fetch
- **Language badge** on snippet results
- **Deep-link navigation** — results navigate to `?open=<id>` on the module page, auto-opening the item

---

## Remaining Work

### Open Bugs

1. **`loadTagsForItems()` appears duplicated in the search service** — `Search.service.ts` likely has its own tag-loading logic instead of using the centralized utility. If the centralized version is updated, this copy diverges silently, producing different tag data in search results vs. other pages.

2. **Tag button state may not sync from URL on initial load** — `SearchFilters.tsx`: `tagIds` lives in both the URL and local React state. A user who loads a shared search URL with `?tagIds=1,2,3` may see the filter visually unselected if the component initializes from local state before reading URL params.

3. **`cleanMarkdown()` preview may leave artifacts** — `SearchResultCard.tsx`: a naive markdown stripper (removing `#`, `*`, `_`) leaves code block markers, escaped characters, and link syntax artifacts (`[text](url)` → `texturl`). Note content with complex markdown produces confusing previews.

### P5-4 S-3 (DEVMAP) — Not Started

**Audit remaining B/C-tier items below — cut or keep.**

### Strategic / Future
- **Unified search index (architectural)** — The current pattern (`searchLinks()`, `searchNotes()`, `searchSnippets()`, ...) does not scale. Every new module requires a new function and a controller update. A `search_documents` view or materialized table that aggregates all searchable content makes new modules trivially searchable by insertion. Not urgent now, but the right long-term direction.

### A-Tier — Remaining
- **Keyboard navigation in results** — Arrow Up/Down moves focus between results. Enter opens. Already have Ctrl+K to focus input; navigating results is the missing half.

### B-Tier — Medium Value
- **Recent searches** — A short history of previous queries shown on the empty state. Helps users repeat searches they do regularly.
- **Search analytics (internal)** — Log queries that returned zero results. This is developer/product intelligence, not a user-facing feature. Reveals what users are looking for but not finding — invaluable for understanding vault gaps.
- **Related terms** — Below the search results, show: "Related: Authentication, OAuth, Token" — not autocomplete, but a knowledge graph connection. This is a long-term vision feature, not MVP.
- **Sort controls** — Sort by date, relevance, alphabetical. Add after relevance ranking is in place.

### C-Tier — Decided Against (for now)
- **Saved searches** — Most users search → find → leave. Saving a search is a rarely-used feature that adds UI complexity for minimal return.
- **Export results** — Low real-world utility.
- **Bulk actions from search** — Search is for finding, not managing. Bulk operations belong on module pages.
- **Spell correction** — Too complex for the current architecture without a dedicated search engine (Elasticsearch, Typesense).

---

## App-Wide Filter Bar Rule (Reference)

The app uses a consistent two-pattern filter system based on filter count:

| Filter count | Pattern | Reference module |
|---|---|---|
| ≤ 2 filters | Filters appear **inline** alongside the search bar | Links (category + favorites) |
| > 2 filters | A `[Filters]` button sits alongside the search bar; clicking reveals filters below | Snippets (4 filters) |

Search has **3 filters** (type, category, tags) → uses the Snippets pattern. The sidebar on the search page is a special case: because tag count can grow to 30+, the dedicated sidebar is justified. On module pages with a normal filter count, the rule above applies strictly.

**Module filter counts for reference:**
- Links: 2 (category, favorites) → inline ✓
- Notes: 2 (category, pinned) → inline ✓
- Snippets: 4 (type, language, category, favorites) → Filters button ✓
- Prompts: 4+ (type, AI platform, category, favorites, sort, collections) → Filters button ✓
- Infrastructure: 3 (type, category, favorites) → Filters button ✓
- API Client sidebar: 4 (collection, category, method, favorites) → Filters button ✓

---

## Future Redesign Proposals

Not scheduled — kept as reference for the S-3 audit and any future search UI redesign.

### Result UI/UX — Compact Row List

**Core Problem**
Search results as cards take too much vertical space. In a search context, users scan — they don't browse. Dense, scannable rows outperform tall cards. The current design also buries metadata below the preview, requiring the eye to travel far per result.

**Proposed Design**

*Rows, not cards*
```
[icon] Title (highlighted)            [type chip]  [date]
       Category > #tag1 #tag2
       Preview text with highlighted terms...
```
- **Row at rest:** ~48px — icon, title, type chip, date
- **Hover to expand:** Row expands smoothly to show preview (~80px)
- **Actions on hover:** Copy, Open, Edit icons appear on the right — no separate action area

*Groups with collapse toggle*
```
Links  (4)   [▼]
──────────────────────────────────────────────
[🔗] Stripe API docs              [link] May 2
     payments > #api
     Official Stripe API reference for...

Notes  (12)  [▼]
──────────────────────────────────────────────
```

*Muted highlight instead of solid yellow box*
Amber text color or underline instead of a yellow background block. The solid yellow box breaks visual flow and is jarring when many words are highlighted.

### Filter Panel UI/UX — Sidebar Improvements

**Core Problem**
The current sidebar takes significant real estate for only 3 filter types. Tags overflow into a scrollable box. Category doesn't surface the active selection clearly.

**Proposed Design: Keep Sidebar on Desktop, Drawer on Mobile**

On desktop, the sidebar stays — when tags and categories grow, a popover becomes too cramped. On mobile, a drawer triggered by `[Filters]` button. This is correct because filter complexity grows with usage, and a sidebar scales better than a popover for 15+ tags.

**Improvements within the sidebar:**
- Active filter chips shown at the top (independently dismissible)
- Category: a searchable list, not just a flat dropdown
- Tags: checkbox list with a search input at the top of the list
- "Clear all" button visible only when any filter is active

```
┌─────────────────────────────────────────────┐
│ Active: × Backend  × #typescript           │
│ ─────────────────────────────────────────── │
│ Type                                        │
│ (•) All  ( ) Links  ( ) Notes  ( ) Snippets │
│ ( ) Prompts  ( ) Infras                    │
│                                             │
│ Category    [Search categories...]          │
│ [Backend ✓] [Frontend] [DevOps]...          │
│                                             │
│ Tags        [Search tags...]                │
│ [✓ typescript] [auth] [api] [react]...      │
└─────────────────────────────────────────────┘
```

---

## Strategic Note

Search should not be designed as a feature page — it should become the primary navigation system for the entire app. The goal state is:

```
User presses Ctrl+K
→ types a word
→ sees the right result in the first 3 items
→ presses Enter
→ item opens
```

No browsing. No module navigation. No filter tuning.

When users reach this state — relying on Ctrl+K instead of clicking through the sidebar — the vault has become genuinely fast to use. That is the benchmark to build toward.
