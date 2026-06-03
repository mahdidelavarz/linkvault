import { loadEnv } from './env';

loadEnv();

const secret = process.env.JWT_SECRET;
if (!secret) {
    throw new Error('JWT_SECRET environment variable is required. Set it before starting the server.');
}

const refreshSecret = process.env.REFRESH_TOKEN_SECRET;
if (!refreshSecret) {
    throw new Error('REFRESH_TOKEN_SECRET environment variable is required. Set it before starting the server.');
}

export const jwtConfig = {
    secret,
    expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as string,
    refreshSecret,
    refreshExpiresIn: (process.env.REFRESH_TOKEN_EXPIRES_IN || '7d') as string,
};
