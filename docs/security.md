# LinkVault Security Architecture

This document has two parts:

- **Part 1 — Implementation Reference**: for the developer. Full technical detail on every component of the Secure Vault so you can maintain, debug, or change any part of it.
- **Part 2 — User Trust Document**: plain-language explanation of how the vault works and why users can trust it. Suitable for an FAQ or landing page.

---

# Part 1 — Implementation Reference

## 1. Baseline Auth (pre-vault)

| Property | Value |
|---|---|
| Password hashing | bcrypt (cost factor 12) |
| Access token | JWT, 15-minute lifetime |
| Refresh token | JWT, 7-day lifetime, stored in HttpOnly cookie |
| Token storage | HttpOnly + Secure + SameSite=Strict cookies |
| Link field encryption | AES-256 server-side (pre-vault, legacy) |

---

## 2. Secure Vault — Overview

The vault is a **zero-knowledge encryption layer** layered on top of the normal database. The server stores only opaque ciphertext blobs for protected fields. The server holds **no key material** and can never decrypt user data.

```
User device                        Server (PostgreSQL)
─────────────────────────────      ─────────────────────────────
PIN (never stored)                 encrypted_vault_key  ← mnemonic-wrapped
  │                                secure_fields        ← field ciphertext
  ▼
derivePinKey(pin, userId)
  │
  ▼
Decrypt IndexedDB blob
  │
  ▼
vaultKey (AES-256, non-extractable)   ←── only exists in memory during session
  │
  ▼
encrypt / decrypt fields locally
```

---

## 3. Key Hierarchy

There are three keys in the system. Each one protects the next.

```
mnemonic (12 BIP39 words)
  │
  └─► deriveMasterKey(mnemonic, userId)
        PBKDF2 / SHA-256 / 310,000 iterations
        salt = "linkvault-v1:{userId}"
        │
        └─► masterKey (AES-256-GCM)
              │
              └─► encryptVaultKey(vaultKey, masterKey)
                    → stored on server as encrypted_vault_key
                    → format: base64(iv):base64(ciphertext)
                    → server never sees vaultKey

PIN (4 digits, never stored)
  │
  └─► derivePinKey(pin, userId)
        PBKDF2 / SHA-256 / 310,000 iterations
        salt = "linkvault-pin-v1:{userId}"
        │
        └─► pinKey (AES-256-GCM)
              │
              └─► encryptRawWithPinKey(vaultKey_raw, pinKey)
                    → stored in IndexedDB as PIN-encrypted blob
                    → format: [12-byte IV | ciphertext] as ArrayBuffer
                    → IndexedDB access alone gives nothing

vaultKey (AES-256-GCM, 256-bit random)
  │
  └─► encryptField(plaintext, vaultKey)
        unique random 12-byte IV per operation
        → stored in secure_fields table
        → format: {encryptedValue: base64, iv: base64}
```

### Why two derivations (mnemonic + PIN)?

The mnemonic solves **cross-device recovery** — it lets you reconstruct the vault key on a new machine. The PIN solves **local gate** — on any given device, the raw vault key is never stored unprotected; it is always wrapped by the PIN key. Neither secret alone is sufficient to access data:

- Mnemonic only: can reconstruct the vault key on a new device by fetching the server blob, but cannot access the PIN-encrypted local copy directly.
- PIN only: can decrypt the IndexedDB blob, but only if you already have it (physical device access).
- Server breach only: attacker gets ciphertext blobs with no keys.

---

## 4. Cryptographic Primitives

All crypto is done through the **Web Crypto API** (`crypto.subtle`). No third-party crypto libraries.

| Operation | Algorithm | Parameters |
|---|---|---|
| Key derivation (mnemonic) | PBKDF2 | SHA-256, 310,000 iterations, salt=`linkvault-v1:{userId}` |
| Key derivation (PIN) | PBKDF2 | SHA-256, 310,000 iterations, salt=`linkvault-pin-v1:{userId}` |
| Vault key generation | AES-GCM | 256-bit, extractable=true (only during setup, exported immediately) |
| Field encryption | AES-GCM | 256-bit, unique random 12-byte IV per operation |
| Vault key wrap (server) | AES-GCM | 256-bit, unique random 12-byte IV |
| Vault key wrap (IndexedDB) | AES-GCM | 256-bit, unique random 12-byte IV, layout: [IV\|ciphertext] |
| Mnemonic generation | BIP39 | 128-bit entropy → 12 words |
| Session key | AES-GCM | 256-bit, `extractable: false` — cannot be exported from memory |

### Why AES-GCM?

AES-GCM provides both confidentiality (AES-CTR) and authenticity (GHASH). An incorrect PIN or corrupted ciphertext causes an authentication tag mismatch that throws a `DOMException` — wrong PIN is a cryptographic failure, not a logic check. There is no "incorrect password" flag to bypass.

### Why 310,000 PBKDF2 iterations?

NIST SP 800-132 recommends ≥ 210,000 for SHA-256. 310,000 is above that threshold and matches what major password managers use. On a modern desktop it takes ~1 second to derive; a brute-force attacker must pay that cost per guess.

### IV uniqueness guarantee

`crypto.getRandomValues` generates a fresh 12-byte IV for every encryption call. AES-GCM is secure only when the same (key, IV) pair is never reused. With a random 96-bit IV and one operation per field save, the probability of collision is negligible (birthday bound: ~2^47 operations before 50% collision chance).

---

## 5. Storage Locations

| What | Where | Format | Who can read it |
|---|---|---|---|
| `encryptedVaultKey` | PostgreSQL `user_vaults` | `base64iv:base64ciphertext` | Server (opaque), only decryptable with mnemonic |
| `secure_fields` ciphertext | PostgreSQL `secure_fields` | `{encryptedValue, iv}` | Server (opaque), only decryptable with vaultKey |
| PIN-encrypted vaultKey | Browser IndexedDB (`SecureVaultDB`) | `ArrayBuffer [IV\|ciphertext]` | Local attacker (still needs PIN to decrypt) |
| `credentialId` | Browser `localStorage` | string | Used only to locate WebAuthn credential |
| `vaultKey` (session) | JavaScript memory (VaultSession) | `CryptoKey`, non-extractable | Only during unlocked session; cleared on lock |

**Nothing sensitive is ever in `localStorage`, `sessionStorage`, or cookies.** The mnemonic and PIN are never persisted anywhere.

---

## 6. File Map

```
frontend/src/lib/vault/
  crypto.ts       — all Web Crypto API operations (derive, encrypt, decrypt, wrap, unwrap)
  storage.ts      — IndexedDB read/write for the PIN-encrypted vault key blob
  biometric.ts    — WebAuthn platform authenticator (registration + assertion)
  session.ts      — in-memory VaultSession: holds non-extractable CryptoKey, auto-lock timer
  index.ts        — VaultService: orchestrates setup / unlock / recover / encryptAndSave / loadAndDecrypt

frontend/src/hooks/
  useVault.ts     — React hook: exposes vault state + actions to components

frontend/src/components/vault/
  VaultGuard.tsx      — blur overlay wrapper; shows unlock prompt when locked
  SecureField.tsx     — displays a single encrypted field with decrypt-on-unlock
  VaultSecretHint.tsx — inline hint when a secret pattern is detected in a form field
  PinModal.tsx        — 4-digit PIN input modal (PinModal) + setup variant (PinSetupInput)

frontend/src/app/(dashboard)/settings/vault/
  page.tsx        — setup flow (PIN → mnemonic → verify) + recover flow + active vault view

backend/src/entities/
  UserVault.ts    — one row per user; holds encryptedVaultKey + isEnabled flag
  SecureField.ts  — one row per encrypted field; unique on (userId, module, recordId, fieldName)

backend/src/migrations/
  1781000000001-AddVaultTables.ts — creates user_vaults and secure_fields tables

backend/src/services/
  Vault.service.ts    — getStatus, setup, getEncryptedKey, disable, upsertField, getFields, deleteField, batchUpsertFields

backend/src/controllers/
  Vault.controller.ts — HTTP handlers; validates base64 format; never logs encryptedValue content

backend/src/routes/
  vault.route.ts  — 8 routes under /api/vault
```

---

## 7. Setup Flow (step by step)

```
1. User clicks "Set Up Secure Vault"
2. PinSetupView shown — user enters + confirms 4-digit PIN
3. VaultService.setup(userId, pin):
   a. bip39.generateMnemonic()  →  12-word phrase (128-bit entropy)
   b. crypto.subtle.generateKey(AES-GCM 256)  →  vaultKey (extractable=true)
   c. crypto.subtle.exportKey('raw', vaultKey)  →  rawKey (ArrayBuffer)
   d. deriveMasterKey(mnemonic, userId)  →  masterKey
   e. encryptVaultKey(vaultKey, masterKey)  →  encryptedVaultKey ("iv:ct")
   f. POST /api/vault/setup { encryptedVaultKey }  →  stored on server
   g. derivePinKey(pin, userId)  →  pinKey
   h. encryptRawWithPinKey(rawKey, pinKey)  →  pinBlob
   i. storeVaultKey(pinBlob)  →  IndexedDB
   j. importVaultKeyRaw(rawKey)  →  sessionKey (extractable=false)
   k. VaultSession.unlock(sessionKey)  →  vault is now open
4. MnemonicView — user writes down the 12 words
5. VerifyView — user enters 3 random words to prove they saved it
6. Vault is active; mnemonic is discarded from memory
```

---

## 8. Unlock Flow

```
1. User clicks lock icon in header (or any VaultGuard "Unlock" button)
2. window.dispatchEvent('vault:unlock-requested')
3. Header's PinModal opens — user enters 4-digit PIN
4. Auto-submits on 4th digit entry
5. VaultService.unlock(pin, userId):
   a. loadVaultKey()  →  pinBlob from IndexedDB
   b. derivePinKey(pin, userId)  →  pinKey
   c. decryptRawWithPinKey(pinBlob, pinKey)
      - Throws DOMException if PIN wrong (AES-GCM auth tag mismatch)
      - Returns rawKey if correct
   d. importVaultKeyRaw(rawKey)  →  sessionKey (extractable=false)
   e. VaultSession.unlock(sessionKey)
6. PinModal shows "Incorrect PIN" on failure; PIN field clears; user can retry
```

---

## 9. Auto-Lock

Implemented in `session.ts`. Two triggers, both non-negotiable:

| Trigger | Mechanism | Why |
|---|---|---|
| 5 min inactivity | `setTimeout` reset on every `mousemove`, `keydown`, `click`, `touchstart` | Prevents unattended session exposure |
| Tab hidden | `document.addEventListener('visibilitychange')` → lock when `document.hidden === true` | Critical for PWA on mobile — switching apps hides the tab |

On lock: `VaultSession.lock()` sets the in-memory `CryptoKey` reference to `null`. Because the key was imported as `extractable: false`, it cannot be exported or cloned — the GC will collect it. The only way back in is PIN + IndexedDB blob.

---

## 10. Recovery Flow (new device)

```
1. User is on a new device (no IndexedDB blob, vault shows as locked with no key)
2. User opens Settings → Vault → "Recover with existing phrase"
3. RecoverView:
   a. User enters 12-word mnemonic
   b. User sets a new 4-digit PIN for this device
4. VaultService.recover(mnemonic, userId, pin):
   a. GET /api/vault/encrypted-key  →  encryptedVaultKey from server
   b. deriveMasterKey(mnemonic, userId)  →  masterKey
   c. decryptVaultKeyRaw(encryptedVaultKey, masterKey)  →  rawKey
      - Throws if mnemonic is wrong (AES-GCM auth tag mismatch)
   d. derivePinKey(pin, userId)  →  pinKey (new PIN for this device)
   e. encryptRawWithPinKey(rawKey, pinKey)  →  new pinBlob
   f. storeVaultKey(pinBlob)  →  IndexedDB on new device
   g. importVaultKeyRaw(rawKey)  →  sessionKey
   h. VaultSession.unlock(sessionKey)
5. All previously encrypted fields are now accessible — the vault key is the same
```

Each device can have a different PIN. The server blob is the single source of truth for recovery.

---

## 11. Field Encryption (encrypt & save)

```
VaultService.encryptAndSave(module, recordId, fieldName, plaintext):
  1. key = VaultSession.getKey()  →  throws if vault locked
  2. iv  = crypto.getRandomValues(new Uint8Array(12))
  3. ct  = crypto.subtle.encrypt({AES-GCM, iv}, key, TextEncoder(plaintext))
  4. POST /api/vault/fields { module, recordId, fieldName, encryptedValue: base64(ct), iv: base64(iv) }
  5. Server upserts into secure_fields (INSERT ... ON CONFLICT DO UPDATE)

VaultService.loadAndDecrypt(module, recordId, fieldName):
  1. key = VaultSession.getKey()  →  returns null if locked
  2. GET /api/vault/fields/{module}/{recordId}
  3. Find field by fieldName
  4. crypto.subtle.decrypt({AES-GCM, iv: b64→buf(iv)}, key, b64→buf(encryptedValue))
  5. return TextDecoder(plaintext)
```

The plaintext **never touches the network**. Only the ciphertext and IV are sent to the server.

---

## 12. Backend Validation Rules

- `encryptedVaultKey` validated against `/^[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+$/` (base64:base64 format)
- `encryptedValue` and `iv` validated against `/^[A-Za-z0-9+/=]+$/` (pure base64)
- All vault routes require a valid JWT (auth middleware)
- `encryptedValue` content is **never logged** — the logger is configured to scrub this field
- `module` is accepted as a string (no enum restriction — allows future modules without migration)

---

## 13. Security Rules (non-negotiable)

1. Never send plaintext sensitive values to the server once vault is enabled
2. Never log `encryptedValue` content in server logs
3. Never store the mnemonic or masterKey beyond the setup flow (not in state, localStorage, DB, or component state after the MnemonicView is dismissed)
4. Never make `vaultKey` extractable after importing for session use (`extractable: false`)
5. Always generate a unique random IV for every field encryption — reusing an IV with the same key breaks AES-GCM security
6. Always lock on tab hide — `document.visibilitychange` triggers `VaultSession.lock()` when `document.hidden === true`
7. WebAuthn (if re-added) must use `userVerification: 'required'` — never `'preferred'`
8. HTTPS only — WebAuthn requires it; enforce at the reverse proxy level

---

## 14. Threat Model

| Threat | Mitigation |
|---|---|
| Server database breach | Attacker gets ciphertext only. No keys are on the server. |
| Attacker reads IndexedDB | Gets PIN-encrypted blob. Must brute-force PIN × 310k PBKDF2 iterations per guess (~10,000 PINs × ~1s each ≈ ~3 hours on fast hardware). Consider 6-digit PIN for higher-value vaults. |
| XSS on the app | Can access IndexedDB and memory during the session. Mitigate with strict CSP. The vault does not protect against a fully compromised client. |
| Replay attack on /api/vault/fields | JWT expiry (15 min) limits window. Field upsert is idempotent — replaying the same ciphertext just overwrites with itself. |
| Lost mnemonic | Encrypted data is permanently unrecoverable. No server-side backdoor. |
| Lost PIN (device still accessible) | User must disable vault (deletes all server-side fields) and re-setup with new PIN + new mnemonic. No PIN reset path exists. |
| Wrong mnemonic entered in recovery | AES-GCM auth tag mismatch → throws → recovery returns false. No oracle. |

---

## 15. Changing or Extending the Vault

### Add a new encrypted module (e.g. `api_client`)
1. Use `VaultService.encryptAndSave('api_client', recordId, fieldName, value)` on save
2. Use `VaultService.loadAndDecrypt('api_client', recordId, fieldName)` on display
3. No backend migration needed — `module` is a free string in `secure_fields`
4. Wrap the display area with `<VaultGuard>` and add `<VaultSecretHint>` to the form

### Increase PIN length (e.g. 6 digits)
1. In `PinModal.tsx`: change `maxLength={4}` to `maxLength={6}` in the `PinInput` and `PinSetupInput` components
2. Update the `PinSetupInput` validation: `pin.length < 6`
3. No crypto changes needed — the PIN string is fed directly into PBKDF2

### Change PBKDF2 iterations
Update the `iterations` value in both `deriveMasterKey` and `derivePinKey` in `crypto.ts`.
Warning: existing encrypted data will become inaccessible unless you re-derive with the old iteration count first and re-wrap.

### Replace PBKDF2 with Argon2
Web Crypto API does not support Argon2. You would need a WASM build (e.g. `argon2-wasm`). The change is isolated to `derivePinKey` and `deriveMasterKey` in `crypto.ts`. The rest of the system is unaffected.

### Add a "change PIN" feature
1. Unlock vault (loads `rawKey` into session)
2. Ask user for new PIN
3. `derivePinKey(newPin, userId)` → new pinKey
4. `encryptRawWithPinKey(rawKey, newPinKey)` → new pinBlob
5. `storeVaultKey(newPinBlob)` → overwrites IndexedDB
The server blob (`encryptedVaultKey`) does not change — it is still protected by the mnemonic.

---

---

# Part 2 — User Trust Document

## How the Secure Vault Works (and Why You Can Trust It)

### The short version

Your sensitive data — passwords, API keys, SSH keys, environment variables — is encrypted on **your device** before it ever leaves your browser. The server receives only scrambled ciphertext that it cannot read. Not even the people who run LinkVault can access your data.

---

### What "zero-knowledge" means

Most apps encrypt your data "at rest" — meaning it is encrypted on the server's disk, but the server holds the encryption key too. If the server is breached or the operator is compelled to hand over data, your plaintext can be extracted.

LinkVault works differently. Your vault key is generated on your device and never sent to the server in usable form. The server stores a copy of the key, but that copy is locked with a 12-word recovery phrase that only you know. The server cannot open it.

```
What the server holds:
  ✗ Your passwords                →  ✓ Encrypted passwords (gibberish without your key)
  ✗ Your vault key                →  ✓ A locked copy of your key (only you can open it)
  ✗ Your PIN or recovery phrase   →  ✗ Nothing — these never leave your device
```

---

### Your two secrets

You have two secrets that protect the vault:

**1. Your 4-digit PIN** — used to unlock the vault on your current device. It is never stored anywhere. When you enter your PIN, the app uses it to unlock a local copy of your vault key stored in your browser. Wrong PIN = cryptographic failure. There is no bypass.

**2. Your 12-word recovery phrase** — used to recover access on a new device, or if you forget your PIN and need to start over. It must be written down and kept offline. If you lose it, your encrypted data is permanently unrecoverable — we have no backdoor.

Think of them like a house key (PIN) and a master key kept in a safe (recovery phrase). The house key opens the door every day. The master key is used only when the house key is lost.

---

### What happens when you save a secret

When you enter a password or API key into a vault-protected field and save it:

1. Your vault key (held in browser memory) encrypts the value using AES-256-GCM — a standard algorithm used by banks and governments.
2. A unique random code (IV) is generated for every single encryption — so encrypting the same password twice produces completely different ciphertext.
3. Only the scrambled ciphertext and the random code are sent to the server. Your plaintext value never leaves your device.

---

### What happens when you view a secret

1. The server sends the encrypted ciphertext to your browser.
2. Your vault key (in browser memory) decrypts it locally.
3. You see the plaintext. Nothing sensitive was sent over the network.

---

### Can LinkVault see my data?

No. Here is why this is technically impossible, not just a policy promise:

- The vault key that encrypts your fields exists only in your browser's memory during an unlocked session.
- The server holds an encrypted copy of this key, but it is locked with your 12-word phrase using 310,000 rounds of cryptographic hashing. Without your phrase, unlocking that copy would take longer than the age of the universe on current hardware.
- We do not log, cache, or intercept the plaintext values that pass through our API — the values we receive are already encrypted before they arrive.

Even if our database were entirely stolen, the attacker would have a collection of meaningless ciphertext with no keys to decrypt it.

---

### What protects you while the app is open?

- **Auto-lock after 5 minutes of inactivity** — if you walk away from your computer, the vault locks itself.
- **Auto-lock when you switch tabs** — switching to another app or tab immediately locks the vault. This is especially important on mobile where apps run in the background.
- **PIN required to unlock** — every time the vault locks, you need your PIN to reopen it.

---

### What are the limits?

Honest security means being clear about what the vault does not protect against:

- **If someone steals your unlocked device while the vault is open**, they can see your decrypted data — the vault is designed to prevent server breaches, not physical device theft. Lock your device.
- **If your browser is infected with malware**, the malware could read the vault's memory. Use an up-to-date browser and keep your operating system patched.
- **If you lose both your PIN and your recovery phrase**, your encrypted data cannot be recovered. Not by you, not by us.
- **A 4-digit PIN has 10,000 combinations**. It is protected by expensive cryptographic hashing that makes brute-forcing slow (~1 second per guess), but a 6-character alphanumeric PIN would be stronger. We recommend choosing a PIN you do not use elsewhere.

---

### The technology behind it

For those who want to verify the implementation:

| What | How |
|---|---|
| Encryption algorithm | AES-256-GCM (authenticated encryption) |
| Key derivation | PBKDF2-SHA256, 310,000 iterations (exceeds NIST recommendations) |
| Mnemonic generation | BIP39 standard, 128-bit entropy, 12 words |
| Crypto implementation | Web Crypto API (`crypto.subtle`) — the browser's built-in crypto, audited by browser vendors |
| No external crypto libraries | All cryptographic operations use native browser APIs only |

The full implementation is documented in the developer reference in this same file.

---

### Summary

| Claim | Guarantee |
|---|---|
| Server cannot read your data | Cryptographic — the server holds no working keys |
| Wrong PIN is rejected | Cryptographic — AES-GCM authentication tag failure, not a password check |
| Lost mnemonic = lost data | By design — no backdoor exists |
| Vault locks on inactivity | 5-minute timer + tab-hide event |
| No sensitive data in logs | Enforced in the backend controller — encrypted values are never logged |
