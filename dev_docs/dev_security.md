# Security Dev Map

This document is the single source of truth for all security decisions in this project. It is structured in two layers and three implementation phases.

**Layer 1 — Infrastructure Security:** Fix bugs that expose the server to attack, regardless of any encryption layer.
**Layer 2 — Zero-Knowledge Vault:** Client-side field-level encryption so the server never holds plaintext secrets.

Both layers are needed. Layer 1 must come first. Layer 2 is the larger and more valuable system.

---

## Implementation Status

| Phase | Scope | Status |
|-------|-------|--------|
| **Phase 1** — Infrastructure Security (§1.1–1.3) | SSRF fix, auth header injection, server-side encryption bridge | ✅ **Complete (P0)** — done before any public access |
| **Phase 2** — Zero-Knowledge Vault (21 steps) | Client-side encryption, vault entities, `useVault` hook, SecureField UI | ✅ **Complete (P4-A)** — done 2026-06-07 |
| **Phase 3** — Field Migration | Encrypt existing `authData`, `content`, `passwordEncrypted` fields at rest | ✅ **Complete (P5-1)** — done 2026-06-08 |

---

## Sensitive Field Inventory

All fields that require vault protection, by module. This is the ground truth for what gets encrypted.

```
SENSITIVE FIELDS
════════════════════════════════════════

Module: Infrastructure (env type)
  - Infrastructure.content          ← entire .env content, highest priority

Module: Infrastructure (server type)
  - Infrastructure.metadata.sshKey
  - Infrastructure.metadata.password (if present)
  - Infrastructure.metadata.token (if present)

Module: API Client
  - ApiEndpoint.authData            ← Bearer tokens, API keys, Basic auth credentials
  - ApiEndpoint.headers             ← entries matching Authorization: ...

Module: Links
  - Link.passwordEncrypted          ← site passwords (verify if actually encrypted today)

OUT OF SCOPE FOR VAULT
  - Note.content                    ← not typically sensitive, user discretion
  - Snippet.content                 ← same as notes
  - Link.email, Link.phone          ← PII but not credentials; address separately
```

---

## Phase 1 — Infrastructure Security (Fix First, Independent of Vault)

These bugs exist today and must be fixed before any public access. They are independent of the vault and do not require vault work to resolve.

---

### 1.1 SSRF Vulnerability — Critical
**File:** `backend/src/services/Api.service.ts` — `testEndpoint()`

The API Client proxy makes outbound HTTP requests with zero URL validation. An authenticated user can send requests to:
- `http://localhost:3000/admin` — app's own internal services
- `http://169.254.169.254/` — AWS EC2 instance metadata (exposes IAM credentials)
- Any RFC 1918 / loopback / link-local address

**Fix — validate before the axios call:**
1. Parse the URL and resolve the hostname to an IP address
2. Reject private ranges: `10.x`, `172.16–31.x`, `192.168.x`, `127.x`, `169.254.x`, `::1`
3. Allow only `http` and `https` schemes
4. DNS rebinding guard: re-resolve after initial check, since a hostname can resolve to a public IP at check time and a private one at request time

---

### 1.2 Auth Fields Not Applied in Test Requests — Broken Feature
**File:** `backend/src/services/Api.service.ts`, `backend/src/entities/ApiEndpoint.ts`

`ApiEndpoint` has `authType` and `authData` fields but `testEndpoint()` ignores them entirely. Bearer-authenticated endpoints always get 401s when tested.

**Fix:** Before making the axios request, check `authType` and inject:
- `bearer` → `Authorization: Bearer <token>`
- `basic` → `Authorization: Basic <base64(user:pass)>`
- `api-key` → header or query param per `authData` config

---

### 1.3 Auth Tokens Stored as Literal Plaintext — Temporary Fix
**File:** `backend/src/entities/ApiEndpoint.ts`

`authData` holds `{ "token": "Bearer eyJ..." }` as a raw JSON string in the database. No encryption.

**Immediate fix:** In Phase 1, treat this the same as the Infrastructure plaintext issue — apply server-side encryption to `authData` as a bridge until the vault is built. In Phase 2, the vault replaces this with a proper client-encrypted `SecureField` record.

---

## Phase 2 — Zero-Knowledge Vault

The vault stores sensitive field values encrypted on the client before they are sent to the server. The server only ever sees ciphertext — it has no ability to read the plaintext, even with full database access.

This is the right approach for this app. It is a developer knowledge vault that stores credentials, SSH keys, and API tokens — the same data that dedicated tools like 1Password or Doppler protect. The vault makes the app trustworthy for storing real production secrets.

---

### 2.1 Architecture Overview

```
USER DEVICE                              SERVER
──────────────────────                   ──────────────────
BIP39 mnemonic (12 words)
        ↓
PBKDF2 key derivation → masterKey
                                         UserVault
masterKey encrypts vaultKey ───────────→ encryptedVaultKey (blob, opaque)
        ↓
vaultKey stored in IndexedDB
        ↓
biometric unlock (WebAuthn) gates
retrieval from IndexedDB
        ↓
vaultKey encrypts each field value
AES-GCM 256-bit, unique IV per field

{ encryptedValue, iv } ────────────────→ SecureField records (blobs, opaque)

Server never sees: mnemonic, masterKey, vaultKey, plaintext values
```

**Recovery path:** User enters mnemonic on a new device → PBKDF2 derives masterKey → fetch `encryptedVaultKey` from server → decrypt to recover vaultKey → vault is restored.

**Session:** vaultKey lives in memory as a non-extractable CryptoKey. Auto-locks after 5 minutes of inactivity and whenever the app tab becomes hidden (critical for PWA mobile — switching apps must lock the vault).

---

### 2.2 Threat Model & Scope

| Threat | Mitigation |
|--------|-----------|
| Server database breach | ZK: server only holds ciphertext, useless without vaultKey |
| Unauthorized server access | Same — ciphertext has no value |
| Device theft | WebAuthn biometric + IndexedDB sandbox isolation |
| Device compromise (malware) | Out of scope — compromised OS defeats any client-side scheme |
| XSS attack | Set strict CSP headers to prevent script injection |
| Forgotten mnemonic | Data is unrecoverable — by design, user is warned at setup |

**What the vault is NOT:** A general-purpose password manager competing with 1Password or Bitwarden. Scope is strictly the sensitive fields listed in the inventory above — credentials stored in this app's modules. This focus keeps the implementation tractable while delivering meaningful protection.

---

### 2.3 New Backend Entities

**`UserVault`** — one per user, tracks vault enrollment and holds the encrypted vault key for recovery.

```typescript
// backend/src/entities/UserVault.ts
@Entity('user_vaults')
export class UserVault {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'user_id', unique: true })
    userId!: number;

    @Column({ type: 'text', name: 'encrypted_vault_key', nullable: true })
    encryptedVaultKey!: string | null;  // vaultKey encrypted with masterKey — opaque blob

    @Column({ name: 'is_enabled', default: false })
    isEnabled!: boolean;

    @Column({ name: 'enabled_at', nullable: true })
    enabledAt!: Date | null;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}
```

**`SecureField`** — one record per sensitive field value per item. Holds only ciphertext.

```typescript
// backend/src/entities/SecureField.ts
@Entity('secure_fields')
@Index(['userId', 'module', 'recordId', 'fieldName'], { unique: true })
export class SecureField {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'user_id' })
    userId!: number;

    @Column()
    module!: string;  // 'infrastructure' | 'api_endpoint' | 'link'

    @Column({ name: 'record_id' })
    recordId!: string;

    @Column({ name: 'field_name' })
    fieldName!: string;

    @Column({ type: 'text', name: 'encrypted_value' })
    encryptedValue!: string;  // base64 AES-GCM ciphertext

    @Column({ type: 'text' })
    iv!: string;  // base64 initialization vector — unique per encryption

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}
```

Migration: generate and run for both entities before any vault work begins.

---

### 2.4 Vault API Routes

Server handles only encrypted blobs. No decryption logic ever runs server-side.

```
POST   /api/vault/setup                    → save encryptedVaultKey, mark vault enabled
GET    /api/vault/status                   → { isEnabled: boolean }
GET    /api/vault/encrypted-key            → { encryptedVaultKey } (for recovery)

POST   /api/vault/fields                   → upsert one field { module, recordId, fieldName, encryptedValue, iv }
GET    /api/vault/fields/:module/:recordId → all encrypted fields for a record
DELETE /api/vault/fields/:module/:recordId/:fieldName

POST   /api/vault/fields/batch             → upsert multiple fields at once
```

**Validation rules:**
- `encryptedValue` and `iv` must be non-empty base64 strings
- All fields required — no optional plaintext accepted
- Server logs must never print `encryptedValue` content (add to logger config)

---

### 2.5 Client Library — `src/lib/vault/`

Five files, each with a single responsibility.

**`crypto.ts`** — all cryptographic operations using only `crypto.subtle` (Web Crypto API, no external libraries):

```typescript
// Field-level encryption/decryption
encryptField(plaintext: string, vaultKey: CryptoKey): Promise<{ encryptedValue: string; iv: string }>
decryptField(encryptedValue: string, iv: string, vaultKey: CryptoKey): Promise<string>

// Master key derivation from mnemonic
// PBKDF2, 310,000 iterations, SHA-256, userId as salt
deriveMasterKey(mnemonic: string, userId: string): Promise<CryptoKey>

// Vault key wrap/unwrap with master key
encryptVaultKey(vaultKey: CryptoKey, masterKey: CryptoKey): Promise<string>
decryptVaultKey(encryptedVaultKey: string, masterKey: CryptoKey): Promise<CryptoKey>
```

Algorithm choices:
- Field encryption: AES-GCM 256-bit, unique random 12-byte IV per operation
- Key derivation: PBKDF2 with 310,000 iterations (OWASP 2023 recommendation)
- Vault key wrap: AES-GCM 256-bit
- **Do not use any external crypto library** — Web Crypto API only

Salt for `deriveMasterKey`: must include the `userId`, not just a fixed app string. Without it, two users with the same 12-word mnemonic derive identical master keys — a privacy flaw. Recommended: `salt = utf8Encode("linkvault-v1:" + userId)`.

**`storage.ts`** — IndexedDB persistence via `idb` library:

```typescript
storeVaultKey(keyData: ArrayBuffer): Promise<void>  // store before importing non-extractable
loadVaultKey(): Promise<ArrayBuffer | null>
clearVaultKey(): Promise<void>
// DB: 'SecureVaultDB', store: 'keys'
```

Note: the vaultKey is stored as raw ArrayBuffer in IndexedDB (before being imported as non-extractable CryptoKey for session use). This means IndexedDB access = vaultKey access. The biometric is an application-level gate, not a cryptographic wrapper around the stored key. For this app's threat model (personal developer vault, primary threat is server breach), this is acceptable.

**`biometric.ts`** — WebAuthn platform authenticator (FaceID / Fingerprint):

```typescript
isBiometricAvailable(): Promise<boolean>
registerBiometric(): Promise<void>   // creates credential, stores credentialId in localStorage
verifyBiometric(): Promise<boolean>  // asserts with userVerification: 'required'
```

WebAuthn requires HTTPS. Ensure the dev environment uses a local HTTPS cert or test biometric flows only in production.

**Biometric unavailable fallback:** if `isBiometricAvailable()` returns false, or the WebAuthn assertion is cancelled by the user, fall back to a manual unlock flow: user types their 12-word mnemonic → `deriveMasterKey()` → fetch `encryptedVaultKey` from server → `decryptVaultKey()` → import as session key. This is the same path as recovery. Slower than biometric but always works. Show it as a secondary button: "Use recovery phrase instead".

**`session.ts`** — in-memory vault session. Auto-lock behavior is critical for the PWA mobile use case:

```typescript
VaultSession.unlock(key: CryptoKey): void
VaultSession.getKey(): CryptoKey | null  // resets inactivity timer on every call
VaultSession.lock(): void
VaultSession.isUnlocked(): boolean
```

Lock triggers:
- Inactivity timeout: 5 minutes since last `getKey()` call
- `document.visibilitychange` where `document.hidden === true` — essential for mobile PWA; switching apps must lock the vault immediately

**`index.ts`** — high-level `VaultService` composing the above:

```typescript
VaultService.setup(): Promise<string>              // full setup flow, returns 12-word mnemonic
VaultService.unlock(): Promise<boolean>            // biometric verify → load from IndexedDB → session
VaultService.encryptAndSave(module, recordId, fieldName, plaintext): Promise<void>
VaultService.loadAndDecrypt(module, recordId, fieldName): Promise<string | null>
VaultService.recover(mnemonic: string): Promise<boolean>   // re-derive key from mnemonic
VaultService.disable(): Promise<void>              // delete all SecureField records + UserVault
```

---

### 2.6 React Hook — `useVault`

```typescript
// src/hooks/useVault.ts
export function useVault() {
    return {
        isEnabled: boolean,        // vault has been set up by user
        isUnlocked: boolean,       // vault is in active session (key in memory)
        isLoading: boolean,
        unlock: () => Promise<boolean>,
        lock: () => void,
        encrypt: (module, recordId, fieldName, plaintext) => Promise<void>,
        decrypt: (module, recordId, fieldName) => Promise<string | null>,
    }
}
```

---

### 2.7 UI — `SecureField` Component

Wraps the display of any sensitive field value. Two states:

**State A — Vault locked or not set up:**
```
┌───────────────────────────────────────────┐
│  [blurred placeholder content]            │  ← CSS blur(8px), pointer-events: none
│                                           │
│  ┌─────────────────────────────────┐      │
│  │  🔒 Vault required              │      │  ← absolute overlay card
│  │  [Enable Vault] or [Unlock]     │      │
│  └─────────────────────────────────┘      │
└───────────────────────────────────────────┘
```

**State B — Vault unlocked:**
- Show decrypted value normally
- Small 🔒 icon button to manually lock the session
- For password-type fields: show/hide toggle

```typescript
// src/components/vault/SecureField.tsx
interface SecureFieldProps {
    module: string          // 'infrastructure' | 'api_endpoint' | 'link'
    recordId: string
    fieldName: string
    label: string
    type?: 'text' | 'password' | 'textarea'
    placeholder?: string   // shown in blur state
}
```

This component replaces every raw display of a sensitive field across all module cards and detail views.

---

### 2.8 UI — Vault Settings Page

Route: `/settings/vault`

**View 1 — Not set up:**
- One paragraph explaining what the vault protects (list the modules from the inventory)
- Single CTA: "Set Up Secure Vault"

**View 2 — Setup flow (3 steps):**

Step A — Show mnemonic:
- 12 words in a 3×4 grid, each numbered
- Warning banner (red): "Write these words down. We do not store them. If you lose them, your encrypted data cannot be recovered."
- Checkbox: "I have written down my recovery phrase" — required to continue
- Page must not be indexable or cached (`noindex`, clear from history on navigate away)

Step B — Verify mnemonic (recommended):
- Ask user to enter 3 randomly selected words by position number
- On success: proceed to biometric

Step C — Register biometric:
- "Register Face ID / Fingerprint"
- On success: navigate to View 3

**View 3 — Active:**
- Status: "Vault Active" with green indicator
- Last unlocked: relative timestamp
- "Lock Vault Now" button
- Recovery section: "View Recovery Instructions" (explains the mnemonic re-entry flow)
- Danger zone: "Disable Vault" — confirms with modal, warns that all encrypted values will be permanently deleted

---

### 2.9 Navigation Integration

- If vault enabled + unlocked: show 🔓 icon in app header, tooltip "Vault Unlocked"
- If vault enabled + locked: show 🔒 icon, clicking triggers biometric unlock prompt
- If vault not set up: show nothing — don't push the feature on users

Add "Security" or "Vault" link to the settings navigation.

---

## Phase 3 — Full Field Migration

Once the vault is built (Phase 2), replace raw sensitive field displays and form saves across all modules. Work through the inventory from top to bottom.

### Existing Data Migration (One-Time UX)

Users who had data before the vault was introduced have plaintext values in the database. On the first unlock after vault setup completes, check for un-encrypted sensitive fields and show a one-time prompt:

```
"You have 8 items with sensitive fields not yet protected.
 Encrypting them now removes the plaintext from the server.
 [Encrypt all now]   [Remind me later]"
```

Migration flow:
1. Fetch all existing sensitive field values from the standard module APIs
2. Encrypt each with `VaultService.encryptAndSave()`
3. Send a patch request per item to clear the plaintext value on the server (set to `null` or the placeholder `"vault:encrypted"`)
4. Show per-item progress: "Encrypting 8 of 12..."

After migration, the plaintext never exists on the server again. Users who choose "Remind me later" see a persistent banner in relevant module pages until they complete migration.

---

**Infrastructure module:**
- `InfraCard.tsx`: replace the current CSS blur with `<SecureField module="infrastructure" recordId={infra.id} fieldName="content" />` for env type; per-key rendering for server metadata fields
- `InfraForm.tsx`: on save, if vault enabled + unlocked, call `VaultService.encryptAndSave()` for sensitive fields before submitting; if vault enabled + locked, prompt unlock first

**API Client module:**
- `RequestBuilder.tsx`: `authData` fields rendered via `<SecureField module="api_endpoint" recordId={endpoint.id} fieldName="authData" />`
- On save: encrypt authData before submission when vault is active
- Environment variable injection remains functional: vault-encrypted Infrastructure env → decrypt at runtime → inject into request

**Links module:**
- `LinkCard.tsx`, `LinkForm.tsx`: treat `passwordEncrypted` as a vault field

**Secret auto-detection in forms (all modules):**
- When a user types a value matching secret patterns (JWT `eyJ...`, AWS keys `AKIA...`, private key headers, `*_SECRET` / `*_KEY` / `*_TOKEN` / `*_PASSWORD` variable names), show an inline prompt:
  `🔒 Looks like a sensitive value — encrypt with Vault? [Yes] [Skip]`
- If vault is not yet set up, prompt: `🔒 Vault not enabled — enable it to protect this value [Enable Vault]`

---

## Implementation Order

```
Phase 1 ✅ Done (P0)
  1. ✅ Fix SSRF URL validation in Api.service.ts
  2. ✅ Fix auth application in testEndpoint()
  3. ✅ Apply server-side encryption to authData as a bridge (temporary)

Phase 2 ✅ Done (P4-A — 2026-06-07)
  4.  ✅ Run inventory — confirm the field list above
  5.  ✅ Install: bip39, idb
  6.  ✅ Create UserVault and SecureField entities + migration
  7.  ✅ Build /api/vault routes
  8.  ✅ Implement crypto.ts (Web Crypto API only)
  9.  ✅ Implement storage.ts (IndexedDB)
  10. ✅ Implement biometric.ts (WebAuthn)
  11. ✅ Implement session.ts (in-memory + auto-lock)
  12. ✅ Implement VaultService index.ts
  13. ✅ Build useVault hook
  14. ✅ Build SecureField component
  15. ✅ Build Vault Settings page (all 3 views)
  16. ✅ Add navigation integration (lock/unlock icon in Header)

Phase 3 ✅ Complete (P5-1 — 2026-06-08)
  17. ✅ Build existing-data migration UX — VaultMigrationModal + useVaultMigration hook; fires on vault unlock when plaintext items detected; "Encrypt all now" bulk-encrypts + clears server plaintext; "Remind me later" re-shows next unlock
  18. ✅ Migrate Infrastructure sensitive fields — InfraCard + InfraForm both already vault-integrated (P4-A); confirmed complete
  19. ✅ Migrate API Client authData — Auth tab added to RequestBuilder (bearer/basic/api-key); authType saved to endpoint; authData encrypted to vault on save; auth headers injected client-side at send time
  20. ✅ Migrate Links password — LinkCard + LinkForm both already vault-integrated (P4-A); confirmed complete
  21. ✅ Add secret auto-detection to all forms — VaultSecretHint + detectSecret already wired in InfraForm + LinkForm (P4-A); confirmed complete
```

---

## Security Rules — Never Violate

1. **Never send plaintext sensitive values to the server** once vault is enabled
2. **Never log or print `encryptedValue` content** in server logs — configure the logger to scrub these fields
3. **Never store the mnemonic or masterKey** anywhere — not localStorage, not sessionStorage, not DB, not component state beyond the setup flow
4. **Never make `vaultKey` extractable** after importing for session use (`extractable: false` on import)
5. **Always use a unique random IV** for every field encryption operation — reusing an IV with the same key breaks AES-GCM
6. **Always verify biometric** with `userVerification: 'required'` — do not fall back to `'preferred'`
7. **Lock on tab hide** — `document.visibilitychange` must trigger `VaultSession.lock()` — non-negotiable for a PWA on mobile
8. **HTTPS only** — WebAuthn requires it; enforce at the server level, not just in code
