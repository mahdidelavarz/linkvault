import { loadEnv } from './env';

loadEnv();

const secret = process.env.JWT_SECRET;
if (!secret) {
    throw new Error('JWT_SECRET environment variable is required. Set it before starting the server.');
}

export const jwtConfig = {
    secret,
    expiresIn: (process.env.JWT_EXPIRES_IN || '24h') as string
};