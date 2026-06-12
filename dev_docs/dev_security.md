# Security Dev Map

This document is the single source of truth for all security decisions in this project. It is structured in two layers:

**Layer 1 — Infrastructure Security:** Bugs that expose the server to attack, regardless of any encryption layer.
**Layer 2 — Zero-Knowledge Vault:** Client-side field-level encryption so the server never holds plaintext secrets.

---

## Implementation Status

| Phase | Scope | Status |
|-------|-------|--------|
| **Phase 1** — Infrastructure Security | SSRF fix, auth header injection, server-side encryption bridge | ✅ **Complete (P0)** |
| **Phase 2** — Zero-Knowledge Vault | Client-side encryption, vault entities, `useVault` hook, SecureField UI | ✅ **Complete (P4-A)** — done 2026-06-07 |
| **Phase 3** — Field Migration | Encrypt existing `authData`, `content`, `passwordEncrypted` fields at rest | ✅ **Complete (P5-1)** — done 2026-06-08 |

All security work is complete — see [DEVMAP.md](DEVMAP.md). The sections below are durable reference material, not a roadmap.

**Where the implementation lives:**
- Vault entities: `backend/src/entities/UserVault.ts`, `backend/src/entities/SecureField.ts`
- Vault API: `backend/src/routes/vault.route.ts`
- Client crypto/storage/session: `frontend/src/lib/vault/`
- `useVault` hook: `frontend/src/hooks/useVault.ts`
- `SecureField` component: `frontend/src/components/vault/SecureField.tsx`
- Vault Settings page: `frontend/src/app/settings/vault/`
- Migration UX: `VaultMigrationModal` + `useVaultMigration`

---

## Sensitive Field Inventory

All fields that require vault protection, by module. This is the ground truth for what gets encrypted — consult it whenever a new module or field is added.

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
  - Link.passwordEncrypted          ← site passwords

OUT OF SCOPE FOR VAULT
  - Note.content                    ← not typically sensitive, user discretion
  - Snippet.content                 ← same as notes
  - Link.email, Link.phone          ← PII but not credentials; address separately
```

---

## Vault Architecture Overview

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

**Session:** vaultKey lives in memory as a non-extractable CryptoKey. Auto-locks after 5 minutes of inactivity and whenever the app tab becomes hidden (`document.visibilitychange`) — critical for PWA mobile, since switching apps must lock the vault.

---

## Threat Model & Scope

| Threat | Mitigation |
|--------|-----------|
| Server database breach | ZK: server only holds ciphertext, useless without vaultKey |
| Unauthorized server access | Same — ciphertext has no value |
| Device theft | WebAuthn biometric + IndexedDB sandbox isolation |
| Device compromise (malware) | Out of scope — compromised OS defeats any client-side scheme |
| XSS attack | Strict CSP headers prevent script injection |
| Forgotten mnemonic | Data is unrecoverable — by design, user is warned at setup |

**What the vault is NOT:** A general-purpose password manager competing with 1Password or Bitwarden. Scope is strictly the sensitive fields listed in the inventory above — credentials stored in this app's modules. This focus keeps the implementation tractable while delivering meaningful protection.

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
