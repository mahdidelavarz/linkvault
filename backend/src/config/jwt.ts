import dotenv from 'dotenv';

dotenv.config();

export const jwtConfig = {
    secret: process.env.JWT_SECRET || 'your-fallback-secret-key-change-in-production',
    expiresIn: '24h' as const
};