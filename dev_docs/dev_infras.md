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

> Security-related items (plaintext credential storage, bypassable ENV masking, encryption at rest, secure reveal endpoint, secret auto-detection) are documented in [dev_security.md](dev_security.md).

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
- **Filter bar:** type, category, favorites toggle (button+expand pattern)
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

## Remaining Work — P5-7 (Not Started)

[DEVMAP.md](DEVMAP.md) P5-7 status: I-1 through I-4 all ⬜.

### I-1 — `config` type metadata fields in form
**File:** `InfraForm.tsx`
The `config` type has defined metadata (engine, host, port, database) in the type system, but `InfraForm`'s dynamic metadata section doesn't render fields for it. The type exists but is half-built. (Was P1-13, never done.)

### I-2 — Environment Groups
The current system allows tagging an item with a single environment label (dev/staging/prod). What developers actually need is grouping configs by project and environment:
```
Backend API
├── Dev
├── Staging
└── Production
```
A config item belongs to a project group and an environment tier. This is the highest-value remaining feature for this module.

### I-3 — Variable references in ENV content
Allow `API_URL={{BASE_URL}}/api` syntax within env configs, with a preview that substitutes referenced variables:
```
API_URL=https://prod.example.com/api  ← resolved preview
```
This makes `.env` files composable rather than copy-paste heavy.



## Future Redesign Proposals

Not scheduled — kept as reference for the I-4 audit and any future card/form redesign.

### Card UI/UX — Best Idea

**Core Problems**
- All 5 types render nearly identical cards — type badge is the only differentiator
- ENV cards show raw text, leaking values and offering no structured view
- No visual urgency around cards that contain sensitive credentials

**Proposed Design**

*Type-colored left border stripe* — env=amber, server=cyan, docker=blue, deployment=green, config=purple.

*Type-specific card body — each type renders its key information differently*
- **ENV:** Formatted key=value table (4–5 rows). Key visible; value shown as `••••••••`. Single eye icon per row fires a reveal API call. Never render values in the DOM.
- **Server:** `[username@host:port]` as a large monospace chip. Auth type badge (🔑 SSH Key / 🔒 Password). No credential values visible.
- **Docker:** Service count chip + compose version. YAML preview in a dark scrollable container (`background: #1e1e2e`, `max-height: 160px`, `overflow-y: auto`) — same pattern as PromptCard. No expand button.
- **Deployment:** Platform logo + name prominently (Vercel, AWS, Railway). Step count badge.
- **Config:** Database engine logo + `host:port/database` in monospace.

*Sensitive indicator badge* — For env and server types: a small `⚠ Secrets` red badge in the header. A constant reminder that this card holds credentials.

*Compact footer* — `[updated date]` left, `[copy ▾] [edit] [delete]` right. Copy button for env type has a dropdown for copy variants.

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

### Form UI/UX — Best Idea

**Core Problems**
- Generic content textarea for all types means ENV configs are pasted as raw text with no structure or validation
- SSH keys go into a plain text input with no file upload option

**Proposed Design**

*Type selector stays at top* — current behavior is correct.

*Type-specific structured editors (replacing the generic textarea)*
- **ENV:** Dual-mode editor (default: raw textarea for paste-heavy workflows; table view available via toggle).
- **Server:** Structured fields (Host, Port, Username as inputs). Auth Type radio (Password | SSH Key). Conditional: password input with eye-toggle, or SSH key textarea with `[📁 Load from file]`.
- **Docker:** Compose version dropdown + YAML textarea with syntax-aware placeholder.
- **Deployment:** Platform logo selector grid + runbook textarea with step-numbering helper.
- **Config:** Database engine logo selector + Host, Port, Database Name, Username as individual inputs.

*Common fields remain consistent* — Title, Category, Tags, Favorite — always at the bottom, same layout regardless of type.

---

## Strategic Note

The right framing for this module is **Developer Infrastructure Knowledge Base** — not a Password Manager. The goal is to store and organize the configs, connections, and runbooks a developer needs to operate their projects. Security scope and boundaries are defined in [dev_security.md](dev_security.md).
