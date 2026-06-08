import { type ProjectItemType } from '@/types/project';

export interface TemplateItem {
    type: ProjectItemType;
    title: string;
    url?: string;
    content?: string;
    language?: string;
    infraType?: string;
    description?: string;
}

export interface ProjectTemplate {
    id: string;
    title: string;
    description: string;
    emoji: string;
    color: string;
    tags: string[];
    items: TemplateItem[];
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
    {
        id: 'jwt-auth',
        title: 'JWT Auth Setup',
        emoji: '🔐',
        color: 'cyan',
        description: 'Links, snippets, and notes for JWT-based authentication',
        tags: ['auth', 'security', 'jwt'],
        items: [
            { type: 'link', title: 'JWT.io Debugger', url: 'https://jwt.io', description: 'Decode, verify, and generate JWTs' },
            { type: 'link', title: 'jsonwebtoken npm', url: 'https://www.npmjs.com/package/jsonwebtoken', description: 'Popular JWT library for Node.js' },
            {
                type: 'snippet',
                title: 'Generate JWT token',
                language: 'typescript',
                content: `import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET!;

export function generateToken(payload: object, expiresIn = '7d') {
  return jwt.sign(payload, SECRET, { expiresIn });
}

export function verifyToken<T>(token: string): T {
  return jwt.verify(token, SECRET) as T;
}`,
            },
            {
                type: 'snippet',
                title: 'Auth middleware (Express)',
                language: 'typescript',
                content: `import { Request, Response, NextFunction } from 'express';
import { verifyToken } from './jwtUtils';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });
  try {
    req.user = verifyToken(auth.slice(7));
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}`,
            },
            {
                type: 'note',
                title: 'JWT Auth notes',
                content: `# JWT Authentication

## Key points
- Store tokens in **httpOnly cookies** (not localStorage) to prevent XSS
- Use short expiry for access tokens (15m–1h) + refresh tokens (7–30d)
- Never store sensitive data in the JWT payload — it's only base64 encoded, not encrypted
- Rotate refresh tokens on use (sliding window) to detect theft

## Common issues
- Clock skew: ensure server time is synced (NTP)
- RS256 vs HS256: use RS256 for multi-service architectures
- Revocation: JWTs can't be revoked; use a token blocklist or short expiry`,
            },
            {
                type: 'infrastructure',
                infraType: 'env',
                title: 'JWT env vars',
                content: `JWT_SECRET=change-me-in-production
JWT_EXPIRES_IN=7d
REFRESH_SECRET=change-me-in-production
REFRESH_EXPIRES_IN=30d`,
            },
        ],
    },
    {
        id: 'docker-compose',
        title: 'Docker Compose Stack',
        emoji: '🐳',
        color: 'purple',
        description: 'Docker Compose configs, commands, and references',
        tags: ['docker', 'devops', 'containers'],
        items: [
            { type: 'link', title: 'Docker Compose docs', url: 'https://docs.docker.com/compose/', description: 'Official Docker Compose reference' },
            { type: 'link', title: 'Docker Hub', url: 'https://hub.docker.com', description: 'Search for official images' },
            {
                type: 'snippet',
                title: 'docker-compose.yml starter',
                language: 'yaml',
                content: `version: '3.9'

services:
  app:
    build: .
    ports: ['3000:3000']
    env_file: .env
    depends_on: [db, redis]
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    volumes: [pgdata:/var/lib/postgresql/data]
    environment:
      POSTGRES_DB: \${POSTGRES_DB}
      POSTGRES_USER: \${POSTGRES_USER}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}

  redis:
    image: redis:7-alpine
    command: redis-server --save 60 1

volumes:
  pgdata:`,
            },
            {
                type: 'snippet',
                title: 'Common Docker commands',
                language: 'bash',
                content: `# Start all services
docker compose up -d

# Rebuild and start
docker compose up -d --build

# View logs (follow)
docker compose logs -f app

# Open shell in container
docker compose exec app sh

# Stop all services
docker compose down

# Remove volumes too
docker compose down -v`,
            },
            {
                type: 'infrastructure',
                infraType: 'env',
                title: 'Docker stack env',
                content: `POSTGRES_DB=myapp
POSTGRES_USER=admin
POSTGRES_PASSWORD=secret
REDIS_URL=redis://redis:6379`,
            },
        ],
    },
    {
        id: 'rest-api',
        title: 'REST API Boilerplate',
        emoji: '⚡',
        color: 'orange',
        description: 'API design resources, snippets, and endpoint templates',
        tags: ['api', 'http', 'rest', 'express'],
        items: [
            { type: 'link', title: 'HTTP Status Codes', url: 'https://httpstatuses.io', description: 'Quick reference for all HTTP status codes' },
            { type: 'link', title: 'REST API Best Practices', url: 'https://stackoverflow.blog/2020/03/02/best-practices-for-rest-api-design/', description: 'Naming, versioning, error handling' },
            {
                type: 'snippet',
                title: 'Express CRUD route template',
                language: 'typescript',
                content: `import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/',    authMiddleware, async (req, res) => {
  // list
  res.json({ items: [] });
});

router.post('/',   authMiddleware, async (req, res) => {
  // create
  res.status(201).json({ item: {} });
});

router.get('/:id', authMiddleware, async (req, res) => {
  // get one
  res.json({ item: {} });
});

router.put('/:id', authMiddleware, async (req, res) => {
  // update
  res.json({ item: {} });
});

router.delete('/:id', authMiddleware, async (req, res) => {
  // delete
  res.status(204).end();
});

export default router;`,
            },
            {
                type: 'snippet',
                title: 'Axios API client helper',
                language: 'typescript',
                content: `import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api',
  withCredentials: true,
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      // redirect to login
    }
    return Promise.reject(err);
  }
);

export default api;`,
            },
            {
                type: 'note',
                title: 'API design decisions',
                content: `# API Design Notes

## URL conventions
- Use plural nouns: \`/users\`, \`/posts\`
- Nest related resources: \`/users/:id/posts\`
- Version prefix: \`/api/v1/...\`

## Error format
\`\`\`json
{ "message": "Validation failed", "errors": { "field": "reason" } }
\`\`\`

## Status codes cheat sheet
| Code | Meaning |
|------|---------|
| 200  | OK |
| 201  | Created |
| 204  | No Content (delete) |
| 400  | Bad Request |
| 401  | Unauthorized |
| 403  | Forbidden |
| 404  | Not Found |
| 422  | Unprocessable Entity |
| 500  | Internal Server Error |`,
            },
        ],
    },
    {
        id: 'postgres-setup',
        title: 'PostgreSQL Setup',
        emoji: '🐘',
        color: 'green',
        description: 'Database snippets, queries, and config references',
        tags: ['database', 'postgresql', 'sql'],
        items: [
            { type: 'link', title: 'PostgreSQL docs', url: 'https://www.postgresql.org/docs/current/', description: 'Official PostgreSQL documentation' },
            { type: 'link', title: 'pgAdmin 4', url: 'https://www.pgadmin.org', description: 'GUI administration tool for PostgreSQL' },
            {
                type: 'snippet',
                title: 'TypeORM data source config',
                language: 'typescript',
                content: `import { DataSource } from 'typeorm';
import path from 'path';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [path.join(__dirname, '../entities/**/*.{ts,js}')],
  migrations: [path.join(__dirname, '../migrations/**/*.{ts,js}')],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});`,
            },
            {
                type: 'snippet',
                title: 'Common SQL queries',
                language: 'sql',
                content: `-- Check table sizes
SELECT relname AS table, pg_size_pretty(pg_total_relation_size(oid)) AS size
FROM pg_class WHERE relkind = 'r' ORDER BY pg_total_relation_size(oid) DESC;

-- Kill idle connections
SELECT pg_terminate_backend(pid) FROM pg_stat_activity
WHERE state = 'idle' AND query_start < NOW() - INTERVAL '30 minutes';

-- Index usage stats
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes ORDER BY idx_scan;`,
            },
            {
                type: 'infrastructure',
                infraType: 'database',
                title: 'Local PostgreSQL',
                content: `host=localhost
port=5432
database=myapp_dev
user=postgres
password=password`,
            },
        ],
    },
    {
        id: 'ci-cd',
        title: 'CI/CD Pipeline',
        emoji: '🚀',
        color: 'yellow',
        description: 'GitHub Actions workflows, deployment scripts, and references',
        tags: ['ci', 'cd', 'github-actions', 'devops'],
        items: [
            { type: 'link', title: 'GitHub Actions docs', url: 'https://docs.github.com/en/actions', description: 'Official GitHub Actions documentation' },
            { type: 'link', title: 'act (run actions locally)', url: 'https://github.com/nektos/act', description: 'Run GitHub Actions workflows locally' },
            {
                type: 'snippet',
                title: 'Node.js CI workflow',
                language: 'yaml',
                content: `name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - run: npm test`,
            },
            {
                type: 'note',
                title: 'Deployment checklist',
                content: `# Deployment Checklist

## Before deploy
- [ ] All tests passing in CI
- [ ] Environment variables set in target environment
- [ ] Database migrations reviewed
- [ ] Changelog / release notes written

## During deploy
- [ ] Enable maintenance mode if needed
- [ ] Run migrations: \`npm run migration:run\`
- [ ] Deploy application
- [ ] Health check endpoint responding

## After deploy
- [ ] Smoke test critical user flows
- [ ] Monitor error rates for 15 minutes
- [ ] Notify team in #deployments`,
            },
        ],
    },
];
