'use client';

import { openDB } from 'idb';

const DB_NAME = 'SecureVaultDB';
const STORE_NAME = 'keys';
const KEY_RECORD = 'vaultKey';

async function getDb() {
    return openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        },
    });
}

// Store raw vault key bytes in IndexedDB before importing as non-extractable.
// IndexedDB access = vault key access; biometric is an app-level gate, not a crypto wrapper.
export async function storeVaultKey(keyData: ArrayBuffer): Promise<void> {
    const db = await getDb();
    await db.put(STORE_NAME, keyData, KEY_RECORD);
}

export async function loadVaultKey(): Promise<ArrayBuffer | null> {
    const db = await getDb();
    return (await db.get(STORE_NAME, KEY_RECORD)) ?? null;
}

export async function clearVaultKey(): Promise<void> {
    const db = await getDb();
    await db.delete(STORE_NAME, KEY_RECORD);
}
