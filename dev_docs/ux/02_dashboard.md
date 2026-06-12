# Dashboard

## Purpose

The dashboard is the user's first view after logging in. It answers the question "What do I have and what was I working on?" without requiring the user to navigate into any specific module. It is a read-only overview — no content is created or edited here.

---

## The User

A developer returning to the app after some time away, or starting a new session and wanting a quick orientation of their vault's contents before navigating somewhere specific.

---

## Information & Data

### Stats (aggregate counts)
The dashboard shows a total count for each major content type:
- Number of saved links
- Number of notes
- Number of snippets
- Number of prompts
- Number of infrastructure items
- Number of API endpoints
- Number of projects

These are total counts across the user's entire vault — not filtered by category, tag, or date.

### Recent Activity
A feed of the most recently created or updated items across all modules. Each entry in the feed includes:
- Item title
- Module it belongs to (link, note, snippet, etc.)
- When it was last updated or created (relative time, e.g., "2 hours ago")

The feed shows a fixed number of recent items (not paginated).

---

## Actions

- **Navigate to a module**: The user can go directly to any of the 7 content modules from the dashboard. This is a navigation action, not content creation.

---

## States

| State | Description |
|-------|-------------|
| Empty vault | User has just registered; all counts are zero; recent activity feed is empty |
| Populated | Normal state; counts reflect existing items; recent activity shows real entries |
| Loading | Brief state while counts and activity are being fetched from the server |

---

## Rules & Constraints

- Stats are always live counts from the server (not cached totals)
- Recent activity reflects items across all modules, not just one
- No content creation or editing happens on this page

---

## Edge Cases

- **New account with zero items**: All counts show 0; the recent activity section is empty. The user should understand this is the starting point and how to begin adding content.
