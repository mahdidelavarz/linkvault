'use client';

import * as bip39 from 'bip39';
import {
    generateVaultKey, encryptVaultKey, decryptVaultKeyRaw,
    deriveMasterKey, encryptField, decryptField,
    exportVaultKeyRaw, importVaultKeyRaw,
    derivePinKey, encryptRawWithPinKey, decryptRawWithPinKey,
} from './crypto';
import { storeVaultKey, loadVaultKey, clearVaultKey } from '../store/storage';
import { VaultSession } from './session';
import { post, get, del } from '../../../../lib/http';

// ─── API calls (server only ever sees ciphertext) ────────────────────────────

async function apiSetup(encryptedVaultKey: string) {
    return post('/vault/setup', { encryptedVaultKey });
}
async function apiGetEncryptedKey(): Promise<{ encryptedVaultKey: string }> {
    return get('/vault/encrypted-key');
}
async function apiUpsertField(field: {
    module: string; recordId: string; fieldName: string;
    encryptedValue: string; iv: string;
}) {
    return post('/vault/fields', field);
}
async function apiGetFields(module: string, recordId: string): Promise<{
    fields: { fieldName: string; encryptedValue: string; iv: string }[];
}> {
    return get(`/vault/fields/${module}/${recordId}`);
}
async function apiDeleteField(module: string, recordId: string, fieldName: string) {
    return del(`/vault/fields/${module}/${recordId}/${fieldName}`);
}
async function apiDisable() {
    return del('/vault/disable');
}

// ─── VaultService ─────────────────────────────────────────────────────────────

export const VaultService = {
    // Full setup flow: generate key, derive master key from mnemonic, wrap vault key,
    // store raw bytes in IndexedDB, save wrapped key to server, register biometric.
    // Returns the 12-word mnemonic for the user to write down.
    // PIN encrypts the raw vault key before IndexedDB storage.
    // IndexedDB never holds the raw key — wrong PIN = cryptographic failure.
    async setup(userId: string, pin: string): Promise<string> {
        const mnemonic = bip39.generateMnemonic();
        const vaultKey = await generateVaultKey();
        const rawKey = await exportVaultKeyRaw(vaultKey);

        // Wrap with mnemonic-derived master key → send to server (recovery path)
        const masterKey = await deriveMasterKey(mnemonic, userId);
        const encryptedVaultKey = await encryptVaultKey(vaultKey, masterKey);
        await apiSetup(encryptedVaultKey);

        // Wrap raw key with PIN key → store in IndexedDB (never the raw key)
        const pinKey = await derivePinKey(pin, userId);
        const pinBlob = await encryptRawWithPinKey(rawKey, pinKey);
        await storeVaultKey(pinBlob);

        // Import as non-extractable for the active session
        const sessionKey = await importVaultKeyRaw(rawKey);
        VaultSession.unlock(sessionKey);

        return mnemonic;
    },

    // PIN unlock: derive pinKey → decrypt IndexedDB blob → import session key.
    // Returns false if PIN is wrong (decryption throws) or no local key stored.
    async unlock(pin: string, userId: string): Promise<boolean> {
        try {
            const blob = await loadVaultKey();
            if (!blob) return false;
            const pinKey = await derivePinKey(pin, userId);
            const rawKey = await decryptRawWithPinKey(blob, pinKey);
            const sessionKey = await importVaultKeyRaw(rawKey);
            VaultSession.unlock(sessionKey);
            return true;
        } catch {
            return false; // wrong PIN → AES-GCM auth tag mismatch
        }
    },

    // Recovery: mnemonic decrypts the server-side blob → re-encrypt locally with new PIN.
    async recover(mnemonic: string, userId: string, pin: string): Promise<boolean> {
        try {
            const { encryptedVaultKey } = await apiGetEncryptedKey();
            if (!encryptedVaultKey) return false;
            const masterKey = await deriveMasterKey(mnemonic, userId);
            const rawKey = await decryptVaultKeyRaw(encryptedVaultKey, masterKey);

            // Protect with new PIN for this device
            const pinKey = await derivePinKey(pin, userId);
            const pinBlob = await encryptRawWithPinKey(rawKey, pinKey);
            await storeVaultKey(pinBlob);

            const sessionKey = await importVaultKeyRaw(rawKey);
            VaultSession.unlock(sessionKey);
            return true;
        } catch {
            return false;
        }
    },

    // Encrypt a field value and save it to the server.
    async encryptAndSave(
        module: string, recordId: string, fieldName: string, plaintext: string
    ): Promise<void> {
        const key = VaultSession.getKey();
        if (!key) throw new Error('Vault is locked');
        const { encryptedValue, iv } = await encryptField(plaintext, key);
        await apiUpsertField({ module, recordId, fieldName, encryptedValue, iv });
    },

    // Fetch a secure field from server and decrypt it locally.
    async loadAndDecrypt(
        module: string, recordId: string, fieldName: string
    ): Promise<string | null> {
        const key = VaultSession.getKey();
        if (!key) return null;
        try {
            const { fields } = await apiGetFields(module, recordId);
            const field = fields.find(f => f.fieldName === fieldName);
            if (!field) return null;
            return await decryptField(field.encryptedValue, field.iv, key);
        } catch {
            return null;
        }
    },

    async deleteField(module: string, recordId: string, fieldName: string): Promise<void> {
        await apiDeleteField(module, recordId, fieldName);
    },

    // Disable vault: removes all secure fields from server and clears local key.
    async disable(): Promise<void> {
        await apiDisable();
        await clearVaultKey();
        VaultSession.lock();
    },

    lock(): void {
        VaultSession.lock();
    },
};
