import { DataSource } from 'typeorm';
import path from 'path';
import { loadEnv } from './env';

loadEnv();

const isDev = process.env.NODE_ENV === 'development';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'node_user',
    password: process.env.DB_PASSWORD || '123',
    database: process.env.DB_DATABASE || 'linkvault',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true' || (process.env.DB_LOGGING !== 'false' && isDev),
    entities: [path.join(__dirname, '../entities/**/*.{ts,js}')],
    migrations: [path.join(__dirname, '../migrations/**/*.{ts,js}')],
    subscribers: [],
});
