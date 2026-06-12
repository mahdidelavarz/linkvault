# Vault & Security

## Purpose

The vault is a client-side encryption layer that protects sensitive fields in the vault. Without it, link passwords, SSH keys, environment variable contents, database credentials, and API authentication data would be stored as plaintext. With it, those values are encrypted on the user's device before ever leaving for the server — the server stores only the encrypted ciphertext and cannot decrypt it.

The vault exists to answer: "What if the database is compromised?" With the vault active, a database breach exposes only encrypted blobs, not the actual secrets.

---

## The User

Any user who stores passwords, keys, or secrets in their vault. Once the vault is set up, it is a background concern — they unlock it once per session, and the rest of the app behaves normally. The user only interacts with vault controls explicitly when: setting it up, unlocking it, registering biometric, recovering a forgotten PIN, or disabling it.

---

## What the Vault Protects

The vault encrypts specific fields within specific modules:

| Module | Protected fields |
|--------|-----------------|
| Links | Password |
| Infrastructure (env type) | Entire content (the env file body) + individual sensitive values |
| Infrastructure (server type) | SSH key, password |
| Infrastructure (config type) | Database credentials |
| API Client | Auth credentials (Bearer tokens, Basic auth passwords, API keys) |

Fields that are not in this list are stored unencrypted and are always accessible.

---

## Core Security Properties

- **Zero-knowledge**: The server stores the vault key only in its encrypted form. It cannot decrypt any vault-protected field. A person with full database access cannot read protected values without the user's PIN or recovery phrase.
- **Per-field encryption**: Each protected field has its own unique encryption initialization vector (IV). Two identical values stored in different fields produce different ciphertexts.
- **PIN is never stored or transmitted**: The PIN is only used locally, on the user's device, to derive the decryption key. It never appears in any network request.
- **Session-only key**: The decrypted vault key exists in memory only for the duration of the vault session. It is not written to disk, localStorage, or sessionStorage.

---

## Vault Setup (First Time)

Setup is a one-time process with these steps:

1. **Choose a PIN** — 4 to 12 characters; this is the daily unlock credential
2. **Save the recovery phrase** — The app generates a 12-word phrase. This is shown **only once**. The user must write it down or store it securely. If the user loses both their PIN and this phrase, their vault data cannot be recovered. There is no other recovery path.
3. **Vault is now active** — Sensitive fields across existing items can be encrypted and migrated into the vault. New sensitive fields are encrypted on save.

---

## Unlocking the Vault

The vault must be unlocked to view or edit any vault-protected field.

### PIN unlock
- User enters their PIN
- The app derives the decryption key from the PIN locally
- If the PIN is correct, the vault key is decrypted and held in memory
- All vault-protected fields in the current session become accessible

### Biometric unlock
- Requires prior registration (see below)
- User authenticates using fingerprint, Face ID, or device PIN (depending on device capability)
- On success, the vault unlocks without entering the text PIN

### Auto-lock triggers
The vault locks automatically in these situations:
1. **Inactivity**: 5 minutes since the vault was last accessed
2. **Tab hidden**: The browser tab is minimized, switched away from, or the browser is backgrounded (important for mobile and multi-tab use)

When locked, all vault-protected fields become hidden. The user must unlock again.

---

## Biometric Registration

The user can register a biometric method (fingerprint, Face ID) as an alternative to the PIN. This is an optional convenience.

To register:
1. User opens vault settings
2. Initiates biometric registration
3. The device prompts for biometric authentication
4. On success, biometric unlock is enabled for subsequent sessions

The user can remove biometric registration from vault settings at any time. This does not affect the PIN or the vault data.

---

## Recovery (Forgotten PIN)

If the user forgets their PIN:

1. User initiates recovery from the vault unlock screen
2. User enters their 12-word recovery phrase
3. The app uses the phrase to decrypt the vault key from the server copy
4. User chooses a new PIN
5. Vault is now unlocked with the new PIN

If the user has also lost their recovery phrase, the vault data is permanently inaccessible. There is no backdoor and no admin override.

---

## Disabling the Vault

The user can disable the vault from settings. This action:
1. Permanently deletes all SecureField records from the server (all encrypted field values are gone)
2. Disables the vault
3. Leaves the items themselves intact — only the protected field values are lost

This cannot be undone. The user is asked to confirm explicitly before proceeding and is clearly informed that all encrypted data will be destroyed.

After disabling, sensitive fields (passwords, keys, etc.) can no longer be stored for any item. The user would need to set up the vault again to re-enable encryption.

---

## Vault Settings Page

The vault settings page is where the user manages all vault lifecycle actions. From here they can:
- Set up the vault (if not yet set up)
- See vault status (active / locked / unlocked)
- Change PIN (requires current PIN or recovery phrase)
- Register or remove biometric unlock
- View when the vault was enabled
- Disable the vault

---

## States

| State | Description |
|-------|-------------|
| Not set up | Vault has never been initialized; sensitive fields cannot be stored; setup prompt available |
| Active & locked | Vault is set up; session has not been unlocked yet; protected fields are hidden |
| Active & unlocked | Vault is set up and session is active; protected fields are accessible |
| Unlocking | User is entering PIN or biometric authentication is in progress |
| Recovery in progress | User is entering their 12-word phrase to recover access |
| Setup in progress | User is in the first-time setup flow |
| Disabled | Vault has been turned off; encrypted data has been deleted |

---

## Rules & Constraints

- One vault per user account (cannot have multiple vaults)
- PIN: 4 to 12 characters; no complexity requirements enforced
- Recovery phrase: 12 words, generated by the app; cannot be changed (a new vault would need to be set up)
- Auto-lock inactivity timer: 5 minutes (fixed, not user-configurable currently)
- Disabling the vault is irreversible — data is permanently deleted
- Biometric registration is per-device; registering on one device does not affect other devices
- If the vault is not set up, sensitive fields across all modules show a message explaining that the vault must be set up to store them

---

## Edge Cases

- **Wrong PIN on unlock**: The vault remains locked. The user can retry. There is no account lockout for incorrect PIN attempts (the PIN is validated locally, not against the server).
- **Recovery phrase entered incorrectly**: The decryption will fail and the vault will not unlock. The user is informed the phrase did not match and can try again.
- **Vault locked mid-session**: The user was editing an item with a vault-protected field, the vault timed out, and they navigate back. The protected field shows as locked; they must unlock to continue editing.
- **Multiple devices**: Each device has its own PIN-encrypted copy of the vault key stored locally. If the user sets up on a new device, they use the recovery phrase to re-derive the vault key and set a new PIN for that device. The vault key itself is the same across devices.
- **Vault setup incomplete**: If the user starts setup but does not save the recovery phrase and closes the page, the vault remains in "not set up" state. The setup must be completed from scratch.
