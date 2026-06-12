// Pattern-based secret detection for inline vault prompts.
// Returns a description of what was detected, or null if not a secret.

const PATTERNS: { label: string; test: (v: string) => boolean }[] = [
    { label: 'JWT token',      test: v => /^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(v.trim()) },
    { label: 'AWS access key', test: v => /AKIA[0-9A-Z]{16}/.test(v) },
    { label: 'private key',    test: v => v.trim().startsWith('-----BEGIN') },
    { label: 'bearer token',   test: v => /^(Bearer\s+)?[A-Za-z0-9\-_.~+/]{40,}$/.test(v.trim()) && v.length > 40 },
];

// Variable name patterns — checked against the field label or input name
const NAME_PATTERNS = /(_SECRET|_KEY|_TOKEN|_PASSWORD|_API_KEY|_APIKEY)$/i;

export function detectSecret(value: string, fieldName?: string): string | null {
    if (!value || value.length < 8) return null;

    // Check value patterns first
    for (const p of PATTERNS) {
        if (p.test(value)) return p.label;
    }

    // Check field name patterns (if value is non-trivial)
    if (fieldName && value.length >= 8 && NAME_PATTERNS.test(fieldName)) {
        return 'sensitive value';
    }

    return null;
}
