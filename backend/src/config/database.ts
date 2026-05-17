import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'mssql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '1433'),
    username: process.env.DB_USERNAME || 'node-user',
    password: process.env.DB_PASSWORD || '123',
    database: process.env.DB_NAME || 'LinkVault',
    synchronize: true,
    logging: true,
    entities: [path.join(__dirname, '../entities/**/*.{ts,js}')],
    migrations: [path.join(__dirname, '../migrations/**/*.{ts,js}')],
    subscribers: [],
    options: {
        encrypt: false,
        trustServerCertificate: true 
    }
});