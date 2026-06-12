# Notes Module

## Purpose

The notes module is for capturing and organizing written information in markdown format. A note is anything the user wants to write down and come back to: a process they figured out, a list of things to remember, a draft, reference material, or anything else that is primarily text. Notes are quick to create and meant to evolve over time.

---

## The User

A developer who writes things down as they work — workflows, observations, to-do lists, documentation drafts, decisions, references. They return to notes frequently to read and update them.

---

## Information & Data

Each note contains:

| Field | Description | Required |
|-------|-------------|----------|
| Title | The name of the note | Yes |
| Content | The body of the note, written in Markdown | No (can be blank) |
| Pinned | Boolean; pinned notes always appear first in the list | No (default: false) |
| Favorite | Boolean | No (default: false) |
| Category | One category from the user's category tree | No |
| Tags | Zero or more tags | No |
| Created at | Timestamp | Auto-set |
| Updated at | Timestamp | Auto-updated |

### Markdown support
Note content is authored in Markdown syntax. The supported formatting includes: headings (H1–H6), bold, italic, inline code, code blocks, ordered lists, unordered lists, and blockquotes. Images and embedded content are not supported.

### Auto-save
The note's title and content save automatically 2 seconds after the user stops typing. There is no manual save action. The last-saved timestamp is visible to the user at all times while editing.

---

## Actions

| Action | Description |
|--------|-------------|
| Create note | Provide a title (content can be added immediately or later) |
| Edit note | Modify title or content directly; changes auto-save |
| Delete note | Permanently remove a note |
| Pin / Unpin | Toggle the pinned state; pinned notes appear at the top of the list regardless of sort order |
| Favorite / Unfavorite | Toggle favorite status |
| Clone | Create a duplicate of the note; the copy gets the title "Copy of [original title]" and contains the same content and metadata |
| Copy content | Copy the full note content to the clipboard |
| Switch editor mode | Toggle between write mode (raw Markdown input) and preview mode (rendered Markdown output) |
| Apply formatting | Apply a formatting shortcut (bold, italic, code, heading, list, blockquote) to the selected text or at the cursor position |
| Filter | Narrow the visible list by search text, category, tags, favorites-only, or pinned-only |
| Sort | Change the ordering of the list |

---

## States

| State | Description |
|-------|-------------|
| Empty | No notes exist; user is prompted to create their first note |
| Loading | Notes list is being fetched |
| No note selected | Notes list is shown; no note is open for editing |
| Note open (write mode) | A note is selected and the user can type in the content area |
| Note open (preview mode) | A note is selected and the rendered Markdown is displayed |
| Auto-saving | The system is saving a recent change; a subtle indicator shows save is in progress |
| Saved | Last-saved timestamp is visible; indicates when the note was last persisted |
| Filtered | List is narrowed by active criteria; result count visible |
| No results | Active filters return zero notes |

---

## Page Structure

The notes module has two persistent areas visible at the same time:
- A **list area** showing all notes (with filters, sort controls, and search)
- An **editing area** showing the currently open note (or empty if none is selected)

When the user selects a note from the list, the editing area loads that note. Both areas are always visible simultaneously.

---

## Rules & Constraints

- Title is required; content can be empty
- Pinned notes always appear before unpinned notes, regardless of sort order
- Sort options (within pinned and unpinned groups separately): by title (alphabetical), by date created, by date updated
- Auto-save has a 2-second debounce: the save triggers 2 seconds after the user stops typing, not on every keystroke
- A word count and character count are visible while editing
- The title input auto-resizes vertically as the user types (it does not clip long titles)
- Filter by text searches across title and content

---

## Edge Cases

- **Empty content**: A note can be saved with only a title and no body content.
- **Very long note**: Long notes scroll within the editing area; there is no hard length limit.
- **Unsaved state**: Because of auto-save, there is no "unsaved changes" state per se. However, if the user closes the tab within the 2-second debounce window, the most recent change may not have been saved yet.
- **Offline**: List shows cached notes. Edits made offline will not persist to the server.
