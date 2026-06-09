# API Client Module

## Purpose

The API Client is an embedded HTTP request builder and tester. The user constructs an HTTP request, executes it, and inspects the response — all without leaving the vault. Requests are saved into named collections for future reuse. The goal is to eliminate context-switching to external tools (Postman, Insomnia, curl) for routine API work.

---

## The User

A developer building or integrating with APIs who needs to test endpoints, inspect responses, and save requests for repeated use. They may work across multiple APIs (different services, different environments) and need to quickly switch between them.

---

## Structure

The module has three functional zones that are always visible together:

1. **Collections pane** — a list of collections, each containing their saved endpoints; used for navigation and organization
2. **Request zone** — where the user builds the HTTP request (method, URL, headers, parameters, body, authentication)
3. **Response zone** — where the server's response is displayed after execution (status, timing, size, headers, body)

The request zone and response zone are side-by-side and the boundary between them is resizable by the user.

---

## Collections

A collection is a named group of endpoints. Collections have:
- Name
- Optional description
- A list of endpoints (zero or more)

An endpoint can optionally belong to a collection. Endpoints without a collection are treated as uncollected.

---

## Information & Data

### Endpoint fields

| Field | Description | Required |
|-------|-------------|----------|
| Title | Human-readable name for this request | No |
| URL | The full request URL | Yes |
| Method | HTTP verb: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS | Yes |
| Description | Notes about this endpoint | No |
| Headers | Key-value pairs sent as request headers; each row can be enabled or disabled | No |
| Query parameters | Key-value pairs appended to the URL; synchronized bidirectionally with the URL bar | No |
| Body | The request body content | Conditional (not for GET/HEAD) |
| Body type | How the body is encoded: JSON, form-data, x-www-form-urlencoded, raw, or none | Conditional |
| Auth type | Authentication method (see below) | No |
| Auth data | Credentials specific to the chosen auth type (vault-encrypted) | Conditional |
| Collection | Which collection this endpoint belongs to | No |

### Authentication types

| Auth type | What it requires |
|-----------|-----------------|
| None | No authentication |
| Bearer token | A token string; sent in the `Authorization: Bearer ...` header |
| Basic auth | Username and password; encoded and sent in the `Authorization` header |
| API Key | A key value and the header name to send it in |
| OAuth2 | An OAuth2 token |

Auth credentials are stored via the vault (encrypted at rest).

### Query parameters
Query parameters have their own table of key-value rows. When the user edits a parameter in the table, the URL bar updates automatically. When the user edits the URL bar and adds `?key=value` pairs directly, the table updates automatically. Both directions are always in sync.

---

## Environments

An environment is a named set of key-value variables. When an environment is active, any `{{VARIABLE_NAME}}` placeholder found in the URL, headers, or body is substituted with the variable's value before the request is sent.

Environments have:
- Name
- A list of key-value variable pairs

The user can have multiple environments (e.g., "dev", "staging", "prod") and switch between them. Only one environment is active at a time.

**Infrastructure integration**: Infrastructure items of type `env` also appear as selectable environments. Their key-value pairs are made available for substitution.

---

## Request Execution

When the user executes a request:
1. Active environment variables are substituted into the URL, headers, and body
2. Auth credentials are injected based on the selected auth type
3. The request is sent through the application's server (not directly from the browser — this avoids CORS issues and allows reaching internal URLs)
4. SSRF protection runs on the server: requests targeting private IP ranges (loopback, LAN ranges) are blocked
5. The response is returned and displayed in the response zone

---

## Response Information

After a request is executed, the response zone shows:
- **Status code** (e.g., 200, 404, 500)
- **Response time** in milliseconds
- **Response size** in bytes
- **Response headers** as a list
- **Response body** as:
  - Raw text view (always available)
  - Interactive JSON tree view (available when the response body is valid JSON)

### JSON tree viewer
When the response is JSON, the body can be viewed as an interactive tree:
- Nodes can be collapsed and expanded individually
- Nodes deeper than 2 levels are collapsed by default
- Values are colored by type (string, number, boolean, null)

---

## Draft Auto-Save

The current state of the request zone (URL, method, headers, body, selected collection) is automatically saved to the browser's local storage. When the user navigates away and returns, the request zone is restored to where they left off. This is per-device and per-browser, not server-persisted.

---

## Actions

| Action | Description |
|--------|-------------|
| Create collection | Name a new collection |
| Rename / Delete collection | Manage existing collections |
| Create endpoint | Build a new request; optionally assign to a collection |
| Edit endpoint | Modify any field of a saved request |
| Delete endpoint | Permanently remove |
| Execute request | Send the current request and receive a response |
| Create environment | Define a set of key-value variable pairs |
| Edit / Delete environment | Manage existing environments |
| Select active environment | Switch which environment's variables are active |
| Add / Remove query parameter | Manage the query parameter table |
| Enable / Disable header row | Toggle individual headers on or off without deleting them |
| Expand / Collapse JSON tree node | Navigate the JSON response body |
| Resize request/response zones | Drag the divider between the request and response zones |

---

## States

| State | Description |
|-------|-------------|
| No request selected | Collections pane shows; request and response zones are blank |
| Request building | User is filling in the request fields |
| Request executing | A request has been sent; waiting for response |
| Response received | Response is displayed in the response zone |
| Request failed | Network error or SSRF block; error message shown |
| Vault locked | Auth credentials for endpoints using vault-encrypted auth are hidden and cannot be sent |

---

## Rules & Constraints

- URL and method are required to execute a request
- GET and HEAD requests cannot have a body
- Environment variable substitution happens at execution time, not at save time (the stored endpoint always contains the `{{VARIABLE}}` placeholders, not the resolved values)
- SSRF protection blocks: loopback addresses (127.x, ::1), private LAN ranges (10.x, 172.16–31.x, 192.168.x)
- Auth credentials are vault-encrypted; vault must be unlocked to send requests using auth types other than None
- Draft state persists in local storage only (not synced across devices)

---

## Edge Cases

- **CORS**: Because requests are proxied through the server, CORS is not an issue. The user can test any externally reachable URL.
- **SSRF block**: If the user tries to request a private IP, the system rejects it with a clear message explaining why.
- **Vault locked with auth**: The endpoint is saved but when the user tries to execute, auth credentials cannot be decrypted. The user must unlock the vault first.
- **Environment variable not defined**: If a `{{VARIABLE}}` in the URL or headers does not exist in the active environment, it is left as the literal placeholder text `{{VARIABLE}}` in the outgoing request.
- **Large response body**: Very large responses are rendered but may be truncated in the JSON tree view for performance reasons.
- **Offline**: The module is not usable offline — request execution requires server-side proxying.
