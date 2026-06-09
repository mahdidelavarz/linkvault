# Search

## Purpose

Search is the fastest path to any saved item in the vault. A user who has hundreds of links, snippets, notes, and prompts cannot always navigate to the right module and apply the right filters — they need to type a few words and find what they're looking for regardless of where it lives. Search spans every module simultaneously and ranks results by relevance.

---

## The User

Any user trying to locate something they saved previously but can't immediately remember where. They may remember a partial title, a keyword in the content, or a tag. Search is the fallback when direct navigation fails.

---

## How Search Works

### Scope
A single search query runs against all 5 content modules at once:
- Links (searches: title, URL, description, username)
- Notes (searches: title, content)
- Snippets (searches: title, description, content)
- Prompts (searches: title, description, content)
- Infrastructure (searches: title, description, content)

### Relevance ranking
Results are scored and sorted by relevance. The scoring factors are:

| Factor | Score boost |
|--------|------------|
| Exact title match | +10 |
| Title contains the search term | +6 |
| Tag name matches the search term | +3 |
| Item was created or updated within the last 7 days | +2 |
| Item is marked as favorite | +1 |

Items with higher total scores appear first within their module group.

### Result grouping
Results are grouped by module type. Each group shows:
- The module name
- How many results exist in that group ("Showing X of Y")
- The top results (up to 20 per group initially)
- A "load more" action to reveal the next batch of results within that group

---

## Information & Data

### The search state
The search state is reflected in the URL query string, making searches shareable and bookmarkable. The URL contains:
- The search term
- Any active filters

### Each result entry shows
- The item's title
- The module it belongs to
- A snippet of matching content (with the search term highlighted)
- Tags associated with the item
- How recently it was updated

---

## Filters

Search results can be filtered by:
- **Module type**: narrow to only one module (links only, notes only, etc.)
- **Category**: narrow to items belonging to a specific category
- **Tags**: narrow to items tagged with specific tags

Filters compound with the search term (all filters must match simultaneously).

---

## Deep-Link Navigation

When the user clicks a search result, the application navigates to the item's home module and opens the item directly. For example, clicking a snippet result takes the user to the Snippets module with that specific snippet's detail open.

This behavior is also addressable directly via URL: adding `?open=<id>` to a module's URL causes the app to open that specific item on load. This makes search results bookmarkable to a specific item.

---

## Quick-Open Palette (Ctrl+K)

A floating, keyboard-driven search experience available from anywhere in the application.

- Triggered by pressing **Ctrl+K** (or **Cmd+K** on Mac)
- The user types a search term; results appear immediately as they type
- Keyboard navigation: arrow keys move through results, Enter opens the selected item
- The palette closes when an item is selected or when the user dismisses it (Escape or clicking outside)

The quick-open palette searches the same data as the main search page but is optimized for speed — it is intended for users who know roughly what they're looking for and want to reach it in 2–3 keystrokes.

---

## Actions

| Action | Description |
|--------|-------------|
| Search | Type a query; results update as you type (after a short debounce) |
| Apply type filter | Narrow results to a specific module |
| Apply category filter | Narrow results to items in a specific category |
| Apply tag filter | Narrow results to items with a specific tag |
| Load more | See more results within a specific module group |
| Open result | Navigate to the item in its home module |
| Open quick-palette | Ctrl+K from anywhere; type to search; arrow keys to navigate; Enter to open |
| Share search | Copy the current URL (it encodes the search state) |

---

## States

| State | Description |
|-------|-------------|
| Empty query | No search term; no results shown; prompt to start typing |
| Searching | Query is being sent; loading indicator |
| Results | Grouped results displayed |
| No results | Query returned nothing; user is informed; filters shown so they can broaden the search |
| Filtered results | One or more filters active; results narrowed accordingly |

---

## Rules & Constraints

- Search only runs when the query is at least 1 character
- Results are grouped; each group loads 20 items at a time; user loads more per group independently
- The search state (query + filters) is stored in the URL for shareability
- Relevance ranking is server-side; the order of results within a group reflects the score

---

## Edge Cases

- **Search with no matches at all**: User is informed clearly; all groups show zero results; active filters are still visible so the user can relax them.
- **Search with matches in only some modules**: Groups for modules with no matches are hidden or shown as empty; the user is not confused by empty groups.
- **Deep-link to deleted item**: If the user follows a URL with `?open=<id>` for an item that has since been deleted, the module page loads normally without opening any item — no error page.
- **Offline**: Search requires a live server connection and is unavailable offline. The quick-open palette is also unavailable.
