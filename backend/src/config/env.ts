import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const root = path.resolve(__dirname, '../../..');

export function loadEnv() {
    dotenv.config({ path: path.join(root, '.env') });

    const localPath = path.join(root, '.env.local');
    if (fs.existsSync(localPath)) {
        dotenv.config({ path: localPath, override: true });
    }
}
