# Infrastructure Module

## Purpose

The infrastructure module stores developer configuration artifacts — the files and data that define how a system is built, deployed, and connected. This includes environment variable files, SSH server credentials, Docker Compose configurations, deployment runbooks, and database connection configs. These items are often sensitive, frequently needed, and hard to locate when scattered across file systems.

---

## The User

A developer managing one or more servers, containers, or cloud services. They need infrastructure details accessible without opening files on disk or digging through shell history. They trust that sensitive values (keys, passwords, env contents) are stored securely.

---

## Infrastructure Types

There are 5 types, each representing a distinct category of configuration:

| Type | What it holds |
|------|--------------|
| **env** | Environment variable files (`.env` format or similar) |
| **server** | SSH connection details for a remote server |
| **docker** | Docker Compose configuration details |
| **deployment** | A deployment process: steps, platform info, and rollback plan |
| **config** | Database connection configuration |

---

## Information & Data

### Common fields (all types)

| Field | Description | Required |
|-------|-------------|----------|
| Title | Human-readable name | Yes |
| Type | One of the 5 types above | Yes |
| Description | Context about this item | No |
| Content | The main configuration text body | No |
| Category | One category from the user's category tree | No |
| Tags | Zero or more tags | No |
| Favorite | Boolean | No |

### Type-specific metadata

#### env
- A list of key-value pairs (the environment variables)
- Each value can be individually marked as **sensitive** — sensitive values are masked by default and the user must explicitly reveal them
- The entire content (the env file body) is vault-encrypted

#### server
- Host (domain or IP address)
- Port (default: 22)
- Username
- Auth type: password or SSH key
- SSH key (vault-encrypted)
- Password (vault-encrypted, if auth type is password)

#### docker
- Docker Compose version
- List of service names defined in the compose file

#### deployment
- Target platform (e.g., Kubernetes, Vercel, AWS, DigitalOcean, etc.)
- Deployment steps (ordered list of steps to execute)
- Rollback plan (what to do if the deployment fails)

#### config (database)
- Database engine (PostgreSQL, MySQL, SQLite, MongoDB, etc.)
- Host
- Port
- Database name
- Credentials (username, password — vault-encrypted)

---

## Content Preview

The main content field for each item shows only the first 5 lines by default. The user can expand the item to see the full content. This keeps the list readable when items contain long files.

---

## Env → API Client Integration

Infrastructure items of type **env** can be used as environment variable sets in the API Client module. When the user is working in the API Client and selects an environment, env-type infrastructure items appear as options. The key-value pairs from the env item are made available as `{{VARIABLE_NAME}}` substitutions in the API Client request fields.

---

## Actions

| Action | Description |
|--------|-------------|
| Create item | Fill in title, type, and type-specific fields; save |
| Edit item | Modify any field |
| Delete item | Permanently remove |
| Favorite / Unfavorite | Toggle favorite |
| Copy content | Copy the full content body to clipboard |
| Expand / Collapse preview | Toggle between first-5-lines preview and full content |
| Reveal / Mask sensitive value | Toggle visibility of a specific masked env variable value |
| Filter | Narrow list by text, category, tags, type, favorites-only |

---

## States

| State | Description |
|-------|-------------|
| Empty | No items exist |
| Loading | Items being fetched |
| Populated | List of items displayed |
| Preview mode | Item shows first 5 lines of content |
| Expanded mode | Full content is visible |
| Vault locked | Sensitive fields (env content, SSH key, passwords) are hidden |
| Filtered / No results | Active filters applied |

---

## Rules & Constraints

- Title and type are required; all other fields are optional
- Vault must be set up and unlocked to store or view vault-protected fields (env content, SSH keys, database passwords, server passwords)
- Sensitive env values are masked by default; each can be revealed individually
- Sort options: last updated (default), date created, title
- Filter by text searches across: title, description, content

---

## Edge Cases

- **Vault locked**: Items containing vault-encrypted fields show masked indicators. User must unlock the vault to reveal the actual values.
- **Vault not set up**: Sensitive fields cannot be stored at all. The user is informed that vault setup is required to protect these values.
- **env item used in API Client**: If the env item is edited or deleted after being referenced in the API Client, the API Client environment reference may break or no longer reflect current values — the user is responsible for keeping them in sync.
- **Offline**: Cached items are readable. Vault-encrypted fields may require network access to decrypt depending on the vault session state.
