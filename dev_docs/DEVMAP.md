# LinkVault — Development Roadmap

> Synthesized from all `dev_*.md` analysis documents.
> Last updated: 2026-06-09 — P5-5 SN-1/SN-2/SN-3 complete (Snippets sort + count + dup detection)

---

## Working Agreement

This roadmap is executed in phases. Each phase follows this loop:

1. **Implement** — a phase from this file is built
2. **Test** — user tests and reports bugs / missing parts
3. **Fix** — bugs are documented in [temp.md](temp.md) and fixed
4. Steps 2–3 repeat until user declares the phase **done**
5. **Close** — DEVMAP.md marks the phase complete; the relevant `dev_*.md` files are updated to reflect the final implemented state; `temp.md` is cleared

Do not move to the next phase until the current one is declared done.

---

## Dev Docs Reference

| Doc | Scope | Status |
|-----|-------|--------|
| [dev_security.md](dev_security.md) | Security bugs, ZK vault system | Phase 1 ✅ done — Phase 2 (P4-A) ✅ done |
| [dev_pwa.md](dev_pwa.md) | PWA install/offline/offline-first | Phase 1 ✅ done — Phase 2 (P4-C) next |
| [dev_snippets.md](dev_snippets.md) | Snippets module bugs + features | P1–P3 ✅ done — A-tier items remain |
| [dev_prompts.md](dev_prompts.md) | Prompts module bugs + features | P1–P3 ✅ done — A-tier items remain |
| [dev_infras.md](dev_infras.md) | Infrastructure module bugs + features | P1 ✅ done — P5 items remain |
| [dev_api-client.md](dev_api-client.md) | API Client bugs + features | P0–P3 ✅ done — A/B-tier items remain |
| [dev_search.md](dev_search.md) | Search module bugs + features | P1–P3 ✅ done — A-tier items remain |
| [dev_relations.md](dev_relations.md) | Cross-module relations architecture | Deferred — full graph system in [FutureDev.md](FutureDev.md); MVP replaced by Projects (P4-B) |

---

## Priority Scale

| Level | Meaning |
|-------|---------|
| 🔴 P0 | Security critical — broken before anything ships |
| 🟠 P1 | Half-built features and bugs — existing functionality that doesn't work correctly |
| 🟡 P2 | Foundation — missing infrastructure that blocks later work |
| 🔵 P3 | New features — S-tier from dev docs, highest product value |
| ⚫ P4 | Major systems — vault, relations, offline (large scope, own sprints) |
| ⚪ P5 | A/B-tier features — valuable but not blocking |

---

## Before You Start — Foundation Work

~~These items from the original DEVMAP are still outstanding and **block** later dev_ doc work.~~

✅ **All foundation items complete.** See notes below.

| # | Task | Status | Notes |
|---|------|--------|-------|
| F1 | **Replace `synchronize: true` with TypeORM migrations** | ✅ Done | `synchronize` is env-driven (`DB_SYNCHRONIZE=true`). Migrations folder exists and runs automatically. |
| F2 | **JWT secret via environment variable** | ✅ Done | `backend/src/config/jwt.ts` throws at startup if `JWT_SECRET` is not set. No fallback exists. |
| F3 | **Rate limit `/login` and `/register`** | ✅ Done | `express-rate-limit` installed. `authLimiter` (10 req/15 min) applied to login + register. `passwordLimiter` (5 req/hr) on password reset. |
| F4 | **Global React Error Boundary** | ✅ Done | `app/global-error.tsx`, `app/error.tsx`, `app/(dashboard)/error.tsx` created. Dashboard error shows dev stack trace in development mode. |
| F5 | **Backend request body validation on all routes** | ✅ Done | Zod schemas and `validate()` middleware applied to all auth + CRUD routes in `backend/src/validation/schemas.ts`. |
| F6 | **DB indexes on foreign keys and searchable columns** | ✅ Done | Regular indexes exist on all entities (userId, categoryId, isFavorite). New migration `1780700000001-AddSearchGinIndexes.ts` recreates the 14 trgm GIN indexes that the InitialSchema migration had dropped. |

---

## 🔴 P0 — Security Fixes ✅ Complete
**Source:** [dev_security.md](dev_security.md) — Phase 0

| # | Fix | Status | Files |
|---|-----|--------|-------|
| P0-1 | **SSRF vulnerability** — validate URL, block private IPs and loopback before axios call | ✅ Done | `backend/src/utils/ssrf.util.ts` (new), `Api.service.ts` |
| P0-2 | **Auth fields applied in test requests** — Bearer/Basic/API Key injected as headers before the outbound request | ✅ Done | `Api.service.ts` → `buildAuthHeaders()` |
| P0-3 | **Server-side encryption for credentials** — `authData` and sensitive infra metadata fields encrypted with AES-256-CBC at rest | ✅ Done | `Api.service.ts`, `Infra.service.ts` (uses existing `crypto.ts`) |

---

## 🟠 P1 — Half-Finished Features ✅ Complete
**Declared done: 2026-06-04**

### P1-A — Tag Filters

| Module | Status | Notes |
|--------|--------|-------|
| Snippets | ✅ Done | `TagSelector variant="filter"` in expandable panel; tag chips in active filters row; `Snippet.service.ts` `findAll` now applies tagIds WHERE clause |
| Prompts | ✅ Done | Filter bar refactored from inline to button+expand; `TagSelector`; tag chips; `Prompt.service.ts` updated |
| Infrastructure | ✅ Done | `TagSelector` in expandable panel; tag chips; `Infra.service.ts` updated |
| Links | ✅ Done | Full button+expand filter bar added (was previously inline-only); `TagSelector`; tag chips; `Link.service.ts` `findAll` updated with tagIds |
| Notes | ✅ Done | `TagSelector` added to sidebar filter panel; `Note.service.ts` `findAll` updated with tagIds |

### P1-B — Search Gaps

| # | Fix | Status |
|---|-----|--------|
| P1-4 | Add Prompts to global search | ✅ Done — `searchPrompts()` in `Search.service.ts`; Prompt/Infra types added to controller validation |
| P1-5 | Add Infrastructure to global search | ✅ Done — `searchInfrastructures()` in `Search.service.ts` |
| P1-6 | Fix deep-link | ✅ Done — `SearchResultCard` navigates to `?open=<id>`; all module pages (Notes, Snippets, Prompts, Infra) handle the param via `useSearchParams` + single-item hook |
| P1-7 | Fix empty query | ✅ Done — service returns `{ links:[], notes:[], ...}` when no query; hook `enabled` gated on `debouncedQuery.trim().length > 0` |

### P1-C — Form Bugs

| # | Fix | Status |
|---|-----|--------|
| P1-8 | Snippet auto-detect hint cross-type | ✅ Done — gated with `typeLangs.includes(detectedLang)` |
| P1-9 | Snippet form tab error indicator | ✅ Done — red 6px dot on Content tab when `errors.title \|\| errors.content` |
| P1-10 | Snippet `leftIcon` string | ✅ Already fixed pre-implementation |
| P1-11 | Prompt `defaultValue` not used | ✅ Already implemented — `VariableForm` pre-fills from `v.defaultValue` |
| P1-12 | Prompt whitespace validation | ✅ Done — `titleError`/`contentError` state + `.trim()` check + inline error spans |
| P1-13 | Infrastructure `config` type form fields | ✅ Already implemented pre-P1 |

### P1-D — API Client Bugs

| # | Fix | Status |
|---|-----|--------|
| P1-14 | Collection delete warning | ✅ Done — confirmation overlay with endpoint-count warning; delete button FK error fixed (QueryBuilder `null` instead of `undefined`); delete button now always visible (opacity-based, not display-based) |
| P1-15 | Infra favorite route | ✅ Already registered pre-implementation |

### P1-Extra — Discovered during testing

| Fix | Status |
|-----|--------|
| `TagSelector` redesign — added `variant="filter"` mode; trigger matches other filter selects; no label/Done button; selected tags as chips in parent | ✅ Done |
| Search page layout — only results panel scrolls; header + sidebar sticky | ✅ Done |
| Language detector overhaul — weighted pattern scoring, 45+ languages, framework detection (React hooks, Vue, etc.) | ✅ Done |
| `detectSnippetType()` — auto-detects curl/sql/json/command/regex type from content; shown as hint in SnippetForm | ✅ Done |
| `TYPE_LANGUAGES` expanded — added jsx, tsx, rs (was 'rust'), cs, dart, html, css, scss, yaml, xml, graphql, and more | ✅ Done |
| All 5 backend services (`Link`, `Note`, `Snippet`, `Prompt`, `Infra`) — tagIds filtering was missing from all `findAll` methods; added `getItemIdsByTags` helper to each | ✅ Done |

---

## 🟡 P2 — PWA: Standalone Mode & Install ✅ Complete
**Declared done: 2026-06-05**
**Source:** [dev_pwa.md](dev_pwa.md) — Phase 1

| # | Task | File | Status |
|---|------|------|--------|
| P2-1 | **Fix manifest** — added `display_override`, maskable icon purpose, shortcuts, categories | `src/app/manifest.ts` | ✅ Done |
| P2-2 | **Add `apple-touch-icon`** at 180×180 + iOS splash screen metadata | `src/app/layout.tsx` | ✅ Done — metadata wired; splash PNGs need to be generated (pwa-asset-generator or Figma) and placed in `public/splash/` |
| P2-3 | **Build `usePwaInstall` hook** — capture `beforeinstallprompt`, detect iOS/standalone | `src/hooks/usePwaInstall.ts` | ✅ Done |
| P2-4 | **Build `InstallBanner` component** — Android install button, iOS step-by-step instructions, SW update toast | `src/components/pwa/InstallBanner.tsx` | ✅ Done — 30s delay, 7-day snooze; update toast takes priority |
| P2-5 | **SW update notification** — detect waiting service worker, show "Update available" toast | `src/hooks/useSwUpdate.ts` | ✅ Done |

### Mobile LAN Access Fix (discovered during P2 testing)

| Fix | Status |
|-----|--------|
| Next.js proxy rewrite: `/api/*` → `http://localhost:5000/api/*` — phone never connects to backend port directly | ✅ Done — `next.config.ts` |
| `NEXT_PUBLIC_API_URL=/api` — relative path; works on any device/IP | ✅ Done — `.env.local` + `http.ts` fallback |
| Dynamic CORS origin in dev: reflects any LAN device origin instead of `localhost:3000` only | ✅ Done — `backend/src/app.ts` |
| Root `page.tsx` loading spinner — prevents blank dark screen on mobile while JS boots | ✅ Done |

### Known Remaining (not blocking)

- Splash screen PNGs (`public/splash/`) still need to be generated — metadata links exist but images don't. Use `pwa-asset-generator` or export from Figma.
- PWA install prompt and service worker require **HTTPS** — won't work on LAN HTTP. Works correctly in production or with a self-signed cert + `mkcert`.

---

## 🔵 P3 — New Features (S-Tier, Highest Product Value)

These are the features with the highest user impact across the dev_ docs. Grouped by module.

### Snippets (Source: [dev_snippets.md](dev_snippets.md))

| # | Feature | Why |
|---|---------|-----|
| P3-1 | **Syntax highlighting** — `react-syntax-highlighter` PrismLight with custom dark theme | ✅ Done — `CodeBlock` component in `src/components/ui/CodeBlock.tsx`; wired into `SnippetCard.tsx`; 35 languages registered; expand/collapse preserved |
| P3-2 | **SQL / JSON format button** — wired `formatSQL()` and `formatJSON()` to a toolbar button in the code editor header | ✅ Done — appears in `SnippetForm` when type is `sql`/`json` or language is SQL/JSON; button only shows when content is non-empty |
| P3-3 | **Regex metadata + inline tester** — flag toggles (g/i/m/s) + test string in form; live match count; card shows flags + highlighted matches | ✅ Done — form tester in `SnippetForm.tsx` basic tab; card display in `SnippetCard.tsx`; uses existing `testRegex()` from `snippetUtils.ts` |
| P3-4 | **Smart type detection on paste** — `onPaste` on textarea auto-applies detected type + language; brief "Auto-detected: cURL" toast fades after 2.5s | ✅ Done — `SnippetForm.tsx` `handleContentPaste` |
| P3-5 | **Duplicate snippet** — copy button in card footer; opens form pre-filled with "Copy of X" title, same content/tags/metadata | ✅ Done — `SnippetCard.tsx` `onDuplicate` prop; `SnippetForm.tsx` `initialValues` prop; `snippets/page.tsx` `openDuplicate` |

### Prompts (Source: [dev_prompts.md](dev_prompts.md))
**Declared done: 2026-06-06**

| # | Feature | Why |
|---|---------|-----|
| P3-6 | **Prompt Test Mode** — fill variables and see rendered result without copying | ✅ Done — `PromptCard.tsx`: `isTestMode` flag; cyan border on content area when filled; "Variables filled" row with Re-fill + Reset buttons; stored defaults pre-fill VariableForm |
| P3-7 | **Clone prompt** | ✅ Done — `PromptCard.tsx` `onDuplicate` prop with Copy button; `PromptForm.tsx` `initialValues` prop; `prompts/page.tsx` `openDuplicate` + `duplicateFrom` state |
| P3-8 | **Live variable extraction in form** — auto-extract `{{vars}}` below editor with default value inputs | ✅ Done — `PromptForm.tsx` `varDefaults` state + `pf-vars-panel` grid; persisted as `variables` JSONB column; loaded back into form on edit/duplicate |
| P3-9 | **Prompt versioning** — append-only history, last 5 versions, restore button | ✅ Done — Backend: `variables`+`versions` JSONB columns via migration; service snapshots on title/content change (max 5). Frontend: `pf-versions` panel in form; "Restore" pre-fills form fields. Fixed: raw UPDATE with `updated_at = NOW()` to bypass TypeORM JSONB dirty-check + 304 cache issue |

### Search (Source: [dev_search.md](dev_search.md))

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| P3-10 | **Ctrl+K Quick Open Palette** — floating overlay, arrow navigation, Enter to open | ✅ Done | Implemented prior to this sprint |
| P3-11 | **Relevance ranking** — score by title match (+10), tag match (+3), recency (+2), favorites (+1) | ✅ Done | `Search.service.ts` `scoreResult()` + `sortByScore()`; `take(100)` for client-side reveal |
| P3-12 | **Load More + result count** — "Showing 20 of 54" per group, progressive reveal | ✅ Done | `shownCounts` state per type; `ResultSection` component; Prompts + Infrastructure added to results and filter sidebar |

### API Client (Source: [dev_api-client.md](dev_api-client.md))

| # | Feature | Why | Status |
|---|---------|-----|--------|
| P3-13 | **Environment variables** — `{{BASE_URL}}`-style variables per environment; the `Environment` type exists, build the backend entity + UI | Without this, every environment switch (dev → staging → prod) means editing URLs manually. | ✅ Done |
| P3-14 | **Auto-save draft to localStorage** — persist current URL/headers/body across page refreshes | If the page reloads with a long request body, everything is lost. More important than tabs. | ✅ Done |
| P3-15 | **Query params table editor** — key/value table that syncs bidirectionally with the URL bar | Users currently encode params by hand in the URL. | ✅ Done |
| P3-16 | **JSON tree response viewer** — collapsible tree with syntax coloring for JSON responses | Flat monospace text is baseline-unacceptable for an API client. | ✅ Done |
| P3-17 | **Resizable splitter** — draggable divider between the request section and response section | Fixed layout wastes screen on either the request or response depending on user workflow. | ✅ Done |

---

## ⚫ P4 — Major Systems (Own Sprints, Large Scope)

These are correct and important but each represents a multi-week sprint. Do them in the listed order due to dependencies.

### P4-A — Security Vault ✅ Complete
**Declared done: 2026-06-07**
**Source:** [dev_security.md](dev_security.md) — Phase 2
**Prerequisite:** F1 (migrations) must be done.

A 21-step zero-knowledge client-side encryption system. See dev_security.md for the full implementation order. At a glance:
1. `UserVault` + `SecureField` entities + migration
2. `/api/vault` backend routes (encrypted blobs only, no server-side decryption)
3. Client vault library: `crypto.ts`, `storage.ts`, `biometric.ts`, `session.ts`, `VaultService`
4. `useVault` hook
5. `SecureField` UI component (3 states: not set up / locked / unlocked)
6. Vault Settings page (3 views: setup, mnemonic display, active)
7. Navigation lock indicator
8. Field migration across Infrastructure, API Client, Links modules
9. Secret auto-detection in forms

**Key implementation notes:**
- PIN security via PBKDF2 (310k iterations, SHA-256) — wrong PIN = AES-GCM auth tag failure (cryptographic gate, not logic check)
- IndexedDB stores PIN-encrypted blob, never raw key
- VaultGuard excludes children from DOM when locked (no CSS bypass possible)
- PinModal rendered via `createPortal` to escape Header stacking context (z-index 600/601)
- Auto-lock on 5-min inactivity + tab hide (`document.visibilitychange`)

**Why this priority:** The vault is the architectural foundation for handling sensitive data correctly. Phase 3 Relations (below) needs the env var system from the vault to work.

---

### P4-B — Projects (Cross-Module Grouping) + Infra → API Client Env Injection ✅ Complete
**Declared done: 2026-06-08**
**Prerequisite:** P4-A (vault) done.

> The original polymorphic `item_relations` graph system (junction table, `@mention`, "Related" sections on every card) was deferred as over-engineered for MVP. Design preserved in [FutureDev.md](FutureDev.md) for future reference.

**Projects** — users create named containers and group any items (links, notes, snippets, prompts, infra configs) into them. Items can belong to multiple projects. A project page is the home for all work related to one topic.

Key milestones:
1. **Backend** — `projects` + `project_items` tables, CRUD API + membership API (`/api/projects`) ✅
2. **Frontend: Projects list** — `ProjectCard`, `ProjectForm`, sidebar nav, `/projects` page ✅
3. **Frontend: Project dashboard** — `/projects/[id]` page, mixed card grid, drag-to-reorder, `ProjectItemWrapper` ✅
4. **Frontend: Item integration** — `ProjectBadge` on all 5 cards, `AddToProjectModal`, `useProjectAwareEdit` multi-project edit warning ✅
5. **Frontend: Templates** — `projectTemplates.ts` (5 templates: JWT Auth, Docker Compose, REST API, PostgreSQL, CI/CD), `ProjectTemplateCard`, `ProjectTemplatePreviewModal` ✅
6. **Infra → API Client env injection** — env switcher shows infra `env` items under "From Infrastructure" optgroup; `{{VAR}}` substitution unchanged ✅

---

### P4-C — PWA Offline Support ✅ Complete

**Source:** [dev_pwa.md](dev_pwa.md) — Phase 2
**Done:** 2026-06-08

| Step | Task | File | Status |
|------|------|------|--------|
| C-1 | `/offline` fallback page | `src/app/offline/page.tsx` | ✅ Done |
| C-2 | Serwist: `NetworkOnly` for `/api/vault/*`, `NetworkFirst` for `/api/*`, `StaleWhileRevalidate` for images, fallback to `/offline` for navigation | `src/sw.ts` | ✅ Done |
| C-3 | IDB persister (`@tanstack/query-persist-client-core` + `idb`) | `src/lib/idb-persister.ts` | ✅ Done |
| C-4 | Wire persister into `QueryClientProvider` (vault queries excluded) | `src/app/providers.tsx` | ✅ Done |
| C-5 | `useNetworkStatus` hook (online/offline window events) | `src/hooks/useNetworkStatus.ts` | ✅ Done |
| C-6 | `OfflineBanner` component + added to dashboard layout | `src/components/pwa/OfflineBanner.tsx` | ✅ Done |

**Security note:** `/api/vault/*` is explicitly `NetworkOnly` — never cached. Vault queries are excluded from the IDB persister's `shouldDehydrateQuery` filter.

---

## ⚪ P5 — Module Finalization (In Order)

**Strategy:** Go module by module. Each module follows two steps:
1. **Audit** — read its `dev_*.md`, cut B/C-tier items not worth building now, decide exactly what S/A-tier items to implement
2. **Implement** — execute the decided items, update the `dev_*.md` with ✅ markers

Full feature lists live in the individual `dev_*.md` files. This section tracks order and status only.

> **Note on Links and Notes:** No `dev_*.md` exists for either module yet. Step 1 for each is exploration + doc creation before any implementation.

---

### P5-1 — Security Phase 3: Field Migration ✅ Complete
**Source:** [dev_security.md](dev_security.md) — Phase 3 (steps 17–21)
**Declared done: 2026-06-09**

| Step | Task | Status |
|------|------|--------|
| 17 | One-time migration UX (prompt + encrypt-in-place flow) | ✅ Done |
| 18 | Migrate Infrastructure sensitive fields | ✅ Done |
| 19 | Migrate API Client `authData` | ✅ Done |
| 20 | Migrate Links `passwordEncrypted` | ✅ Done |
| 21 | Secret auto-detection in all forms | ✅ Done |

---

### P5-2 — Links Module ✅ Complete
**Source:** [dev_links.md](dev_links.md)
**Declared done: 2026-06-09**

| Step | Task | Status |
|------|------|--------|
| L-1 | Explore codebase, create `dev_links.md` (bugs + missing features audit) | ✅ Done |
| L-2 | Audit doc — decide what to implement | ✅ Done |
| L-3 | Implement decided items | ✅ Done — sort controls, copy URL button, duplicate URL detection |

---

### P5-3 — Notes Module
**Source:** [dev_notes.md](dev_notes.md)
**Why third:** Same situation as Links — no analysis doc. Notes are the connective tissue of the vault (future `@mention` relations depend on them being solid).

| Step | Task | Status |
|------|------|--------|
| N-1 | Explore codebase, create `dev_notes.md` (bugs + missing features audit) | ✅ Done |
| N-2 | Audit doc — decide what to implement | ✅ Done — see Implementation Plan in dev_notes.md |
| N-3 | Implement decided items | ⬜ |

---

### P5-4 — Search Module
**Source:** [dev_search.md](dev_search.md)
**Why fourth:** Only one A-tier item remaining (keyboard navigation in results). Quick win that directly improves daily use of the vault.

| Step | Task | Status |
|------|------|--------|
| S-1 | Keyboard navigation in results (Arrow Up/Down, Enter to open) | ✅ Done — global keydown handler; cyan focus ring on card; ArrowUp from first item returns to input |
| S-2 | Recent searches history (shown on empty state) | ✅ Done — `useRecentSearches` hook (localStorage, max 8); chips shown on empty state; per-item remove + clear all |
| S-3 | Audit remaining B/C-tier items, cut or keep | ⬜ |

---

### P5-5 — Snippets Module
**Source:** [dev_snippets.md](dev_snippets.md)
**Why fifth:** Sort controls and duplicate detection are high-frequency daily-use gaps. Used constantly alongside Search.

| Step | Task | Status |
|------|------|--------|
| SN-1 | Sort controls (title A–Z, date created, type) | ✅ Done — `sortBy` param in service/controller/hook; sort select in filter bar; chip in active filters row |
| SN-2 | Result count badge in filter bar | ✅ Done — count shown in top row of filter bar; always visible |
| SN-3 | Duplicate detection on create | ✅ Done — debounced title query on create; inline amber warning below title if exact match found |
| SN-4 | Audit remaining B/C-tier items, cut or keep | ⬜ |

---

### P5-6 — Prompts Module
**Source:** [dev_prompts.md](dev_prompts.md)
**Why sixth:** Same tier as Snippets. Sort controls + duplicate detection + prompt collections round out the prompt lifecycle.

| Step | Task | Status |
|------|------|--------|
| PR-1 | Sort controls (date, title, type — override hardcoded `usageCount DESC`) | ✅ |
| PR-2 | Duplicate detection on create | ✅ |
| PR-3 | Prompt collections (named packs) | ✅ |
| PR-4 | Audit remaining B/C-tier items, cut or keep | ⬜ |

---

### P5-7 — Infrastructure Module
**Source:** [dev_infras.md](dev_infras.md)
**Why seventh:** Environment Groups is the big remaining feature — complex but high-value. Variable references in ENV content adds composability.

| Step | Task | Status |
|------|------|--------|
| I-1 | `config` type metadata fields in form (was P1-13, never done) | ⬜ |
| I-2 | Environment Groups (project × environment tier hierarchy) | ⬜ |
| I-3 | Variable references in ENV content (`{{BASE_URL}}` substitution) | ⬜ |
| I-4 | Audit remaining B/C-tier items, cut or keep | ⬜ |

---

### P5-8 — API Client Module
**Source:** [dev_api-client.md](dev_api-client.md)
**Why eighth:** "Generate Code" is the feature that makes the API Client genuinely distinct from a plain request tester — it closes the Save → Test → Document → Reuse loop.

| Step | Task | Status |
|------|------|--------|
| A-1 | Generate code from endpoint (fetch / axios / curl / Python) | ⬜ |
| A-2 | Save example response alongside endpoint | ⬜ |
| A-3 | Import from cURL | ⬜ |
| A-4 | Audit remaining B/C-tier items, cut or keep | ⬜ |

---

### P5-9 — PWA Remaining
**Source:** [dev_pwa.md](dev_pwa.md) — Phase 2 steps 16–18 + Phase 3
**Why ninth:** Offline UX is currently misleading (banner says read-only but buttons still work). Queue + sync is the full offline story.

| Step | Task | Status |
|------|------|--------|
| PW-1 | Disable all write buttons when `isOnline === false` | ⬜ |
| PW-2 | `offline-queue.ts` — IDB-backed pending mutation store | ⬜ |
| PW-3 | Background sync registration in `sw.ts` + replay on reconnect | ⬜ |
| PW-4 | Phase 3: Share Target (share URLs from other apps into Links) | ⬜ |

---

### P5-10 — Cross-Module Relations
**Source:** [dev_relations.md](dev_relations.md) — MVP #2–4
**Why last:** Depends on all modules being stable. The `item_relations` junction table + relation API + UI on cards is the feature that makes the vault feel cohesive rather than siloed.

| Step | Task | Status |
|------|------|--------|
| R-1 | `item_relations` table + migration + CRUD API | ⬜ |
| R-2 | Snippet ↔ Prompt relations (references) | ⬜ |
| R-3 | Note ↔ Everything (`@mention` in note editor) | ⬜ |
| R-4 | API Client → Snippet (generates — "Generate Code" creates a linked snippet) | ⬜ |

---

## Execution Order

```
FOUNDATION (before anything else)
  F1  Replace synchronize: true with TypeORM migrations
  F2  JWT secret via env var (remove hardcoded fallback)
  F3  Rate limit /login and /register
  F4  Global React Error Boundary
  F5  Backend Zod validation on all routes
  F6  Verify DB indexes deployed

P0 — SECURITY BUGS (1–2 days total)
  P0-1  SSRF fix in Api.service.ts testEndpoint()
  P0-2  Auth fields applied in outbound requests
  P0-3  Temporary server-side encryption for authData + infra credentials

P1 — BUG FIXES (3–4 days, all small)
  P1-1  Tag filter UI: Snippets
  P1-2  Tag filter UI: Prompts
  P1-3  Tag filter UI: Infrastructure
  P1-4  Add Prompts to Search.service.ts
  P1-5  Add Infrastructure to Search.service.ts
  P1-6  Fix search deep-link (open item, not module list)
  P1-7  Fix empty query (show recent items, not LIKE %%)
  P1-8  Fix Snippet auto-detect hint (gate by type's language list)
  P1-9  Add error indicator dot on Snippet form tabs
  P1-10 Fix leftIcon string prop in SnippetForm
  P1-11 Wire defaultValue in PromptForm VariableForm
  P1-12 Add Zod schema to PromptForm
  P1-13 Render config type metadata fields in InfraForm
  P1-14 Add collection delete warning in API Client
  P1-15 Verify Infra favorite toggle route registered

P2 — PWA INSTALL FIX (1–2 days)
  P2-1  Fix manifest (display_override + maskable icon + shortcuts)
  P2-2  Add apple-touch-icon + iOS splash screens
  P2-3  Build usePwaInstall hook
  P2-4  Build InstallBanner component
  P2-5  Build useSwUpdate + update toast

P3 — S-TIER NEW FEATURES (module by module)
  P3-1  Syntax highlighting in Snippets
  P3-2  SQL/JSON format button
  P3-3  Regex metadata + tester
  P3-4  Smart type detection on paste
  P3-5  Duplicate snippet
  P3-6  Prompt Test Mode ✅
  P3-7  Clone prompt ✅
  P3-8  Live variable extraction in form ✅
  P3-9  Prompt versioning ✅
  P3-10 Ctrl+K Quick Open Palette ✅
  P3-11 Search relevance ranking ✅
  P3-12 Load More + result count ✅
  P3-13 API Client environment variables ✅
  P3-14 API Client auto-save draft to localStorage ✅
  P3-15 API Client query params table editor ✅
  P3-16 API Client JSON tree response viewer ✅
  P3-17 API Client resizable splitter ✅

P4 — MAJOR SYSTEMS (multi-week sprints, in order)
  P4-A  Security Vault (21 steps — see dev_security.md) ✅ Done
  P4-B  Projects + Infra→API Client env injection ✅ Done
  P4-C  PWA Offline Support ✅ Done

P5 — MODULE FINALIZATION (in order)
  P5-1  Security Phase 3 — field migration (steps 17–21 in dev_security.md)
  P5-2  Links — create dev_links.md, audit, implement
  P5-3  Notes — create dev_notes.md, audit, implement
  P5-4  Search — keyboard nav + recent searches
  P5-5  Snippets — sort controls, result count, duplicate detection
  P5-6  Prompts — sort controls, duplicate detection, prompt collections
  P5-7  Infrastructure — config type fields, Environment Groups, variable references
  P5-8  API Client — Generate Code, save example response, import cURL
  P5-9  PWA remaining — disable write buttons offline, offline queue, background sync
  P5-10 Cross-module Relations — item_relations table + Snippet↔Prompt, Note↔Everything
```

---

## Dependency Graph

```
F1 (migrations) ──────────────────────────────────→ P4-A (vault entities)
                                                  → P4-B (relations entity)

P0 (security fixes) ──→ users can safely test the app

P1 (bug fixes) ──────→ existing features work correctly before new ones are added

P2 (PWA install) ────→ mobile users can install the app
                     → required before P4-C (offline is useless without install)

P3-13 (env vars) ───→ P4-B (infra → api client functional relation depends on this)

P4-A (vault) ────────→ P4-C (vault uses IndexedDB; PWA offline must not collide)
                     → P5 infra env export (vault protects those values)

P4-B (relations) ────→ P5 Knowledge Graph / Search by relationships
```

---

## What NOT to Build Yet

Items from the old DEVMAP that are superseded or de-prioritized based on the dev_ doc analysis:

| Old Item | Status | Reason |
|----------|--------|--------|
| "Soft deletes + Trash" | Deferred | Legitimate need but no dev_ doc covers it. Add to backlog separately. |
| "Browser Extension" | Deferred | Still valid long-term (old P3). Not in scope of any current dev_ doc. |
| "AI Assistant in-vault" | Deferred | Requires relations + search to be mature first. |
| "Usage Analytics" | Downgraded | GPT analysis in dev_prompts.md correctly identifies this as a product-owner feature, not a user need. |
| "Public snippet sharing" | Deferred | Requires moderation, quality control, versioning infrastructure first. |

---

*Last updated: 2026-06-08 — P4-B (Projects + Infra→API Client) complete. Next: P4-C (PWA Offline Support).*
