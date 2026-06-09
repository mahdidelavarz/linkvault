# Organization: Categories & Tags

## Purpose

Categories and tags are the two cross-cutting organization systems available across all modules. They exist to make large vaults navigable. Without them, finding the right item among hundreds requires relying on search alone. Both systems are user-defined and apply globally — the same category tree and tag pool serve links, notes, snippets, prompts, infrastructure items, and API endpoints.

---

## Categories

### What they are
Categories are a hierarchical system, like a folder tree. Each item belongs to at most one category. Categories are intended for the user's primary organizational structure — "this belongs to the Backend category", or "this belongs to the Clients > Acme category".

### Data model
Each category has:
- **Name** — the display label
- **Parent** — optional reference to another category (creates nesting)
- **Children** — zero or more sub-categories

A root-level category has no parent. A child category's full path is implied by the tree (e.g., Work → Backend → Auth).

### Category management page
The user manages categories on a dedicated page:
- Create a new category (with an optional parent to nest it under)
- Rename an existing category
- Move a category (change its parent)
- Delete a category

Each category in the management view also shows:
- How many links belong to it
- How many notes belong to it

### Behavior when a category is deleted
Items in the deleted category become uncategorized. They are not deleted. The deletion cascades to sub-categories: all descendant categories are also deleted, and all items in any of them become uncategorized.

### Rules
- Category names must be unique within the same parent (two sibling categories cannot share a name)
- Root-level category names must be unique per user
- An item can belong to at most one category
- Category depth is unlimited (though shallow trees are most practical)

---

## Tags

### What they are
Tags are a flat labeling system. Any item can have multiple tags, and one tag can label items across different modules. Tags are intended for flexible, cross-cutting associations that don't fit neatly into a hierarchy — "this prompt and this snippet and this note are all related to authentication", even though they live in different modules.

### Data model
Each tag has:
- **Name** — the label (max 50 characters)
- **Item count** — total number of items across all modules currently tagged with it

Tags belong to the user (not shared between users).

### Tag management page
The user manages tags on a dedicated page:
- Create a new tag
- Rename an existing tag
- Delete a tag

Each tag entry shows the total number of items tagged with it across all modules.

### Behavior when a tag is deleted
All items that were tagged with it lose that tag. The items are not deleted.

### Rules
- Tag names must be unique per user
- Tag names have a maximum length of 50 characters
- An item can have zero or more tags (no maximum enforced)
- Tags are polymorphic: the same tag can simultaneously label a link, a note, a snippet, a prompt, and an infrastructure item

---

## Using Categories and Tags Together

Categories and tags serve different organizational needs and are used simultaneously:

| Category | Tags |
|----------|------|
| A single, primary classification | Multiple secondary labels |
| Hierarchical ("where does this live?") | Flat ("what is this related to?") |
| Mutually exclusive per item (one category max) | Cumulative (many tags per item) |
| Browsed as a tree | Used as filters |

A link might be in the category `Work > Clients > Acme` and tagged with both `authentication` and `admin`. The category says where it belongs; the tags say what it's about.

---

## Filtering by Category or Tag

In every content module and in global search, the user can filter the visible items by:
- A selected category (shows only items in that exact category, not sub-categories, unless specified)
- One or more selected tags (shows only items that have all selected tags)

These filters can be combined: category AND tags must both match.

---

## States

### Category management page

| State | Description |
|-------|-------------|
| Empty | No categories exist; prompt to create the first one |
| Populated | Tree of categories with item counts |
| Create form | User is entering name and optionally a parent |
| Rename form | User is editing an existing category name |
| Delete confirmation | User is confirming deletion; informed that sub-categories and items will be affected |

### Tag management page

| State | Description |
|-------|-------------|
| Empty | No tags exist; prompt to create the first one |
| Populated | Flat list of tags with item counts |
| Create form | User is entering a new tag name |
| Rename form | User is editing an existing tag name |
| Delete confirmation | User is confirming deletion; informed that tagged items will lose this tag |

---

## Edge Cases

- **Renaming a category in use**: Items remain in the category, now under the new name. References elsewhere (filters, search) update automatically.
- **Renaming a tag in use**: All items retain the tag under the new name.
- **Deleting a category with children**: All child categories are also deleted recursively. All affected items become uncategorized. The user should be clearly warned about the scope of this action.
- **Deleting a tag**: All items lose that tag. Tag counts on other tags are not affected.
- **Creating a duplicate category name**: Not allowed within the same parent. Allowed under a different parent (two siblings can't share a name, but cousins can).
- **Creating a duplicate tag name**: Not allowed (tags are unique per user regardless of any hierarchy).
