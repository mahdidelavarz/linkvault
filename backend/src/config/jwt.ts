import { loadEnv } from './env';

loadEnv();

const secret = process.env.JWT_SECRET;
if (!secret) {
    throw new Error('JWT_SECRET environment variable is required. Set it before starting the server.');
}

// REFRESH_TOKEN_SECRET is optional — required only when refresh-token endpoints are active
const refreshSecret = process.env.REFRESH_TOKEN_SECRET ?? '';

export const jwtConfig = {
    secret,
    expiresIn: (process.env.JWT_EXPIRES_IN || '24h') as string,
    refreshSecret,
    refreshExpiresIn: (process.env.REFRESH_TOKEN_EXPIRES_IN || '7d') as string,
};
