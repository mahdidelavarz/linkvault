'use client';

// In-memory vault session. vaultKey never touches localStorage or sessionStorage.
// Auto-lock rules (non-negotiable per security spec):
//   1. Inactivity: 5 minutes since last getKey() call
//   2. Tab hidden (document.visibilitychange) — critical for PWA mobile

const INACTIVITY_MS = 5 * 60 * 1000;

let _key: CryptoKey | null = null;
let _timer: ReturnType<typeof setTimeout> | null = null;
let _lockListeners: (() => void)[] = [];

function resetTimer() {
    if (_timer) clearTimeout(_timer);
    _timer = setTimeout(() => VaultSession.lock(), INACTIVITY_MS);
}

function setupVisibilityLock() {
    if (typeof document === 'undefined') return;
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) VaultSession.lock();
    });
}

// Wire up visibility lock once on module load (client-side only)
if (typeof document !== 'undefined') {
    setupVisibilityLock();
}

export const VaultSession = {
    unlock(key: CryptoKey): void {
        _key = key;
        resetTimer();
        _lockListeners.forEach(fn => fn());
    },

    getKey(): CryptoKey | null {
        if (!_key) return null;
        resetTimer();  // every access resets inactivity timer
        return _key;
    },

    lock(): void {
        _key = null;
        if (_timer) { clearTimeout(_timer); _timer = null; }
        _lockListeners.forEach(fn => fn());
    },

    isUnlocked(): boolean {
        return _key !== null;
    },

    // Subscribe to lock/unlock state changes (for React hook reactivity)
    subscribe(listener: () => void): () => void {
        _lockListeners.push(listener);
        return () => { _lockListeners = _lockListeners.filter(fn => fn !== listener); };
    },
};
