'use client';

// Web Crypto API only — no external crypto libraries.

function buf2b64(buf: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

function b642buf(b64: string): ArrayBuffer {
    const bin = atob(b64);
    const buf = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    return buf.buffer;
}

function str2buf(str: string): ArrayBuffer {
    return new TextEncoder().encode(str).buffer;
}

function buf2str(buf: ArrayBuffer): string {
    return new TextDecoder().decode(buf);
}

// ─── Field encryption/decryption ────────────────────────────────────────────

export async function encryptField(
    plaintext: string,
    vaultKey: CryptoKey
): Promise<{ encryptedValue: string; iv: string }> {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        vaultKey,
        str2buf(plaintext)
    );
    return {
        encryptedValue: buf2b64(ciphertext),
        iv: buf2b64(iv.buffer),
    };
}

export async function decryptField(
    encryptedValue: string,
    iv: string,
    vaultKey: CryptoKey
): Promise<string> {
    const plaintext = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: b642buf(iv) },
        vaultKey,
        b642buf(encryptedValue)
    );
    return buf2str(plaintext);
}

// ─── Master key derivation ───────────────────────────────────────────────────

// PBKDF2, 310,000 iterations, SHA-256.
// Salt includes userId so two users with the same mnemonic get distinct master keys.
export async function deriveMasterKey(mnemonic: string, userId: string): Promise<CryptoKey> {
    const salt = str2buf(`linkvault-v1:${userId}`);
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        str2buf(mnemonic),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );
    return await crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt, iterations: 310_000, hash: 'SHA-256' },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,  // not extractable
        ['encrypt', 'decrypt']
    );
}

// ─── Vault key wrap/unwrap ───────────────────────────────────────────────────

export async function generateVaultKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,   // extractable so we can wrap it
        ['encrypt', 'decrypt']
    );
}

export async function encryptVaultKey(vaultKey: CryptoKey, masterKey: CryptoKey): Promise<string> {
    const exported = await crypto.subtle.exportKey('raw', vaultKey);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const wrapped = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        masterKey,
        exported
    );
    // Store as iv:ciphertext, both base64
    return `${buf2b64(iv.buffer)}:${buf2b64(wrapped)}`;
}

// Returns non-extractable CryptoKey — used only when raw bytes are not needed.
export async function decryptVaultKey(encryptedVaultKey: string, masterKey: CryptoKey): Promise<CryptoKey> {
    const raw = await decryptVaultKeyRaw(encryptedVaultKey, masterKey);
    return await importVaultKeyRaw(raw);
}

// Returns raw bytes — used by recovery flow so we can store in IndexedDB before importing.
export async function decryptVaultKeyRaw(encryptedVaultKey: string, masterKey: CryptoKey): Promise<ArrayBuffer> {
    const [ivB64, ciphertextB64] = encryptedVaultKey.split(':');
    return await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: b642buf(ivB64) },
        masterKey,
        b642buf(ciphertextB64)
    );
}

// Export raw vault key bytes for IndexedDB storage (before importing non-extractable)
export async function exportVaultKeyRaw(vaultKey: CryptoKey): Promise<ArrayBuffer> {
    return await crypto.subtle.exportKey('raw', vaultKey);
}

// Import vault key from raw bytes as non-extractable CryptoKey for session
export async function importVaultKeyRaw(raw: ArrayBuffer): Promise<CryptoKey> {
    return await crypto.subtle.importKey(
        'raw',
        raw,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

// ─── PIN key derivation ───────────────────────────────────────────────────────
// PIN is never stored — wrong PIN = AES-GCM auth tag failure (cryptographic gate).
// Salt includes userId so the same PIN on different accounts gives different keys.

export async function derivePinKey(pin: string, userId: string): Promise<CryptoKey> {
    const keyMaterial = await crypto.subtle.importKey(
        'raw', str2buf(pin), { name: 'PBKDF2' }, false, ['deriveKey']
    );
    return crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt: str2buf(`linkvault-pin-v1:${userId}`), iterations: 310_000, hash: 'SHA-256' },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

// Encrypt raw vault key bytes with a PIN-derived key.
// Output layout: [12-byte IV | ciphertext] as a single ArrayBuffer.
export async function encryptRawWithPinKey(rawKey: ArrayBuffer, pinKey: CryptoKey): Promise<ArrayBuffer> {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, pinKey, rawKey);
    const out = new Uint8Array(12 + ciphertext.byteLength);
    out.set(iv, 0);
    out.set(new Uint8Array(ciphertext), 12);
    return out.buffer;
}

// Decrypt a PIN-encrypted blob back to raw vault key bytes.
// Throws if PIN is wrong (AES-GCM auth tag mismatch).
export async function decryptRawWithPinKey(blob: ArrayBuffer, pinKey: CryptoKey): Promise<ArrayBuffer> {
    const iv = new Uint8Array(blob, 0, 12);
    const ciphertext = new Uint8Array(blob, 12);
    return crypto.subtle.decrypt({ name: 'AES-GCM', iv }, pinKey, ciphertext);
}
