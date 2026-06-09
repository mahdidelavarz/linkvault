# LinkVault — Product Overview

## What Is This Product

LinkVault is a personal knowledge vault for developers. It is a private, self-hosted web application where a single user stores, organizes, and retrieves the information that powers their daily development work: URLs and login credentials, written notes, reusable code fragments, AI prompt templates, infrastructure configurations, and HTTP API endpoints.

The product is not a team tool. It is not a public-facing service. It exists to answer one question: "Where did I put that?" — whether "that" is a password, a regex pattern, a prompt that worked well last month, or an SSH key for a server.

---

## The User

A solo developer (or small team member) who:
- Juggles many projects, services, and tools simultaneously
- Regularly needs to recall URLs, credentials, configs, and code patterns from weeks or months ago
- Stores sensitive information (passwords, API keys, private keys) and expects them to be secure at rest
- Uses AI assistants (ChatGPT, Claude, etc.) and has accumulated reusable prompts
- Manages infrastructure (servers, containers, environment files, databases) and needs configs accessible without digging through file systems

The user's relationship with this app is habitual and frequent — they open it multiple times per day. Speed of retrieval and trust in security are the highest priorities.

---

## Core Problems Solved

1. **Fragmentation**: Developer knowledge lives across browser bookmarks, password managers, note apps, code editors, and terminals. LinkVault consolidates all of it.
2. **Credential storage alongside context**: A saved URL means nothing without the username and password to log in. These are stored together.
3. **Reusability**: Code snippets, prompts, and configs that took time to craft are saved and reused rather than rewritten.
4. **Security**: Sensitive values are encrypted on the client before reaching the server. The server never sees the plaintext of passwords, keys, or env files.
5. **Findability**: Everything is searchable globally. Items that are hard to categorize can be tagged and found later.

---

## The Seven Content Modules

Each module handles a distinct type of developer knowledge:

| Module | What it holds |
|--------|--------------|
| **Links** | Web URLs with auto-fetched metadata and optional login credentials |
| **Notes** | Markdown-formatted written notes |
| **Snippets** | Code fragments in 40+ languages, with type-specific tools |
| **Prompts** | AI prompt templates with variable substitution |
| **Infrastructure** | Environment files, server configs, Docker configs, deployment runbooks, database configs |
| **API Client** | Saved HTTP requests grouped into collections, with environments and a live request tester |
| **Projects** | Named containers that group items from any of the above modules |

---

## Global Organizing Concepts

These systems apply across all modules and are always available:

### Favorites
Any item in any module can be marked as a favorite. Favorites can be filtered for at any time. This is a lightweight "I use this constantly" signal — no hierarchy, no nesting, just a binary flag.

### Categories
A hierarchical folder-like system. Each item belongs to at most one category. Categories can be nested (parent → child). Categories are user-created and apply across all modules. When a category is deleted, items in it become uncategorized — they are not deleted.

### Tags
A flat label system. Any item can have multiple tags. Tags are user-created and apply across all modules — the same tag can label a link, a snippet, and a prompt simultaneously. Tags are used for flexible cross-cutting grouping beyond categories.

### Projects
A named container with a title, description, color, and emoji. Any item from any module can be added to a project. Items can belong to multiple projects. Projects represent themes like "Backend API v2" or "Client Onboarding" — they gather everything related to one topic in one place regardless of item type.

---

## The Vault (Security Layer)

The vault is the application's encryption layer. When active, it protects sensitive fields — link passwords, SSH keys, API auth credentials, infrastructure secrets — by encrypting them on the user's device before they are sent to the server.

Key properties:
- The vault is unlocked with a PIN chosen at setup
- Biometric unlock (fingerprint/Face ID) can be registered as an alternative
- The vault auto-locks after 5 minutes of inactivity or when the browser tab is hidden
- A 12-word recovery phrase is generated at setup — it is the only way to recover vault data if the PIN is forgotten
- While locked, all vault-protected fields are hidden and uneditable
- The server stores only encrypted data; it cannot decrypt any vault-protected value

The vault setup is a one-time, guided process. It is not required to use the app, but without it, sensitive fields (passwords, keys, secrets) cannot be stored securely.

---

## Offline & Installation

The app is installable as a Progressive Web App on desktop and mobile. When installed and offline:
- Previously loaded data remains visible (read-only)
- No new items can be created or modified
- The user is informed they are in offline read-only mode

---

## Navigation Model

The app has a persistent navigation structure that provides access to:
- Each of the 7 content modules
- Global search
- Categories manager
- Tags manager
- Vault settings
- Dashboard (home/overview)

A global keyboard shortcut (Ctrl+K) opens a floating quick-search palette from anywhere in the app.

---

## Authentication

The app requires an account. All data is scoped to the logged-in user. There is no public data, no sharing between users (currently), and no guest access.
