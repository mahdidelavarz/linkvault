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

> Security-related items (SSRF vulnerability, auth credentials stored but not applied, raw token storage, secrets vault integration) are documented in [dev_security.md](dev_security.md).

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
- **Collections sidebar:** browse by collection, create inline, delete (with orphaned-endpoint count warning), count badge
- **"All Endpoints" section** for uncollected endpoints
- **Filter endpoints** by collection, category, method, search, favorites (button+expand pattern)
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
- **Generate Code** — "Generate" button in the response toolbar (after a request is sent) opens a modal with cURL / fetch / axios / Python equivalents of the resolved request (incl. interpolated vars and auth headers), with copy-to-clipboard (P5-8 A-1)
- **Save example response** — saving/updating an endpoint snapshots the last response as `exampleResponse`; selecting that endpoint later shows the saved example (with a "Saved example" badge) until a live request is sent (P5-8 A-2)
- **Import from cURL** — "Import cURL" button in the request title row opens a modal to paste a cURL command; parses method, URL, headers, and body into the request builder (P5-8 A-3)

---

## Remaining Work

### Open Bugs — None known

Both previously tracked bugs are resolved:

- Header colon-in-value parsing — `page.tsx`'s header textarea parser already split correctly on the first `:` and rejoined the rest (`split(':')` + `rest.join(':')`); the actual data-loss bug was in `parseCurlCommand` (`lib/snippetUtils.ts`), which destructured `split(':')` and silently dropped everything after the second colon. Fixed by switching to `indexOf(':')` + slice, and reused by the new cURL import (A-3) and code generators (A-1).
- Endpoint list pagination — `Api.service.ts` `getEndpoints()` now caps results at 200 via `.take(200)`.

Also fixed in passing: `useDeleteEndpoint` (`useApiClient.ts`) had a broken `mutationFn` that returned an unexecuted async function, so deleting a saved endpoint never actually called the API.

### P5-8 (DEVMAP) — A-Tier done

A-1 (Generate Code), A-2 (Save example response), and A-3 (Import from cURL) are implemented — see Current Features above.

### B-Tier — Medium Value
- **Duplicate endpoint detection** — When the user saves an endpoint, check for existing endpoints with the same URL + method combination in the same collection. Show a non-blocking warning: "An endpoint with this URL and method already exists in [Collection] — still save?" Prevents accumulating near-identical endpoints across test iterations.

- **Export collection** — Download as Postman collection JSON.
- **Binary response handling** — Detect `Content-Type` and show image preview, file download, or "binary response" indicator instead of garbled text. Currently `Api.service.ts` returns raw binary bodies as strings, and `ResponseViewer` renders them as monospace garbage with no indication the content is binary.
- **Timeout user feedback** — Distinguish a 30s axios timeout from a connection-refused or 500 error in the response viewer; currently both look identical to the user.

### C-Tier — Low Priority
- **SSL verification toggle** — For local dev servers with self-signed certs.
- **Follow redirects toggle** — Currently always follows (axios default).
- **Pre/post-request scripts** — Postman-style automation.
- **Response body search** — Ctrl+F within large response bodies.

---

## Future Redesign Proposals

Not scheduled — kept as reference for the A-4 audit and any future redesign.

### Main UI/UX — Best Idea

**Proposed Layout: Three-panel layout with adjusted proportions**
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

**Tabs inside RequestBuilder**
```
[Auth] [Params] [Headers] [Body]
```
- **Auth:** Select type (None / Bearer / Basic / API Key) and enter credentials. Applied automatically on Send. (See [dev_security.md](dev_security.md) for the auth-not-applied issue.)
- **Params:** Key-value table that syncs bidirectionally with the URL bar. *(Done — P3-15)*
- **Headers:** Dual mode — raw text (`Key: Value` per line) OR a key-value table. Developers type faster than they click; both modes must exist.
- **Body:** Current behavior (type selector + textarea).

**"Generate Code" dropdown in response viewer** (A-1)
After a successful response: `[Generate ▾]` → fetch / axios / curl / Python. Output appears in a modal with copy-all.

### Save Endpoint Modal — Best Idea

**Core Problems**
- No visual confirmation of what's being saved
- Collection creation requires navigating to the sidebar first
- No auto-suggested title

**Proposed Design**
- **Header of modal:** Read-only request summary `[POST] https://api.example.com/users` — users confirm what they're saving
- **Auto-suggested title** from URL path last segment (`/users` → "Users"), editable
- **Inline collection creation** — `[+ New]` next to the collection dropdown opens a small popover, no modal escape
- **Description placeholder** that prompts documentation: "What does this endpoint do? What should the response look like?"

---

## Strategic Note

The risk of building this module is drifting toward a Postman clone — and losing that fight. Postman is too mature to beat on feature count.

The right angle is **Save → Test → Document → Reuse**: save an endpoint alongside a note, a snippet (the auth code), and a prompt (the API description for an AI). When search finds "Stripe payment", it should surface the endpoint, the snippet, and the note together. That cross-module cohesion is what Postman doesn't have and can't easily build.
