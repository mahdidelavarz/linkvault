import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const ENC_PREFIX = 'enc:';

function getKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
        throw new Error('ENCRYPTION_KEY environment variable is required.');
    }
    // Always produce a 32-byte key regardless of input length
    return crypto.createHash('sha256').update(key).digest();
}

export function encrypt(text: string): string {
    if (!text) return text;
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    return `${ENC_PREFIX}${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decrypt(value: string): string {
    if (!value || !value.startsWith(ENC_PREFIX)) return value; // plain-text legacy record
    const rest = value.slice(ENC_PREFIX.length);
    const colonIdx = rest.indexOf(':');
    const iv = Buffer.from(rest.slice(0, colonIdx), 'hex');
    const encrypted = Buffer.from(rest.slice(colonIdx + 1), 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}
