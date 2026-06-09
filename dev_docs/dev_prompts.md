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

## Potential Bugs & Issues

### 1. ~~Variable `defaultValue` defined in the data model but never used~~ ✅ Fixed (P3-8)
`PromptForm.tsx` now has a `varDefaults` state. Live variable extraction reads `{{vars}}` from the content editor in real time. Defaults persist to the `variables` JSONB column and are reloaded on edit/duplicate. `VariableForm` now pre-fills from stored defaults.

### 2. ~~Whitespace-only title and content pass all validation~~ ✅ Fixed (P1-12)
`PromptForm.tsx` now uses `.trim().length > 0` checks with `titleError`/`contentError` state displayed as inline error spans. No longer reliant on HTML `required`.

### 3. Variable extraction regex misses hyphenated names
**File:** `promptUtils.ts`
`extractVariables()` uses `/\{\{(\w+)\}\}/g`. `\w` does not match hyphens, so `{{api-key}}` is silently ignored — not extracted, not replaced. The fix is `/\{\{([a-zA-Z0-9_-]+)\}\}/g`.

### 4. ~~Tag filter wired in backend but missing from filter bar UI~~ ✅ Fixed (P1)
Filter bar refactored to button+expand pattern. `TagSelector variant="filter"` added. Selected tags shown as chips. `Prompt.service.ts` `findAll` now applies tagIds WHERE clause.

### 5. `sendToAI()` has no feedback when clipboard access is denied
**File:** `promptUtils.ts`
`sendToAI()` copies to clipboard first, then opens the platform tab. If clipboard permission is denied, the AI platform opens with an empty clipboard — no error message to the user.

### 6. Quick-send buttons open a blank tab if platform URL is undefined
**File:** `PromptCard.tsx`
Each quick-send icon calls `window.open(AI_PLATFORMS[platform].url)`. If a platform key doesn't match the constant map, `window.open(undefined)` opens a blank tab silently.

### 7. Default sort by `usageCount DESC` buries new prompts
**File:** `Prompt.service.ts`
Order: `isFavorite DESC → usageCount DESC → updatedAt DESC`. A brand-new prompt always ranks below heavily-used ones, even during a search. There are no sort controls to override this.

### 8. `VariableForm` closes on any document click, including portals
**File:** `VariableForm.tsx`
The outside-click handler is attached to `document` via mousedown. A click on any portal-rendered element (toast, dropdown) closes the form and discards all entered variable values.

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
- **Filter bar:** type, target AI platform, category, tags, favorites toggle (button+expand pattern)
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

## Missing Features

### S-Tier — Completed

1. ~~**Variable default values**~~ ✅ **Done (P3-8)** — Live var extraction + `varDefaults` state + JSONB persistence.

2. ~~**Tag filter in filter bar**~~ ✅ **Done (P1)** — `TagSelector variant="filter"` in button+expand panel.

3. ~~**Clone prompt**~~ ✅ **Done (P3-7)** — Copy button on card; `initialValues` prop on form; `duplicateFrom` state on page.

4. ~~**Prompt Test Mode**~~ ✅ **Done (P3-6)** — `isTestMode` flag on card; rendered preview with `{{vars}}` substituted; Re-fill + Reset buttons.

5. ~~**Zod validation schema**~~ ✅ **Done (P1-12)** — Frontend `.trim()` checks with inline error spans. Backend `updatePromptSchema` also updated to accept `null` for nullable DB columns (`targetAI`, `description`, `expectedOutput`).

### A-Tier — Completed

- ~~**Live variable extraction in the form**~~ ✅ **Done (P3-8)** — Real-time `{{var}}` extraction below content editor; default value inputs; saved to `variables` JSONB; pre-fills VariableForm on card.
- ~~**Prompt versioning**~~ ✅ **Done (P3-9)** — Append-only history, max 5 versions; snapshot on title/content change; Restore pre-fills form.

### A-Tier — Remaining

6. **Duplicate detection** — When the user types a title in the create form, debounce-query for prompts with the same title or very similar content. Show a non-blocking inline warning: "A prompt with this name already exists — still create?" Especially valuable for prompts since users tend to save variations of the same base prompt and lose track of them.

7. **Sort controls** — Hardcoded `usageCount DESC` buries new prompts. Add: by date, title, type.

8. **Prompt collections** — Beyond categories and tags, allow grouping prompts into named packs (e.g., "System Design Pack", "Frontend Review Kit"). Distinct from category: a collection is a curated, ordered set of related prompts.

### B-Tier — Later

10. **Prompt forking** — Clone with an explicit parent reference (like GitHub fork). Stronger than plain clone — the UI shows "forked from X". More complex to build than clone; do clone first.

11. **Character counter in editor** — Context window awareness. Small `348 chars` badge, not a blocking warning.

12. **AI platform optimization hints** — Suggest structural improvements based on target platform (e.g., Claude works better with `<task>` XML tags; ChatGPT responds better to numbered steps). Surface as optional hints, not enforcement.

13. **Export to markdown** — Download a prompt as a `.md` file. Simple.

14. **Import from text** — Paste a prompt from outside the app, auto-detect `{{variables}}`.

### C-Tier — Not Now

15. **Usage analytics** — Charts of usage over time. Makes the product owner happy, not the user. Users want to find prompts fast, not review metrics.

16. **Public template library** — Requires moderation, quality control, versioning, and trust infrastructure. Too complex for MVP. Not now.

17. **Bulk actions** — Lower priority than the items above.

18. **Grid/list toggle** — Lower priority; invest in retrieval speed first.

---

## Filter Bar Rule

Prompts has **4 active filters** (type, AI platform, category, favorites). Rule: more than 2 filters → use the Snippets pattern: a `[Filters]` button alongside the search bar; clicking it reveals the filter selects below the bar. The current inline-filter layout must be updated to match this pattern.

---

## Card UI/UX — Best Idea

### Core Problems
- Footer mixes too many concerns: copy, 4 quick-send icons, edit, delete — all in one row
- The quick-send section (4 icon buttons) appears on every card without a `targetAI`, adding height and visual noise
- The VariableForm expands inline, making card height unpredictable and pushing grid siblings down

### Proposed Design

**Platform-colored left border stripe**
In the target AI platform's brand color (ChatGPT=green, Claude=orange, Gemini=blue, Copilot=purple, etc.). When `targetAI` is unset, use the prompt type's color. Instant visual grouping.

**Compact header row**
```
[Type icon] TITLE                    [🤖 Claude chip] [★]
            code-generation · 📁 Backend
```
The AI platform chip in the header row is also the send action — clicking the chip fills variables and sends. No separate send button section.

**Content preview: prompt-card style (already correct — maintain this)**
The existing PromptCard preview (`background: #1e1e2e`, `max-height: 160px`, `overflow-y: auto`) is the reference pattern all other modules should follow. Keep it exactly as-is.

**Variable-aware content preview**
Render `{{variable_name}}` tokens in amber/yellow inline text directly in the preview. Users immediately see a prompt is templated without expanding anything.

**Variable count badge → popover (not inline expand)**
A small `{3 vars}` chip in the corner of the preview block. Clicking opens a compact popover for filling variables. The card height never changes — the grid stays stable.

**Minimal footer**
`Used 7x · May 28` on left, `[copy] [edit] [delete]` icon buttons on right. No platform buttons in the footer.

**Responsive rule:** Card root must follow the LinkCard pattern — `width: 100%`, `min-width: 0`, `overflow: hidden`, `box-sizing: border-box`; all flex children holding text must have `min-width: 0` to prevent overflow on small screens.

**Mockup:**
```
┌─┬──────────────────────────────────────────────┐
│█│ [💻] Write a REST API controller  [🤖 Claude][★] │  ← stripe + platform chip
│ │ code-generation · 📁 Backend                 │
├─┴──────────────────────────────────────────────┤
│  Generates a {{framework}} controller...       │
│  with {{method}} endpoint for {{resource}}     │  ← {{vars}} in amber
│  following REST conventions.           {3 vars}│  ← popover trigger, not expand
│                                                │
│  Used 7x · May 28              [⧉] [✏] [🗑]  │
└─────────────────────────────────────────────────┘
```

---

## Form UI/UX — Best Idea

### Core Problems
- The content textarea (the most important field) is buried below Title, Type, Target AI, Category, Tags, and Description
- The VariableForm is a separate after-submit component — users can't see or configure variables while writing
- The human brain starts with content when writing a prompt, not with metadata

### Proposed Design

**Content-first field order**
When writing a prompt, the user thinks: "What is the prompt?" first, then "What type is it?" and "Which AI?". The form should match this mental order:

1. Title (autofocus)
2. **Content editor** — large, prominent, immediately below title
3. **Live variable panel** — auto-extracted below the editor in real time, with default value inputs
4. Type selector (visual pills — same as snippets TypeSelector)
5. Target AI selector (platform logo grid — visual, not a dropdown)
6. Description (optional, click to expand)
7. Expected Output (in a collapsible "Details" section)
8. Category + Tags (side-by-side grid)
9. Favorite checkbox

**AI Platform visual selector**
A logo grid instead of a dropdown `<select>`:
```
[🤖 ChatGPT]  [🧠 Claude]  [💎 Gemini]  [💻 Copilot]
[🔮 Perplexity] [🐋 DeepSeek] [⚙️ Generic]  [○ None]
```
Active platform gets a brand-colored border.

**Live variable extraction panel**
As the user types `{{variable_name}}` in the content editor, variables appear instantly below as labeled input rows:
```
Variables detected:
  framework   [___________________]  (default value)
  method      [___________________]
  resource    [___________________]
  [+ Add manually]
```
These defaults save to metadata and pre-fill the card's VariableForm.

**Character counter**
Small `348 chars` badge in the editor bottom-right.

---

## Strategic Note

The prompts module currently functions as **storage**. What it needs is a **lifecycle**:

```
Create → Test → Improve → Version → Reuse
```

Prompt Test Mode (preview with variables filled), versioning, and cloning are the three features that move this module from a notepad into a genuine prompt engineering workspace — and make it the most distinctive part of the app.
