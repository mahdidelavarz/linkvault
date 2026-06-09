# API Client Module — Dev Analysis

---

## Module Overview

The API client is an in-app HTTP request tester — a Postman-style tool embedded in the vault. Unlike other modules, it has an app-like layout (sidebar + builder + viewer) rather than a card grid. Users test endpoints through a backend proxy, then save them with metadata into named collections. It is the most structurally distinct module in the app.

**Key files:**
- `frontend/src/app/(dashboard)/api-client/page.tsx` — main app layout, state, save modal, mobile tab switcher
- `frontend/src/components/api-client/CollectionSidebar.tsx` — collection/endpoint browser
- `frontend/src/components/api-client/RequestBuilder.tsx` — method + URL + headers + body + params
- `frontend/src/components/api-client/ResponseViewer.tsx` — status, timing, headers, body, tree/raw toggle
- `frontend/src/components/api-client/JsonTree.tsx` — collapsible JSON tree with syntax coloring
- `frontend/src/components/api-client/EnvironmentModal.tsx` — environment CRUD + variable key-value editor
- `frontend/src/hooks/useApiClient.ts` — React Query hooks (endpoints, collections, environments)
- `frontend/src/types/api.ts` — ApiEndpoint, ApiCollection, ApiResponse, Environment, KeyValue types
- `backend/src/services/Api.service.ts` — CRUD + test proxy + tag sync + environment CRUD
- `backend/src/controllers/Api.controller.ts` — HTTP handlers
- `backend/src/routes/api.route.ts` — REST routes
- `backend/src/entities/ApiEndpoint.ts` — TypeORM entity
- `backend/src/entities/ApiCollection.ts` — TypeORM entity
- `backend/src/entities/ApiEnvironment.ts` — TypeORM entity (P3-13)

---

## Potential Bugs & Issues

> Security-related bugs (SSRF vulnerability, auth credentials stored but not applied, raw token storage) are documented in [dev_security.md](dev_security.md).

### 1. ~~`Environment` type defined but never implemented~~ ✅ Fixed (P3-13)
Backend `ApiEnvironment` entity + migration; CRUD service/controller/routes. Frontend: `EnvironmentModal` two-pane UI; `useEnvironments`/`useCreateEnvironment`/`useUpdateEnvironment`/`useDeleteEnvironment` hooks; env picker dropdown in RequestBuilder; `{{VAR}}` interpolation in URL, headers, body on Send; live resolved-URL preview when variables are active.

### 2. ~~`deleteCollection()` orphans endpoints with no warning~~ ✅ Fixed (P1)
Confirmation overlay added showing endpoint count ("3 endpoints will become uncollected"). FK constraint error also fixed — `endpointRepository.update({ collectionId: undefined })` was silently ignored by TypeORM; replaced with a QueryBuilder `.set({ collectionId: null })` that generates the actual `SET collection_id = NULL` SQL.

### 3. Headers freeform text — colon in value can break parsing
**File:** `RequestBuilder.tsx`
Headers are formatted as `Key: Value` per line and parsed by splitting on `: `. A header value with a colon and no preceding space after the key (`Authorization:Bearer token`) would parse incorrectly. Silent failure.

### 4. 30-second timeout gives no distinct feedback to the user
**File:** `Api.service.ts`
When the axios timeout fires, the error is returned the same way as a connection refused or a 500 — the user can't tell whether the server was too slow or actually failed.

### 5. Binary response bodies rendered as garbled text
**File:** `Api.service.ts`
For images, PDFs, or compressed responses, the service returns the raw binary body as a string. The ResponseViewer displays it as monospace characters with no indication that the content is binary.

### 6. No pagination for the endpoint list
**File:** `Api.service.ts` — `getEndpoints()`
Returns all matching endpoints with no limit. For most users (50–100 endpoints), this is fine now. Add a cap of 200 for MVP; revisit when it becomes an issue.

---

## Current Features

- **HTTP method selector:** GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS — color-coded
- **URL input** with send button
- **Headers editor:** freeform `Key: Value` per line textarea
- **Body editor** with type selector: json, form-data, x-www-form-urlencoded, raw, none
- **Backend-proxied test execution** — requests made server-side (avoids client CORS)
- **Response viewer:** status code (color-coded), time (ms), size (bytes)
- **Response body display** with copy and word-wrap toggle
- **Response headers display** with syntax coloring
- **Save endpoint** with title, description, collection, category, tags, favorite
- **Update and delete saved endpoint**
- **Collections sidebar:** browse by collection, create inline, delete, count badge
- **"All Endpoints" section** for uncollected endpoints
- **Filter endpoints** by collection, category, method, search, favorites
- **Mobile-responsive sidebar** (drawer on small screens)
- **Mobile tab layout** — Request / Response tabs on ≤767px; auto-switches to Response tab after Send; status badge in tab (P3-17)
- **Tag support** via polymorphic Taggable
- **Category assignment** per endpoint
- **Dashboard integration:** sidebar nav, module grid
- **Environment variables** — `{{VAR}}`-style per-environment variables; EnvironmentModal CRUD; env picker in toolbar; live resolved-URL preview; interpolation on Send (P3-13)
- **Auto-save draft** — method, URL, headers, body, bodyType, queryParams persisted to `localStorage` across refreshes; 4s "Draft restored" notice; cleared on New Request (P3-14)
- **Query params table editor** — key-value grid (enable toggle, key, value, remove); bidirectional sync with URL bar; ID-preserving parse to avoid focus loss (P3-15)
- **JSON tree response viewer** — collapsible nodes with ▸/▾ toggle; auto-collapse at depth ≥ 2; syntax coloring by type (keys=cyan, strings=green, numbers=amber, booleans=purple, null=red); item count on collapsed nodes; Tree/Raw toggle in response toolbar (P3-16)
- **Resizable splitter** — drag handle between request and response sections; min 200px / max (container-160px); desktop only (P3-17)
- **Infra → API Client env injection** — `env`-type Infrastructure items appear as a "From Infrastructure" `<optgroup>` in the environment dropdown; `KEY=VALUE` content parsed into variables; negative IDs prevent collision with real API environments (P4-B)
- **ProjectBadge** — badge on saved-endpoint cards showing project membership count (P4-B)
- **Multi-project edit warning** — `useProjectAwareEdit` hook warns before editing an endpoint that belongs to multiple projects (P4-B)

---

## Missing Features

> Security-specific missing features (SSRF protection, auth execution, secrets vault integration) are documented in [dev_security.md](dev_security.md).

### S-Tier — Completed

1. ~~**Environment variables**~~ ✅ **Done (P3-13)** — `ApiEnvironment` entity + migration; CRUD API; EnvironmentModal UI; env picker dropdown; `{{VAR}}` interpolation on Send; live resolved-URL preview.
2. ~~**Auto-save draft to localStorage**~~ ✅ **Done (P3-14)** — Persists method/URL/headers/body/bodyType/queryParams; 4s restored notice; clears on New Request or endpoint select.

### A-Tier — High Value

3. ~~**Query params table editor**~~ ✅ **Done (P3-15)** — Key-value grid in Params tab; toggle per row; bidirectional URL↔params sync; ID preservation across keystrokes.

4. **Generate code from endpoint** — After testing an endpoint, offer a "Generate Code" button:
   - Generate `fetch()`
   - Generate `axios`
   - Generate `curl`
   - Generate Python `requests`
   This is a high-value developer action and directly serves the "Save → Test → Document → Reuse" loop that makes this module distinct from a plain Postman clone.

5. ~~**JSON tree response viewer**~~ ✅ **Done (P3-16)** — Collapsible tree, auto-collapse at depth ≥ 2, syntax coloring by type, Tree/Raw toggle button, falls back to raw for non-JSON.

6. **Save example response** — Store the response body alongside the endpoint definition. Later, the endpoint detail shows: Request | Example Response | Generated Docs. Turns the module from a tester into a documentation tool.

### B-Tier — Medium Value

7. **Duplicate endpoint detection** — When the user saves an endpoint, check for existing endpoints with the same URL + method combination in the same collection. Show a non-blocking warning: "An endpoint with this URL and method already exists in [Collection] — still save?" Prevents accumulating near-identical endpoints across test iterations.

8. **Request history per endpoint** — Log of past requests/responses for a saved endpoint.
9. **Import from cURL** — Parse a `curl` command into URL, method, headers, body.
10. **Export collection** — Download as Postman collection JSON.
11. **Binary response handling** — Detect `Content-Type` and show image preview, file download, or "binary response" indicator instead of garbled text.
12. ~~**Collection delete warning**~~ ✅ **Done (P1)** — Confirmation overlay with endpoint count; delete button always visible (opacity-based, not hover-only).
13. **Timeout user feedback** — Distinguish timeout from network error in the response viewer.

### C-Tier — Low Priority

14. **Multi-request tabs** — Useful for power Postman users, but this is a Knowledge Vault + API Client, not a Postman replacement. Build S and A tier first.
15. **SSL verification toggle** — For local dev servers with self-signed certs.
16. **Follow redirects toggle** — Currently always follows (axios default).
17. **Pre/post-request scripts** — Postman-style automation.
18. **Response body search** — Ctrl+F within large response bodies.
19. **Saved response snapshots** — Compare current response to a baseline.

---

## Filter Bar Rule (Endpoint Sidebar)

The endpoint sidebar has **4 active filters** (collection, category, method, favorites). Rule: more than 2 filters → use the Snippets pattern: a `[Filters]` button; clicking it reveals the filter selects. Apply this pattern to the sidebar filter controls.

---

## Main UI/UX — Best Idea

### Core Problems
- One request at a time — switching endpoints loses unsaved work
- No query params editor
- Response JSON is flat text — no tree, no highlighting
- No auto-save

### Proposed Layout

**Three-panel layout with adjusted proportions**
The RequestBuilder should dominate — users spend most time there:
```
20% sidebar | 45% request builder | 35% response viewer
```

```
┌──────────────┬────────────────────────────┬─────────────────────┐
│ Collections  │      Request Builder       │   Response Viewer   │
│              │ [ENV: prod ▾]              │                     │
│ ► Backend    │ [POST▾] [url ____________] [Send]   200  142ms   │
│   POST /user │ ─────────────────────────  │ Body │ Headers      │
│   GET  /user │ Auth │ Params │ Hdr │ Body │ {                   │
│              │                            │   "id": 1,          │
│ ► Frontend   │  [textarea / key-val]      │   "name": ...       │
│              │                            │ }                   │
│ All (3)      │                            │ [Copy] [Generate ▾] │
└──────────────┴────────────────────────────┴─────────────────────┘
```

**Environment switcher** — dropdown in the toolbar to select active environment. Variables interpolated in URL and headers.

**Tabs inside RequestBuilder**
```
[Auth] [Params] [Headers] [Body]
```
- **Auth:** Select type (None / Bearer / Basic / API Key) and enter credentials. Applied automatically on Send.
- **Params:** Key-value table that syncs bidirectionally with the URL bar.
- **Headers:** Dual mode — raw text (`Key: Value` per line) OR a key-value table. Developers type faster than they click; both modes must exist.
- **Body:** Current behavior (type selector + textarea).

**JSON tree response viewer**
Collapsible nodes, syntax coloring, click to copy individual values. Falls back to plain text for non-JSON.

**"Generate Code" dropdown in response viewer**
After a successful response: `[Generate ▾]` → fetch / axios / curl / Python. Output appears in a modal with copy-all.

---

## Save Endpoint Modal — Best Idea

### Core Problems
- No visual confirmation of what's being saved
- Collection creation requires navigating to the sidebar first
- No auto-suggested title

### Proposed Design
- **Header of modal:** Read-only request summary `[POST] https://api.example.com/users` — users confirm what they're saving
- **Auto-suggested title** from URL path last segment (`/users` → "Users"), editable
- **Inline collection creation** — `[+ New]` next to the collection dropdown opens a small popover, no modal escape
- **Description placeholder** that prompts documentation: "What does this endpoint do? What should the response look like?"

---

## Strategic Note

The risk of building this module is drifting toward a Postman clone — and losing that fight. Postman is too mature to beat on feature count.

The right angle is **Save → Test → Document → Reuse**: save an endpoint alongside a note, a snippet (the auth code), and a prompt (the API description for an AI). When search finds "Stripe payment", it should surface the endpoint, the snippet, and the note together. That cross-module cohesion is what Postman doesn't have and can't easily build.
