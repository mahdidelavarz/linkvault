'use client';

// WebAuthn platform authenticator — FaceID / Fingerprint.
// Requires HTTPS. In dev, test biometric flows only in production or with a local HTTPS cert.

const CREDENTIAL_ID_KEY = 'vault_credential_id';
const RP_ID = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

function b642buf(b64: string): ArrayBuffer {
    const bin = atob(b64);
    const buf = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    return buf.buffer;
}

function buf2b64url(buf: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(buf)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export async function isBiometricAvailable(): Promise<boolean> {
    try {
        if (!window.PublicKeyCredential) return false;
        return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
        return false;
    }
}

export async function registerBiometric(): Promise<void> {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const userId = crypto.getRandomValues(new Uint8Array(16));

    const credential = await navigator.credentials.create({
        publicKey: {
            challenge,
            rp: { name: 'NeoVault', id: RP_ID },
            user: { id: userId, name: 'vault-user', displayName: 'Vault User' },
            pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
            authenticatorSelection: {
                authenticatorAttachment: 'platform',
                userVerification: 'required',
            },
            timeout: 60000,
        },
    }) as PublicKeyCredential | null;

    if (!credential) throw new Error('Biometric registration cancelled');
    localStorage.setItem(CREDENTIAL_ID_KEY, buf2b64url(credential.rawId));
}

export async function verifyBiometric(): Promise<boolean> {
    const credIdB64 = localStorage.getItem(CREDENTIAL_ID_KEY);
    if (!credIdB64) return false;

    try {
        // Convert base64url back to ArrayBuffer
        const credId = b642buf(credIdB64.replace(/-/g, '+').replace(/_/g, '/'));
        const challenge = crypto.getRandomValues(new Uint8Array(32));

        const assertion = await navigator.credentials.get({
            publicKey: {
                challenge,
                rpId: RP_ID,
                allowCredentials: [{ type: 'public-key', id: credId }],
                userVerification: 'required',  // rule #6 — never fall back to 'preferred'
                timeout: 60000,
            },
        });

        return assertion !== null;
    } catch {
        return false;
    }
}
