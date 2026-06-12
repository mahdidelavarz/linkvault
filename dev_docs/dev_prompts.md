# Prompts Module — Dev Analysis

---

## Module Overview

The prompts module is an AI prompt template manager. It supports 6 prompt types and 7 AI platform targets, with a template variable system (`{{variable_name}}`), usage tracking, clipboard integration, and direct send-to-AI-platform functionality. It is one of the more feature-rich modules in the app — and strategically the most important one, because prompts are living assets that users refine and reuse constantly, unlike notes or links which are mostly static.

**Key files:**
- `frontend/src/app/(dashboard)/prompts/page.tsx` — page, filter bar, grid
- `frontend/src/components/prompts/PromptCard.tsx` — card with variable filling and send-to-AI
- `frontend/src/components/prompts/PromptForm.tsx` — create/edit form
- `frontend/src/components/prompts/VariableForm.tsx` — inline variable input form
- `frontend/src/hooks/usePrompt.ts` — React Query hooks
- `frontend/src/types/prompt.ts` — interfaces, AI_PLATFORMS, PROMPT_TYPES constants
- `frontend/src/lib/promptUtils.ts` — variable extraction, clipboard, sendToAI
- `backend/src/services/Prompt.service.ts` — CRUD + tag sync + usage tracking
- `backend/src/controllers/Prompt.controller.ts` — HTTP handlers
- `backend/src/routes/prompt.route.ts` — REST routes
- `backend/src/entities/Prompt.ts` — TypeORM entity

---

## Current Features

- **6 prompt types:** ai-chat, project-template, code-generation, documentation, system-design, custom
- **7 AI platform targets:** ChatGPT, Claude, Gemini, Copilot, Perplexity, DeepSeek, Generic
- **Template variable system:** `{{variable_name}}` auto-extracted from content, with deduplication
- **VariableForm:** Inline popup to fill variable values before copy/send; pre-fills from stored defaults
- **Fill and copy:** Substitutes all `{{vars}}` with filled values before clipboard
- **Send to AI platform:** Fills variables, copies to clipboard, opens target platform in new tab
- **Quick-send buttons:** 4 platform icon buttons when no `targetAI` is set
- **Usage tracking:** `usageCount` incremented and `lastUsedAt` recorded on copy or send
- **Usage display:** "Used Nx" + last used date on card
- **Favorite toggle** with pending state
- **Category assignment** (single)
- **Multi-tag support** via TagSelector
- **Full-text search** across title, description, content
- **Filter bar:** type, target AI platform, category, tags, favorites toggle, sort, collections (button+expand pattern)
- **Sort controls:** "Most used" (default `isFavorite DESC → usageCount DESC → updatedAt DESC`), "Recently created", "Title A–Z", "Title Z–A", "By type" (P5-6)
- **Duplicate title detection:** debounced check on create with a non-blocking inline warning (P5-6)
- **Prompt collections:** named packs (`PromptCollection`/`PromptCollectionItem`), `CollectionBadge` + `AddToCollectionModal` on cards, `ManageCollectionsModal` for CRUD, collection filter with `sortOrder`-based ordering (P5-6)
- **Infinite scroll pagination** (20/page)
- **Expected output field** — document what the prompt should produce
- **Edit and delete** with confirmation modal
- **Clone prompt** — one-click duplicate with "Copy of X" title pre-filled (P3-7)
- **Prompt Test Mode** — fill variables on the card and see the rendered result before copying; Re-fill and Reset buttons (P3-6)
- **Live variable extraction in form** — `{{vars}}` extracted in real time below the content editor; default value inputs; saved to `variables` JSONB column (P3-8)
- **Prompt versioning** — append-only history, last 5 versions snapshots on title/content change; Restore button pre-fills form (P3-9). Backend: `variables` + `versions` JSONB columns via migration; raw UPDATE with `updated_at = NOW()` to bypass TypeORM JSONB dirty-check.
- **Responsive grid** (380px minimum card width)
- **Contextual empty state**
- **Skeleton loaders** during fetch
- **Dashboard integration:** sidebar nav, stats count
- **ProjectBadge** — badge in card footer showing project membership count; click opens `AddToProjectModal` (P4-B)
- **Multi-project edit warning** — `useProjectAwareEdit` hook warns before editing a prompt that belongs to multiple projects (P4-B)

---

## Remaining Work

### Open Bugs

1. **Variable extraction regex misses hyphenated names** — `promptUtils.ts` `extractVariables()` uses `/\{\{(\w+)\}\}/g`. `\w` does not match hyphens, so `{{api-key}}` is silently ignored — not extracted, not replaced. Fix: `/\{\{([a-zA-Z0-9_-]+)\}\}/g`.

2. **`sendToAI()` has no feedback when clipboard access is denied** — `promptUtils.ts` `sendToAI()` copies to clipboard first, then opens the platform tab. If clipboard permission is denied, the AI platform opens with an empty clipboard — no error message to the user.

3. **Quick-send buttons open a blank tab if platform URL is undefined** — `PromptCard.tsx` calls `window.open(AI_PLATFORMS[platform].url)` for each quick-send icon. If a platform key doesn't match the constant map, `window.open(undefined)` opens a blank tab silently.

4. **`VariableForm` closes on any document click, including portals** — The outside-click handler is attached to `document` via mousedown. A click on any portal-rendered element (toast, dropdown) closes the form and discards all entered variable values.

### P5-6 PR-4 (DEVMAP) — Not Started

**Audit remaining B/C-tier items below — cut or keep.** Decide which of the B-tier ideas are worth building and which should move to "decided against."

### B-Tier — Later
- **Character counter in editor** — Context window awareness. Small `348 chars` badge, not a blocking warning.
- **AI platform optimization hints** — Suggest structural improvements based on target platform (e.g., Claude works better with `<task>` XML tags; ChatGPT responds better to numbered steps). Surface as optional hints, not enforcement.
- **Export to markdown** — Download a prompt as a `.md` file. Simple.
- **Import from text** — Paste a prompt from outside the app, auto-detect `{{variables}}`.