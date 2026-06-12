# Links Module

## Purpose

The links module is the user's bookmark manager with built-in credential storage. A "link" is any URL the user wants to remember — a tool, a service, a documentation page, an internal admin panel — combined with the login information needed to access that URL. The user saves a link once and never has to search their memory or password manager separately.

---

## The User

A developer saving and retrieving URLs they access regularly. They often need both the URL and the credentials simultaneously. They may have dozens or hundreds of links and rely on search and filters to find the right one quickly.

---

## Information & Data

Each link contains:

| Field | Description | Required |
|-------|-------------|----------|
| URL | The web address | Yes |
| Title | Human-readable name for the link | Auto-fetched from the page; editable |
| Description | Short summary of the page's content | Auto-fetched from the page; editable |
| Favicon | The site's icon image | Auto-fetched; not manually editable |
| Username | Login username for the site | No |
| Email | Login email for the site | No |
| Phone | Phone number associated with the account | No |
| Password | Login password (vault-encrypted) | No |
| Category | One category from the user's category tree | No |
| Tags | Zero or more tags | No |
| Favorite | Boolean flag | No (defaults to false) |
| Created at | Timestamp | Auto-set |
| Updated at | Timestamp | Auto-updated |

### Auto-fetch behavior
When the user enters a URL, the application attempts to retrieve the page's title, description, and favicon from that URL automatically (after a short pause while typing). If the fetch succeeds, these fields are pre-filled but remain editable. If the fetch fails, the fields remain blank and must be filled manually.

### Password field
The password is stored via the vault (encrypted on the client before saving). The vault must be unlocked to view or edit the password. If the vault is locked, the password field shows a locked indicator — the user must unlock the vault to interact with it.

---

## Actions

| Action | Description |
|--------|-------------|
| Create link | Open a form, fill in URL (and optionally other fields), save |
| Edit link | Modify any field of an existing link |
| Delete link | Permanently remove a single link |
| Bulk delete | Select multiple links and delete them all at once |
| Favorite | Toggle the favorite status on a single link |
| Bulk favorite | Toggle favorite status on multiple selected links at once |
| Copy URL | Copy the link's URL to the clipboard; user receives feedback that the copy succeeded |
| Filter | Narrow the visible list by search text, category, tags, or favorites-only |
| Sort | Change the ordering of the list |

---

## States

| State | Description |
|-------|-------------|
| Empty | No links saved yet; user sees a prompt to add their first link |
| Loading | Items are being fetched; placeholder content shown |
| Populated | List of links displayed |
| Filtered | List is narrowed by active search/filter criteria; result count is visible |
| No results | Active filters return zero items; user is informed |
| Creating | User is filling out the creation form |
| Editing | User is modifying an existing link |
| Vault locked | Password fields are hidden; vault unlock is required to view them |
| Bulk selection mode | User has selected one or more items; bulk actions become available |

---

## Rules & Constraints

- URL is required; title, description, and credentials are all optional
- Duplicate detection: when saving a new link, if another link with the exact same URL already exists, the user is warned before saving proceeds (they can choose to save anyway or cancel)
- Password is vault-encrypted; without the vault being set up and unlocked, the password field cannot be stored or viewed
- Pagination: 20 links per page; additional items load as the user scrolls down (infinite scroll)
- Sorting options: last updated (default, newest first), date created, title (alphabetical)
- Filter by text searches across: title, URL, description, username

---

## Flows

### Creating a link with credentials
1. User initiates a new link
2. Enters URL → title and description are auto-fetched
3. Enters credentials (username, email, phone, password)
4. For password: if vault is locked, user is prompted to unlock it first; if vault is not set up, password storage is unavailable
5. Saves; link appears in the list

### Viewing a password
1. User finds the link in the list
2. The password field shows a masked indicator (not the actual value) while vault is locked
3. User unlocks the vault (enters PIN or uses biometric)
4. Password field reveals the decrypted value
5. Vault re-locks after 5 minutes of inactivity

### Bulk operations
1. User enters bulk selection mode
2. Selects individual links (one by one or all at once)
3. Chooses an action: delete or favorite
4. Confirms destructive actions (delete); non-destructive actions (favorite) apply immediately

---

## Edge Cases

- **URL fetch fails**: The page's metadata cannot be retrieved (e.g., the URL is a private server, the site blocks scrapers). Fields remain blank; user fills them manually. The link can still be saved.
- **Duplicate URL**: User tries to save a URL that already exists. They are warned and can choose to proceed or cancel.
- **Vault not set up**: User tries to save a password. They are informed the vault must be set up first before sensitive fields can be stored.
- **Vault locked when viewing**: Password field is visible as a locked state; clicking it prompts vault unlock rather than immediately showing the value.
- **Offline**: List shows cached data. Creating or editing links is not available.
