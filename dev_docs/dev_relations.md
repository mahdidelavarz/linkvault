# Cross-Module Relations — Dev Analysis

## Implementation Status

| Scope | Status |
|-------|--------|
| **MVP Relation #1** — Infra → API Client (functional env injection) | ✅ **Done (P4-B)** |
| **MVP Relations #2–4** — Snippet↔Prompt, Note↔Everything, API→Snippet | ⬜ Not started |
| **V2 Relations** — Prompt↔API Client, Prompt↔Infrastructure, etc. | ⬜ Not started |
| **V3 Knowledge Graph** | ⬜ Not started |

---

## Why This Matters

The modules in this app (Links, Notes, Snippets, Prompts, Infrastructure, API Client) are currently isolated silos. Each is well-built, but a developer's actual work doesn't look like that — a JWT authentication system involves a snippet (the code), a prompt (the AI review), an infra config (the secret), an API endpoint (the route), and a note (the design doc). They belong together.

Average products stop at good individual modules. The step that makes a knowledge vault genuinely useful is answering: **when I look at any item, what else in my vault is related to it?**

This document defines how cross-module relations should be designed and built — from the MVP data model through the V3 vision.

---

## Two Types of Relations

Before the data model: there are two fundamentally different kinds of cross-module connections, and conflating them is a mistake.

**Functional relations** — have runtime behavioral consequences. The connection changes how the app operates.
> Example: An Infrastructure `.env` config injects `{{JWT_TOKEN}}` into an API Client request at execution time.

**Associative relations** — are metadata only. The connection aids discoverability and context but has no runtime effect.
> Example: A Snippet is manually linked to a Prompt because they belong to the same auth feature.

MVP should build both, starting with the functional one.

---

## The Data Model

A single polymorphic junction table — the same pattern as the existing `Taggable` entity.

```
item_relations
──────────────────────────────────
id             int (PK)
source_type    varchar(30)   — 'link' | 'note' | 'snippet' | 'prompt' | 'infrastructure' | 'api_endpoint'
source_id      int
target_type    varchar(30)
target_id      int
relation_type  varchar(20)   — see taxonomy below
user_id        int (FK → users, for access control)
created_at     timestamp
```

**Indexes:**
- Composite `[source_type, source_id]` — fetch all outgoing relations for an item
- Composite `[target_type, target_id]` — fetch all incoming relations for an item
- `user_id` — user scoping

**TypeORM entity** — mirrors `backend/src/entities/Taggable.ts` exactly:

```typescript
@Entity('item_relations')
@Index(['sourceType', 'sourceId'])
@Index(['targetType', 'targetId'])
export class ItemRelation {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 30, name: 'source_type' })
    sourceType!: string;

    @Column({ type: 'int', name: 'source_id' })
    sourceId!: number;

    @Column({ type: 'varchar', length: 30, name: 'target_type' })
    targetType!: string;

    @Column({ type: 'int', name: 'target_id' })
    targetId!: number;

    @Column({ type: 'varchar', length: 20, name: 'relation_type' })
    relationType!: string;

    @Index()
    @Column({ type: 'int', name: 'user_id' })
    userId!: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;
}
```

**Do not use a graph database** — Neo4j, ArangoDB, etc. are the classic over-engineering trap for this pattern. A user with 1,000 items and 500 relations is well within what a single indexed Postgres table handles trivially. If the app reaches 100,000 relations per user and query times degrade, revisit. Not now.

---

## Relation Types

Four values for `relationType`. Keep the set small — adding types later is easy, removing ambiguous ones is not.

| Type | Meaning | Direction | Example |
|------|---------|-----------|---------|
| `references` | A mentions or documents B | Directional (weak) | Note references a Link |
| `uses` | A depends on or consumes B at runtime | Directional (strong) | API Endpoint uses Infrastructure env config |
| `generates` | A produces B as output | Directional | API Endpoint generates a Snippet |
| `tests` | A validates or analyzes B | Directional | Prompt tests/analyzes a Snippet or Config |

All relations are stored as directed edges (source → target), but **queried bidirectionally** — when fetching relations for item X, run:
```sql
WHERE (source_type = :type AND source_id = :id)
   OR (target_type = :type AND target_id = :id)
```
Both sides surface the connection. No need to store duplicate rows.

---

## MVP Relations — Build These First

### 1. ~~Infrastructure → API Client (`uses`) — Functional~~ ✅ Done (P4-B)

**The highest-value connection in the entire app.**

An Infrastructure `env` config stores variables like:
```
BASE_URL=https://api.myapp.com
JWT_TOKEN=eyJ...
```

An API Client endpoint references them:
```
GET {{BASE_URL}}/users
Authorization: Bearer {{JWT_TOKEN}}
```

At test time, the active Infrastructure config is selected from a dropdown in the API Client toolbar. Variables are interpolated before the request is sent. This is the Environment Variables feature documented in `dev_api-client.md` — the relation system is its backbone.

**UX:** Environment switcher in the API Client header. Dropdown lists all `env`-type Infrastructure items. Selecting one binds it as the active variable source. The relation is stored as `infrastructure → api_endpoint, type=uses`.

---

### 2. Snippet ↔ Prompt (`references`) — Associative

A "Review React code" prompt is always used alongside specific components. A SQL query snippet is always tested with a specific SQL generation prompt. These pairs are natural and high-frequency.

**UX on the Prompt card:** A collapsible "Related Snippets (2)" section below the content preview. Clicking a snippet chip opens it in a side panel or navigates to it. Managed from the Prompt form: a "Link to snippets" multi-search field.

**UX on the Snippet card:** Symmetric — "Related Prompts (1)" section.

---

### 3. Note ↔ Everything (`references`) — Associative

Notes are the natural hub. A note about "Authentication System" should be able to attach:
- The JWT snippet
- The "Generate auth middleware" prompt
- The production env config
- The `/auth/login` API endpoint

Notes become the connective tissue between all other items — similar to how Obsidian notes work, but across different item types rather than just other notes.

**UX:** In the Note editor, type `@` to trigger an item search popup. Selecting an item inserts a visual chip inline and creates an `item_relations` record. Items linked from a note are shown in a "Linked Items" panel in the sidebar of the note view.

This is the most impactful single UX feature for making the vault feel cohesive rather than siloed.

---

### 4. API Client → Snippet (`generates`) — Functional

After testing an endpoint, a "Generate Code" action creates a new Snippet pre-filled with the equivalent `fetch()`, `axios`, or `curl` code. The relation is recorded automatically: `api_endpoint → snippet, type=generates`.

**UX:** The generated snippet links back to the source endpoint in its "Related" section. If the endpoint URL changes, the snippet shows a "Source endpoint updated" notice.

---

## V2 Relations — High Value, Build After MVP

### Prompt ↔ API Client (`tests`)

A prompt designed to "Generate API documentation" or "Review this endpoint design" is linked to a specific API endpoint. When the user runs the prompt, the endpoint's URL, method, headers, and example response are auto-injected as context variables.

**Use case:** `POST /users` + "Generate DTOs from this response" prompt → one-click AI-assisted code generation that already has the real response data.

### Prompt ↔ Infrastructure (`tests`)

A prompt like "Analyze this nginx configuration for security issues" or "Explain this docker-compose setup" is linked to an Infrastructure item. Clicking "Run" sends the infrastructure content as the prompt variable.

**Use case:** Config review, documentation generation, and onboarding — all powered by prompts that directly reference the actual configs.

### Snippet ↔ Infrastructure (`references`)

A Redis CLI command snippet naturally belongs next to the "Production Redis" infrastructure config. A Docker Compose snippet belongs next to the project's deployment config.

**UX:** On the Infrastructure card, a "Related Commands (2)" section shows linked `command` or `script` snippets. One click copies the relevant command already configured for that environment.

### Link ↔ Note (`references`)

A Link to an API's documentation page belongs next to the note that documents how the API is used in the project. Links become genuinely useful when they're contextualized by notes.

---

## V3 Vision — Knowledge Graph

When relations exist across all modules, search transforms from keyword matching into **context-aware navigation**.

Searching "JWT" should return not just items containing that word, but a view of the connected cluster:

```
"JWT" context
  ├── Snippet: "generateJWT.ts"
  ├── Prompt: "Generate JWT middleware"
  ├── Infrastructure: "Production secrets (JWT_SECRET)"
  ├── API Endpoint: "POST /auth/login"
  └── Note: "Authentication System Design"
```

**Relevance ranking boost:** Items with more incoming relations from the user's favorites are ranked higher. An item that is frequently linked to is implicitly more important.

**"Related topics" panel:** On the search results page, a sidebar shows emergent clusters — topics the user's vault contains a lot of connected content about. Not user-defined tags, but automatically inferred from the relation graph.

This is what distinguishes the app from Notion (which has pages but no cross-type relation graph) and Postman (which has endpoints but no knowledge context). Build V1 and V2 relations first — V3 emerges from the data they create.

---

## UI/UX Patterns

### On Cards: "Related (N)" Section

Every card gets a collapsible section in its footer area showing related items. Collapsed by default (just a count badge). Expanded: a horizontal chip row of 3–5 related items.

```
[Related: 3]  ← collapsed, click to expand
↓
[💻 generateJWT.ts]  [📝 Auth design doc]  [⚡ POST /auth]
```

Clicking a chip: opens a quick-view panel or navigates. The chips are type-color-coded for fast scanning.

### In Forms: "Link to" Search Field

A "Linked items" section at the bottom of every create/edit form, below Category and Tags:

```
Linked items  [Search to link...]
[× 💻 generateJWT.ts]  [× 📝 Auth design note]
```

The search field queries all item types simultaneously (same as global search). Results show a type icon, title, and module label. Selecting an item creates an `item_relations` record.

### In Notes: Inline `@mention`

The Note editor supports `@` to trigger an item picker. The selected item appears as an inline chip in the note content:

```
The JWT implementation uses [@snippet: generateJWT.ts] 
and references the config in [@infra: Production Secrets].
```

The chips are stored as markdown-style references and rendered as clickable links. Creating them also creates `item_relations` records automatically.

### In Search: Relation Count Metadata

Search result rows show a "3 linked" badge when an item has relations. Clicking the badge filters the search to show only that item's connected cluster.

---

## Implementation Notes

**API routes needed:**
```
GET    /api/relations?type=snippet&id=42      → fetch all relations for an item
POST   /api/relations                          → create a relation
DELETE /api/relations/:id                      → remove a relation
```

**Service pattern:** Same as `Infra.service.ts` or `Snippet.service.ts` — thin CRUD with user scoping on all queries.

**Frontend hook pattern:**
```typescript
useItemRelations(type, id)    // fetch relations for an item
useCreateRelation()           // mutation
useDeleteRelation()           // mutation
```

Query key: `['relations', type, id]`. Mutations invalidate both sides of the relation.

**Implementation Status:**
- ✅ **MVP Relation #1 (Infra → API Client)** done in P4-B — env items appear as "From Infrastructure" optgroup in API Client env dropdown; `KEY=VALUE` parsed into variables. Note: implemented via UI injection rather than the `item_relations` junction table (the simpler, correct approach for this functional relation).
- ⬜ **MVP Relations #2–4** (Snippet↔Prompt, Note↔Everything, API Client→Snippet) — not yet built; require `item_relations` table + relation API + UI on cards.
- ⬜ **V2 Relations** — not started.
- ⬜ **V3 Knowledge Graph** — not started.
