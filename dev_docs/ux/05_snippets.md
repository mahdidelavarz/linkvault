# Snippets Module

## Purpose

The snippets module stores reusable code fragments of any kind. A snippet is anything the user writes once and expects to use again: a function, a SQL query, a regular expression, a shell command, a curl request, a JSON template, or a script. The module provides type-specific tools (formatting, testing, parsing) so that each kind of snippet is more than passive storage.

---

## The User

A developer who accumulates patterns, commands, and fragments across projects. They search for a snippet when they need to reuse something rather than rewrite it or dig through old code.

---

## Snippet Types

There are 7 types. The type determines what additional tools and metadata are available:

| Type | What it holds | Type-specific tools |
|------|--------------|---------------------|
| **code** | General-purpose code in any language | Language selector, syntax highlighting |
| **sql** | SQL queries and statements | SQL formatter, database type metadata |
| **regex** | Regular expressions | Live tester with match count and highlights, flags metadata |
| **command** | Shell commands | Shell type metadata (bash, zsh, powershell, fish, etc.) |
| **curl** | HTTP requests in curl format | Parsed method and base URL stored as metadata |
| **json** | JSON data or templates | JSON formatter |
| **script** | Multi-line scripts and automation | Language selector, syntax highlighting, dependency metadata |

---

## Information & Data

Each snippet contains:

| Field | Description | Required |
|-------|-------------|----------|
| Title | Human-readable name | Yes |
| Content | The snippet body (code, command, query, etc.) | Yes |
| Type | One of the 7 types above | Yes |
| Language | Programming/script language (applies to code, script types; 40+ options) | Conditional |
| Description | Optional explanatory text | No |
| Metadata | Type-specific data (see below) | Auto-populated or optional |
| Category | One category from the user's category tree | No |
| Tags | Zero or more tags | No |
| Favorite | Boolean | No |
| Created at | Timestamp | Auto-set |
| Updated at | Timestamp | Auto-updated |

### Type-specific metadata fields

**sql**: database type (PostgreSQL, MySQL, SQLite, etc.)

**regex**: test string (a sample string to run the regex against), flags (global, case-insensitive, multiline, etc.)

**command**: shell type

**curl**: parsed HTTP method (GET, POST, etc.), parsed base URL

**script**: language/runtime, listed dependencies

---

## Actions

| Action | Description |
|--------|-------------|
| Create snippet | Fill in title, type, content, and optional metadata; save |
| Edit snippet | Modify any field |
| Delete snippet | Permanently remove |
| Favorite / Unfavorite | Toggle favorite |
| Clone | Duplicate the snippet; the copy is saved with "Copy of [title]" |
| Copy content | Copy the snippet body to the clipboard |
| Format (SQL) | Reformat the SQL content to standard indentation and keyword casing |
| Format (JSON) | Reformat the JSON content to standard indentation |
| Test regex | Enter a test string; see match count and which parts of the string the regex matches (highlighted); modify flags |
| Expand / Collapse | Toggle between a preview (first 6 lines) and the full content |
| Filter | Narrow the list by text, category, tags, type, language, favorites-only |

---

## Smart Paste

When the user pastes content into the creation form, the application inspects the pasted text and attempts to automatically determine:
- The type (e.g., detects curl syntax → sets type to "curl"; detects SELECT/FROM → sets type to "sql")
- The language (e.g., detects Python shebang → sets language to Python)

The auto-detection is a suggestion; the user can override any auto-selected value.

---

## States

| State | Description |
|-------|-------------|
| Empty | No snippets exist |
| Loading | Items being fetched |
| Populated | List of snippets displayed |
| Preview mode | Snippet content is collapsed to first 6 lines |
| Expanded mode | Snippet content is fully visible |
| Regex test mode | User is interacting with the regex tester within a snippet |
| Filtered / No results | Active filters applied; list narrows or shows empty state |
| Duplicate warning | A snippet with the same content already exists; user is warned on create |

---

## Rules & Constraints

- Title and content are required
- Type is required; defaults to "code"
- Language is required for types: code, script; optional for others
- Duplicate detection: if the exact same content already exists in another snippet, the user is warned before saving (can proceed or cancel)
- Sort options: last updated (default), date created, title
- Filter by text searches across: title, description, content

---

## Flows

### Using the regex tester
1. User opens a regex snippet (or creates one with type "regex")
2. The snippet has a test string field and flags selector in its metadata section
3. User types or modifies the test string
4. The system evaluates the regex against the test string in real time
5. Result: total match count displayed; matched portions of the test string are highlighted
6. User can modify flags (global, case-insensitive, etc.) and see results update immediately
7. The test string and flags are saved as part of the snippet metadata

---

## Edge Cases

- **Format failure**: If the user attempts to format malformed SQL or invalid JSON, the formatter fails gracefully with an error message; content is not altered.
- **Regex compile error**: If the regex pattern is invalid (syntax error), the tester shows an error message instead of match results.
- **Smart paste no match**: Content is pasted but no type or language can be detected; fields remain at their defaults and the user sets them manually.
- **Offline**: Cached snippets are readable. Creation and editing are unavailable.
