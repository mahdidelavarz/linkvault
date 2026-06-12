# Prompts Module

## Purpose

The prompts module stores AI prompt templates. A prompt here is not a one-time message — it is a reusable template that the user has crafted to reliably produce useful results from AI assistants. Prompts may use variables (placeholders) so that one template can serve many situations. The module tracks how often each prompt is used and preserves a version history so that refinements can be reviewed or rolled back.

---

## The User

A developer who uses AI assistants (ChatGPT, Claude, Gemini, and others) frequently and has accumulated prompts that work well for specific tasks: generating code, writing docs, designing systems, or running structured conversations. They return to the vault to copy or send a prompt rather than rewriting it each time.

---

## Prompt Types

There are 6 types used to classify the prompt's intended use:

| Type | Intended use |
|------|-------------|
| **ai-chat** | Conversational prompts for dialogue-style AI sessions |
| **project-template** | Prompts that scaffold an entire project or feature |
| **code-generation** | Prompts that generate code of a specific kind |
| **documentation** | Prompts that produce docs, READMEs, changelogs |
| **system-design** | Prompts for architectural planning or technical design |
| **custom** | Anything that doesn't fit the above |

---

## Information & Data

Each prompt contains:

| Field | Description | Required |
|-------|-------------|----------|
| Title | Human-readable name | Yes |
| Content | The prompt body, potentially containing `{{variable}}` placeholders | Yes |
| Type | One of the 6 types above | Yes |
| Target AI | The AI platform this prompt is intended for (ChatGPT, Claude, Gemini, Copilot, Perplexity, DeepSeek, Generic) | No |
| Expected output | A description of what a good response to this prompt looks like | No |
| Description | What this prompt does and when to use it | No |
| Variables | A list of named variables extracted from the prompt content (see below) | Auto-extracted |
| Usage count | Number of times the prompt has been copied or sent to an AI | Auto-tracked |
| Last used at | Timestamp of the most recent copy or send | Auto-tracked |
| Version history | Up to 5 snapshots of prior versions of this prompt | Auto-maintained |
| Category | One category from the user's category tree | No |
| Tags | Zero or more tags | No |
| Favorite | Boolean | No |

---

## The Variable System

Variables are named placeholders written as `{{variable_name}}` anywhere in the prompt content. When the user writes or edits the content, the application automatically scans it and extracts all variable names.

Each extracted variable has:
- **Name**: the identifier from the placeholder (e.g., `language` from `{{language}}`)
- **Default value**: optional; pre-fills the variable during test mode
- **Description**: optional; explains what value should go here

Variables are editable — the user can add descriptions and default values for each one without touching the prompt content.

**Why variables matter**: instead of creating one prompt per programming language or per use case, the user writes one template like "Write a function in `{{language}}` that does `{{task}}`" and fills in the variables each time they use it.

---

## Test Mode

Test mode allows the user to preview the rendered prompt before using it:
1. User enters test mode on a specific prompt
2. All variables appear as fillable fields (pre-filled with their default values if any exist)
3. User fills in the variable values
4. The prompt content is displayed with all `{{variable}}` placeholders replaced by the entered values
5. The user can copy the rendered result or send it directly to an AI platform

Usage count and last-used timestamp are updated when the user copies or sends from test mode.

---

## Version History

Every time the user saves a change to the prompt's title or content, the system stores a snapshot of the previous version. Up to 5 versions are kept (oldest is dropped when a 6th is added).

Each version record contains:
- The content at that point in time
- The prompt type at that point in time
- The variables at that point in time
- The timestamp when the snapshot was taken

The user can:
- Browse all stored versions
- View the content of any past version
- Restore a past version (replaces current content with the selected version's content; the current state becomes a new version in the history)

---

## Send to AI

For each of the 7 supported AI platforms (ChatGPT, Claude, Gemini, Copilot, Perplexity, DeepSeek, Generic), the user can trigger a "send" action directly from the prompt. This:
1. Copies the rendered prompt (with variables substituted) to the clipboard
2. Opens the AI platform in a new browser tab
3. Increments the usage count

The user then pastes into the AI platform's input manually.

---

## Actions

| Action | Description |
|--------|-------------|
| Create prompt | Fill in title, type, content, and metadata; save |
| Edit prompt | Modify any field; triggers version snapshot |
| Delete prompt | Permanently remove |
| Favorite / Unfavorite | Toggle favorite |
| Clone | Duplicate; copy gets title "Copy of [original]" |
| Enter test mode | Fill variables and preview rendered prompt |
| Copy rendered prompt | Copy with variables substituted; increments usage count |
| Send to AI | Open AI platform + copy rendered prompt; increments usage count |
| View version history | Browse past versions of this prompt |
| Restore a version | Replace current content with a past version |
| Filter | Narrow list by text, category, tags, type, favorites-only |

---

## States

| State | Description |
|-------|-------------|
| Empty | No prompts exist |
| Loading | Items being fetched |
| Populated | List of prompts displayed |
| Test mode | User is filling variables and previewing the rendered prompt |
| Version history open | User is browsing past versions of a specific prompt |
| Filtered / No results | Active filters applied |

---

## Rules & Constraints

- Title and content are required; type is required
- Variables are auto-extracted from content; user can add defaults and descriptions but cannot manually add variable names (they must appear in the content)
- Version history holds up to 5 snapshots; oldest is discarded when exceeded
- Default sort: usage count descending (most-used first); no other sort options currently available
- Usage count only increments via the copy or send actions, not on view or edit
- Filter by text searches across: title, description, content

---

## Edge Cases

- **Prompt with no variables**: Test mode still exists but shows no variable fields — the user can copy or send the prompt as-is.
- **Variable removed from content**: If the user edits the content and removes a `{{variable}}`, that variable is automatically removed from the variable list on save.
- **Version history at capacity**: When the 6th version is created, the oldest version is silently dropped. The user is not warned.
- **Offline**: Cached prompts are readable; test mode (copy) can work with cached data. Send to AI requires network access to open the AI platform.
