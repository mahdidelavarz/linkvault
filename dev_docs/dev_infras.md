# Infrastructure Module — Dev Analysis

---

## Module Overview

The infrastructure module is a developer config and credential organizer. It stores environment variables, SSH connection details, Docker configs, deployment runbooks, and database configurations. It follows the same structural patterns as other modules (categories, tags, favorites, infinite scroll) but carries unique responsibilities around sensitive data — which means its gaps are higher-stakes than other modules.

**Key files:**
- `frontend/src/app/(dashboard)/infrastructure/page.tsx` — page, filter bar, grid
- `frontend/src/components/infrastructure/InfraCard.tsx` — card with ENV masking and expand
- `frontend/src/components/infrastructure/InfraForm.tsx` — create/edit form with type-specific fields
- `frontend/src/hooks/useInfrastructure.ts` — React Query hooks
- `frontend/src/types/infrastructure.ts` — interfaces, type constants, metadata shapes
- `backend/src/services/Infra.service.ts` — CRUD + tag sync
- `backend/src/controllers/Infra.controller.ts` — HTTP handlers
- `backend/src/routes/Infra.route.ts` — REST routes
- `backend/src/entities/Infrastructure.ts` — TypeORM entity

---

## Potential Bugs & Issues

> Security-related bugs (plaintext credential storage, bypassable ENV masking) are documented in [dev_security.md](dev_security.md).

### 1. ~~Infrastructure items not in global search — dead trgm indexes~~ ✅ Fixed (P1)
`Search.service.ts` now includes `searchInfrastructures()`. Controller type validation updated to include `'infrastructure'`. `SearchResultCard` handles infrastructure results with correct icons and deep-link navigation.

### 2. `config` type metadata fields not rendered in the form
**File:** `InfraForm.tsx`
The `config` type has defined metadata (engine, host, port, database) in the type system, but `InfraForm`'s dynamic metadata section doesn't render fields for it. The type exists but is half-built.

### 3. ~~Tag filter wired in backend but absent from filter bar UI~~ ✅ Fixed (P1)
`TagSelector variant="filter"` added to expandable panel. Selected tags shown as chips. `Infra.service.ts` `findAll` now applies tagIds WHERE clause.

### 4. ~~Favorite toggle route may not be registered~~ ✅ Not a bug — route confirmed
`PATCH /:id/favorite` is registered in `Infra.route.ts` (line 17). `toggleFavorite()` works correctly.

---

## Current Features

- **5 infrastructure types:** env (environment variables), server (SSH connections), docker (Compose/Dockerfiles), deployment (runbooks), config (database/project configs)
- **Type-specific metadata:**
  - env → environment selector (dev/staging/production/testing)
  - server → host, port, username, auth type, SSH key
  - docker → Compose version, services list
  - deployment → platform (Kubernetes, Vercel, Railway, AWS ECS, etc.), steps, rollback plan
  - config → database engine, host, port, database name
- **ENV value masking** on card with reveal toggle
- **Code/content preview** (first 5 lines, expandable)
- **Copy full content** to clipboard
- **Favorite toggle** with pending state
- **Category assignment** (single)
- **Multi-tag support** via TagSelector
- **Full-text search** across title, description, content
- **Filter bar:** type, category, favorites toggle
- **Infinite scroll pagination** (20/page)
- **Edit and delete** with confirmation modal
- **Responsive grid** layout
- **Contextual empty state**
- **Skeleton loaders** during fetch
- **Dashboard integration:** sidebar nav
- **Global search integration** — title, description, content indexed and returned in site-wide search (P1)
- **Tag filter in filter bar** — `TagSelector variant="filter"` in expandable panel; selected tags shown as chips; backend `findAll` applies tagIds WHERE clause (P1)
- **Infra → API Client env injection** — `env`-type items appear as a "From Infrastructure" optgroup in the API Client environment dropdown; `KEY=VALUE` content parsed into variables; negative IDs prevent collision with real environments (P4-B)
- **ProjectBadge** — badge on card footer showing project membership count; click opens `AddToProjectModal` (P4-B)
- **Multi-project edit warning** — `useProjectAwareEdit` hook warns before editing an item that belongs to multiple projects (P4-B)

---

## Missing Features

> Security-specific missing features (encryption at rest, secure reveal endpoint, secret auto-detection) are documented in [dev_security.md](dev_security.md).

### ✅ Completed

- ~~**Global search integration**~~ ✅ **Done (P1)** — `searchInfrastructures()` in `Search.service.ts`; infrastructure results rendered in `SearchResultCard`.
- ~~**Tag filter in filter bar**~~ ✅ **Done (P1)** — `TagSelector variant="filter"` in expandable panel; backend applies tagIds WHERE clause.
- ~~**Infra → API Client env injection**~~ ✅ **Done (P4-B)** — `env`-type items appear as "From Infrastructure" optgroup in env dropdown; `KEY=VALUE` parsed into variables with negative IDs.

### A-Tier — High Value

1. **Environment Groups** — The current system allows tagging an item with a single environment label (dev/staging/prod). What developers actually need is grouping configs by project and environment:
   ```
   Backend API
   ├── Dev
   ├── Staging
   └── Production
   ```
   A config item belongs to a project group and an environment tier. This is more valuable than any Medium-tier feature.

2. **Variable references in ENV content** — Allow `API_URL={{BASE_URL}}/api` syntax within env configs, with a preview that substitutes referenced variables:
   ```
   API_URL=https://prod.example.com/api  ← resolved preview
   ```
   This makes .env files composable rather than copy-paste heavy.

3. **`config` type metadata fields in form** — The type exists; build the form section.

### B-Tier — Medium Value

4. **ENV key-value editor: dual mode** — Two modes, toggleable:
   - **Raw mode:** A textarea for pasting full `.env` content (50–200 lines at once). This is how developers actually work.
   - **Table mode:** Key | Value | Secret rows for structured editing.
   Both views must stay in sync. A table-only editor (like Postman's params editor) forces developers to add variables one by one — they will resent it.

5. **Export as file** — Download config as `.env`, `docker-compose.yml`, or shell script based on type.

6. **Copy variants** — A dropdown on the copy button for env type:
    - Copy as `.env` format (`KEY=value`)
    - Copy as bash export (`export KEY=value`)
    - Copy as Docker ENV (`ENV KEY value`)
    - Copy as YAML environment (`environment:\n  - KEY=value`)
    This is a high-frequency need for developers switching between environments and tools.

7. **Config templates** — One-click starter configs:
    - PostgreSQL connection string
    - Redis config
    - Nginx server block
    - Docker Compose with Node + Postgres
    Reduces friction at creation time and improves adoption.

8. **ENV validation before save** — Detect malformed syntax (`DATABASE_URL` with no `=`, `=VALUE` with no key, duplicate keys) and show inline errors before saving.

9. **SSH key file upload** — `[📁 Load from .pem file]` reads the key into the textarea instead of forcing paste.

10. **Duplicate / clone** — Copy a config as a starting point for a new environment.

### C-Tier — Low Priority

11. **Connection test for server type** — Backend-proxied SSH ping.
12. **Docker Compose YAML validation** — Syntax check before save.
13. **Sort controls** — Sort by type, date, name.
14. **Version history** — Track config changes over time.
15. **Diff view when editing** — What changed since last save.
16. **Infrastructure health checklist** — For deployment type, a checkbox list (backup created, migration applied, smoke test done). Turns the deployment runbook from a static document into an operational checklist.
17. **Bulk actions** — Multi-select.
18. **Duplicate detection** — When the user types a title in the create form, debounce-query for configs with the same title and same `infraType`. Show a non-blocking inline warning: "A [type] config with this name already exists — still create?" Prevents duplicate env files for the same service.

---

## Filter Bar Rule

Infrastructure has **3 active filters** (type, category, favorites). Rule: more than 2 filters → use the Snippets pattern: a `[Filters]` button alongside the search bar; clicking it reveals the filter selects below the bar. The current filter layout must be updated to this pattern.

---

## Card UI/UX — Best Idea

### Core Problems
- All 5 types render nearly identical cards — type badge is the only differentiator
- ENV cards show raw text, leaking values and offering no structured view
- No visual urgency around cards that contain sensitive credentials

### Proposed Design

**Type-colored left border stripe**
env=amber, server=cyan, docker=blue, deployment=green, config=purple.

**Type-specific card body — each type renders its key information differently**

- **ENV:** Formatted key=value table (4–5 rows). Key visible; value shown as `••••••••`. Single eye icon per row fires a reveal API call. Never render values in the DOM.
- **Server:** `[username@host:port]` as a large monospace chip. Auth type badge (🔑 SSH Key / 🔒 Password). No credential values visible.
- **Docker:** Service count chip + compose version. YAML preview in a dark scrollable container (`background: #1e1e2e`, `max-height: 160px`, `overflow-y: auto`) — same pattern as PromptCard. No expand button.
- **Deployment:** Platform logo + name prominently (Vercel, AWS, Railway). Step count badge.
- **Config:** Database engine logo + `host:port/database` in monospace.

**Sensitive indicator badge**
For env and server types: a small `⚠ Secrets` red badge in the header. A constant reminder that this card holds credentials.

**Compact footer**
`[updated date]` left, `[copy ▾] [edit] [delete]` right. Copy button for env type has a dropdown for copy variants.

**Responsive rule:** Card root must follow the LinkCard pattern — `width: 100%`, `min-width: 0`, `overflow: hidden`, `box-sizing: border-box`; all flex children with text must have `min-width: 0`.

**Mockup (server type):**
```
┌─┬──────────────────────────────────────────────┐
│█│ Production DB Server        ⚠ Secrets  [★]   │  ← cyan stripe
│ │ server · 📁 Backend                          │
├─┴──────────────────────────────────────────────┤
│  [admin@db.prod.company.com:5432]              │  ← connection chip
│  🔑 SSH Key  · #production #db                 │
│                                                │
│  May 28                        [⧉▾] [✏] [🗑] │
└─────────────────────────────────────────────────┘
```

---

## Form UI/UX — Best Idea

### Core Problems
- Generic content textarea for all types means ENV configs are pasted as raw text with no structure or validation
- SSH keys go into a plain text input with no file upload option

### Proposed Design

**Type selector stays at top** — current behavior is correct.

**Type-specific structured editors (replacing the generic textarea)**

- **ENV:** Dual-mode editor (default: raw textarea for paste-heavy workflows; table view available via toggle).
- **Server:** Structured fields (Host, Port, Username as inputs). Auth Type radio (Password | SSH Key). Conditional: password input with eye-toggle, or SSH key textarea with `[📁 Load from file]`.
- **Docker:** Compose version dropdown + YAML textarea with syntax-aware placeholder.
- **Deployment:** Platform logo selector grid + runbook textarea with step-numbering helper.
- **Config:** Database engine logo selector + Host, Port, Database Name, Username as individual inputs.

**Common fields remain consistent**
Title, Category, Tags, Favorite — always at the bottom, same layout regardless of type.

---

## Strategic Note

The right framing for this module is **Developer Infrastructure Knowledge Base** — not a Password Manager. The goal is to store and organize the configs, connections, and runbooks a developer needs to operate their projects. Security scope and boundaries are defined in [dev_security.md](dev_security.md).
