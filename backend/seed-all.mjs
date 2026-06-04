// Run: node seed-all.mjs
// Creates test data for all modules except links.

const BASE = 'http://localhost:5000/api';
const USERNAME = 'osis13';
const PASSWORD = '123456789Mh';

// ─── Login ────────────────────────────────────────────────────────────────────

async function login() {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: USERNAME, password: PASSWORD }),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(`Login failed: ${e.message}`); }
  const data = await res.json();
  const token = data.token ?? data.accessToken;
  console.log('✓ Logged in\n');
  return token;
}

async function post(token, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(`POST ${path} failed: ${e.message ?? res.status}`);
  }
  return res.json();
}

async function seed(token, label, path, items) {
  console.log(`Creating ${items.length} ${label}…`);
  let ok = 0;
  for (const item of items) {
    try { await post(token, path, item); ok++; process.stdout.write('.'); }
    catch (e) { process.stdout.write('x'); }
  }
  console.log(`  ${ok}/${items.length} created\n`);
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { name: 'Development' },
  { name: 'DevOps' },
  { name: 'AI & ML' },
  { name: 'Personal' },
  { name: 'Work' },
];

const TAGS = [
  { name: 'important' },
  { name: 'reference' },
  { name: 'todo' },
  { name: 'python' },
  { name: 'javascript' },
  { name: 'docker' },
  { name: 'sql' },
  { name: 'ai' },
];

const NOTES = [
  {
    title: 'Project Architecture Notes',
    content: '# Architecture Overview\n\nThe project follows a clean layered architecture:\n\n## Backend\n- **Route** → Controller → Service → Repository\n- TypeORM for database access\n- PostgreSQL as the database\n\n## Frontend\n- Next.js 15 with App Router\n- TanStack Query for server state\n- Zustand for client state\n\n## Key Decisions\n- JWT for authentication\n- AES-256 encryption for sensitive fields\n- Infinite scroll pagination (20 items per page)',
    isPinned: true,
  },
  {
    title: 'Meeting Notes — Sprint Review',
    content: '## Sprint Review — Week 24\n\n**Attendees:** Team lead, 3 devs, QA\n\n### Completed\n- Pagination across all modules\n- Bulk actions for links\n- Dashboard redesign\n- Password reset flow\n\n### Blocked\n- Mobile push notifications (waiting on cert)\n- Export feature (design pending)\n\n### Next Sprint Goals\n1. Drag-and-drop reordering\n2. Sort controls\n3. Tag filter UI',
    isPinned: false,
  },
  {
    title: 'Ideas — New Features',
    content: '## Feature Ideas\n\n### High Priority\n- [ ] Bulk actions on all modules\n- [ ] Sort controls (newest/oldest/A-Z)\n- [ ] Tag filter in UI\n\n### Medium Priority\n- [ ] OG image thumbnails\n- [ ] Grid density toggle\n- [ ] URL duplicate detection\n\n### Nice to Have\n- [ ] Dead link detection\n- [ ] Import/export bookmarks\n- [ ] Inline quick-edit',
    isPinned: true,
  },
  {
    title: 'Learning — TypeORM Tips',
    content: '# TypeORM Best Practices\n\n## Avoid N+1 Queries\nAlways use `WHERE IN` instead of looping:\n```typescript\nconst taggables = await repo.find({\n  where: { taggableId: In(ids), taggableType: "link" },\n  relations: ["tag"],\n});\n```\n\n## Use QueryBuilder for Complex Queries\nPrefer `createQueryBuilder` with `getManyAndCount()` for pagination.\n\n## Indexes\nAlways add `@Index()` on FK columns and columns used in WHERE clauses.',
    isPinned: false,
  },
  {
    title: 'Daily Standup Template',
    content: '## Daily Standup\n\n**Date:** {DATE}\n\n### Yesterday\n- \n\n### Today\n- \n\n### Blockers\n- None\n\n---\n*Keep it under 5 minutes!*',
    isPinned: false,
  },
  {
    title: 'PostgreSQL Performance Notes',
    content: '# PostgreSQL Performance\n\n## Indexes\n- B-tree: default, good for =, <, >, BETWEEN\n- GIN: good for LIKE with pg_trgm, JSON, arrays\n- Use `CREATE INDEX CONCURRENTLY` in production\n\n## Query Analysis\n```sql\nEXPLAIN ANALYZE SELECT * FROM links WHERE user_id = 1;\n```\n\n## pg_trgm for LIKE Search\n```sql\nCREATE EXTENSION IF NOT EXISTS pg_trgm;\nCREATE INDEX idx_links_title ON links USING GIN (title gin_trgm_ops);\n```',
    isPinned: false,
  },
  {
    title: 'Book Notes — Clean Code',
    content: '# Clean Code — Robert C. Martin\n\n## Key Principles\n\n1. **Meaningful Names** — Names should reveal intent\n2. **Small Functions** — Functions should do one thing\n3. **No Comments** — Code should be self-documenting\n4. **DRY** — Don\'t Repeat Yourself\n5. **SOLID** — Single responsibility, Open/closed, etc.\n\n## Favourite Quote\n> "Clean code is not written by following a set of rules. You don\'t become a software craftsman by learning a list of heuristics. Professionalism and craftsmanship come from values that drive disciplines."',
    isPinned: false,
  },
  {
    title: 'API Design Checklist',
    content: '# REST API Checklist\n\n## Naming\n- [ ] Use nouns, not verbs (`/users` not `/getUsers`)\n- [ ] Plural resource names\n- [ ] Consistent casing (kebab-case)\n\n## Responses\n- [ ] Consistent envelope shape\n- [ ] Proper HTTP status codes\n- [ ] Pagination for list endpoints\n\n## Security\n- [ ] Authentication on all private routes\n- [ ] Input validation (Zod/class-validator)\n- [ ] Rate limiting on auth endpoints\n\n## Performance\n- [ ] DB indexes on FK columns\n- [ ] Avoid N+1 queries\n- [ ] Response compression',
    isPinned: false,
  },
  {
    title: 'Deployment Checklist',
    content: '# Production Deployment Checklist\n\n## Before Deploy\n- [ ] All tests passing\n- [ ] Environment variables set\n- [ ] DB migrations run\n- [ ] `.env` secrets not committed\n\n## Security\n- [ ] JWT_SECRET is strong (32+ chars)\n- [ ] DB password is strong\n- [ ] CORS origins restricted\n- [ ] Rate limiting enabled\n\n## After Deploy\n- [ ] Health check endpoint responding\n- [ ] Logs showing no errors\n- [ ] Database connected\n- [ ] Email (SMTP) working',
    isPinned: false,
  },
  {
    title: 'Git Workflow Notes',
    content: '# Git Workflow\n\n## Branch Naming\n- `feature/short-description`\n- `fix/bug-description`\n- `chore/task-description`\n\n## Commit Messages\nFollow conventional commits:\n```\nfeat: add pagination to all list endpoints\nfix: correct JWT secret fallback bug\nchore: update dependencies\n```\n\n## PR Process\n1. Create feature branch from `main`\n2. Make changes, commit frequently\n3. Push branch, open PR\n4. Request review\n5. Squash and merge',
    isPinned: false,
  },
];

const SNIPPETS = [
  {
    title: 'Async Error Handler (Express)',
    content: `import { Request, Response, NextFunction } from 'express';

export const asyncHandler = (fn: Function) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };`,
    language: 'ts',
    snippetType: 'code',
    description: 'Wraps async Express handlers to forward errors to the global error middleware.',
    isFavorite: true,
  },
  {
    title: 'Debounce Hook (React)',
    content: `import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay = 500): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}`,
    language: 'tsx',
    snippetType: 'code',
    description: 'Returns a debounced version of the given value.',
    isFavorite: true,
  },
  {
    title: 'Paginate TypeORM Query',
    content: `async function paginateQuery<T>(
  qb: SelectQueryBuilder<T>,
  page: number,
  limit: number
) {
  const skip = (page - 1) * limit;
  const [items, total] = await qb.skip(skip).take(limit).getManyAndCount();
  return { items, total, page, limit, hasMore: skip + items.length < total };
}`,
    language: 'ts',
    snippetType: 'code',
    description: 'Generic pagination helper for TypeORM QueryBuilder.',
    isFavorite: false,
  },
  {
    title: 'Docker Compose — Node + Postgres',
    content: `version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    env_file: .env
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: \${DB_USERNAME}
      POSTGRES_PASSWORD: \${DB_PASSWORD}
      POSTGRES_DB: \${DB_DATABASE}
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${DB_USERNAME}"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:`,
    language: 'yaml',
    snippetType: 'config',
    description: 'Docker Compose for a Node.js API with PostgreSQL.',
    isFavorite: true,
  },
  {
    title: 'SQL — Bulk Upsert',
    content: `INSERT INTO user_preferences (user_id, key, value, updated_at)
VALUES
  (1, 'theme', 'dark', NOW()),
  (1, 'lang',  'en',   NOW()),
  (2, 'theme', 'light', NOW())
ON CONFLICT (user_id, key)
DO UPDATE SET
  value      = EXCLUDED.value,
  updated_at = EXCLUDED.updated_at;`,
    language: 'sql',
    snippetType: 'code',
    description: 'PostgreSQL upsert using ON CONFLICT DO UPDATE.',
    isFavorite: false,
  },
  {
    title: 'useIntersectionObserver Hook',
    content: `import { useEffect, useRef } from 'react';

export function useIntersectionObserver(
  callback: () => void,
  active: boolean
) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!active || !ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) callback(); },
      { threshold: 0.1 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [callback, active]);
  return ref;
}`,
    language: 'tsx',
    snippetType: 'code',
    description: 'Hook that calls a callback when a sentinel element enters the viewport (infinite scroll).',
    isFavorite: false,
  },
  {
    title: 'AES-256 Encrypt / Decrypt',
    content: `import crypto from 'crypto';

const ALGO = 'aes-256-cbc';
const getKey = (secret: string) =>
  crypto.createHash('sha256').update(secret).digest();

export function encrypt(text: string, secret: string): string {
  const iv  = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGO, getKey(secret), iv);
  return \`enc:\${iv.toString('hex')}:\${Buffer.concat([
    cipher.update(text, 'utf8'), cipher.final()
  ]).toString('hex')}\`;
}

export function decrypt(value: string, secret: string): string {
  if (!value.startsWith('enc:')) return value;
  const [, ivHex, encHex] = value.split(':');
  const decipher = crypto.createDecipheriv(ALGO, getKey(secret), Buffer.from(ivHex, 'hex'));
  return Buffer.concat([
    decipher.update(Buffer.from(encHex, 'hex')), decipher.final()
  ]).toString('utf8');
}`,
    language: 'ts',
    snippetType: 'code',
    description: 'AES-256-CBC encrypt/decrypt using Node.js crypto (no external deps).',
    isFavorite: true,
  },
  {
    title: 'Nginx Reverse Proxy Config',
    content: `server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass         http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}`,
    language: 'txt',
    snippetType: 'config',
    description: 'Nginx config to reverse-proxy a Node.js API on port 5000.',
    isFavorite: false,
  },
  {
    title: 'Python — Retry Decorator',
    content: `import time
import functools

def retry(max_attempts=3, delay=1.0, exceptions=(Exception,)):
    def decorator(fn):
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            for attempt in range(1, max_attempts + 1):
                try:
                    return fn(*args, **kwargs)
                except exceptions as e:
                    if attempt == max_attempts:
                        raise
                    time.sleep(delay * attempt)
        return wrapper
    return decorator

@retry(max_attempts=3, delay=0.5)
def fetch_data(url: str):
    ...`,
    language: 'py',
    snippetType: 'code',
    description: 'Retry decorator with exponential back-off.',
    isFavorite: false,
  },
  {
    title: 'Bash — Deploy Script',
    content: `#!/bin/bash
set -euo pipefail

APP="my-app"
REMOTE="deploy@example.com"
DIR="/opt/$APP"

echo "Building…"
npm run build

echo "Uploading…"
rsync -az --delete dist/ "$REMOTE:$DIR/dist"
rsync -az package.json package-lock.json "$REMOTE:$DIR/"

echo "Restarting service…"
ssh "$REMOTE" "cd $DIR && npm ci --omit=dev && pm2 restart $APP"

echo "Done ✓"`,
    language: 'bash',
    snippetType: 'code',
    description: 'Simple deploy script: build, rsync to server, restart PM2.',
    isFavorite: false,
  },
];

const PROMPTS = [
  {
    title: 'Code Review — TypeScript',
    content: `Review the following TypeScript code for:
1. Type safety issues
2. Performance bottlenecks
3. Code smells and anti-patterns
4. Missing error handling
5. Security vulnerabilities

Code to review:
\`\`\`typescript
{{code}}
\`\`\`

Provide specific line-by-line feedback with severity (critical/warning/suggestion) and a corrected version for each issue.`,
    description: 'Comprehensive TypeScript code review with severity ratings.',
    promptType: 'coding',
    targetAI: 'claude',
    isFavorite: true,
  },
  {
    title: 'SQL Query Optimizer',
    content: `Analyze and optimize this SQL query for PostgreSQL performance:

\`\`\`sql
{{query}}
\`\`\`

Table schema:
\`\`\`sql
{{schema}}
\`\`\`

Provide:
1. EXPLAIN ANALYZE interpretation
2. Optimized query with reasoning
3. Recommended indexes
4. Alternative approaches if applicable`,
    description: 'Optimize slow PostgreSQL queries with index recommendations.',
    promptType: 'coding',
    targetAI: 'gpt-4',
    isFavorite: false,
  },
  {
    title: 'Technical Blog Post',
    content: `Write a technical blog post about {{topic}} for an audience of intermediate to senior software engineers.

Requirements:
- Title that's engaging but not clickbait
- ~800-1200 words
- Include practical code examples in {{language}}
- Cover common pitfalls and how to avoid them
- End with a clear takeaway/summary

Tone: professional but conversational, like a senior engineer sharing knowledge.`,
    description: 'Generate technical blog posts with code examples.',
    promptType: 'writing',
    targetAI: 'claude',
    isFavorite: true,
  },
  {
    title: 'System Design Interview',
    content: `You are a senior staff engineer. I want to practice system design for: {{system_name}}

Walk me through:
1. Requirements clarification (functional + non-functional)
2. Capacity estimation (storage, throughput, latency)
3. High-level design with component diagram
4. Deep dive into the most critical component
5. Common failure modes and how to handle them
6. Trade-offs in your design decisions

After the design, give me 3 follow-up questions a real interviewer would ask.`,
    description: 'Interactive system design practice with an expert interviewer.',
    promptType: 'ai-chat',
    targetAI: 'claude',
    isFavorite: false,
  },
  {
    title: 'API Documentation Generator',
    content: `Generate OpenAPI 3.0 documentation for this Express.js route:

\`\`\`typescript
{{route_code}}
\`\`\`

Include:
- Summary and description
- Request body schema with examples
- All possible response codes (200, 400, 401, 404, 500)
- Response body schemas
- Security requirements

Output as valid YAML.`,
    description: 'Auto-generate OpenAPI docs from Express route code.',
    promptType: 'coding',
    targetAI: 'gpt-4',
    isFavorite: false,
  },
  {
    title: 'Bug Report Template',
    content: `I have a bug in my {{language}} application. Help me debug it.

**Error message:**
\`\`\`
{{error}}
\`\`\`

**Relevant code:**
\`\`\`{{language}}
{{code}}
\`\`\`

**What I expected:** {{expected}}
**What actually happened:** {{actual}}
**Steps to reproduce:** {{steps}}

Please:
1. Identify the root cause
2. Explain why this error occurs
3. Provide a corrected code snippet
4. Suggest how to prevent similar bugs`,
    description: 'Structured bug debugging with root cause analysis.',
    promptType: 'coding',
    targetAI: 'claude',
    isFavorite: true,
  },
  {
    title: 'Regex Generator',
    content: `Generate a regular expression for the following requirement:

**What to match:** {{description}}

**Examples that should match:**
{{match_examples}}

**Examples that should NOT match:**
{{non_match_examples}}

**Language/flavor:** {{language}}

Provide:
1. The regex pattern
2. Step-by-step explanation of each part
3. Edge cases to be aware of
4. Code snippet showing usage`,
    description: 'Generate and explain regex patterns from plain English descriptions.',
    promptType: 'coding',
    targetAI: 'gpt-4',
    isFavorite: false,
  },
  {
    title: 'Database Schema Design',
    content: `Design a PostgreSQL database schema for: {{application_description}}

Requirements:
- {{requirement_1}}
- {{requirement_2}}
- {{requirement_3}}

Provide:
1. Entity-Relationship diagram (text-based)
2. Full CREATE TABLE statements with proper types and constraints
3. Indexes for common query patterns
4. Explanation of key design decisions
5. Potential scaling considerations`,
    description: 'Design normalized PostgreSQL schemas from requirements.',
    promptType: 'coding',
    targetAI: 'claude',
    isFavorite: false,
  },
  {
    title: 'PR Review Comment',
    content: `I need to write a constructive pull request review comment for this change:

**Change description:** {{description}}

**Code diff:**
\`\`\`diff
{{diff}}
\`\`\`

**Context:** This is a {{team_size}} team and the author is a {{seniority}} developer.

Write a review comment that is:
- Specific and actionable
- Kind and constructive (not critical/harsh)
- Explains the WHY behind the suggestion
- Includes a code suggestion if applicable

Severity level: {{severity}} (blocking / non-blocking / nitpick)`,
    description: 'Write kind, constructive PR review comments with context.',
    promptType: 'writing',
    targetAI: 'claude',
    isFavorite: false,
  },
  {
    title: 'Explain Like I\'m 5',
    content: `Explain {{concept}} to me as if I'm completely new to programming.

Use:
- Simple everyday analogies (no jargon)
- A real-world example I can relate to
- Maximum 3 short paragraphs
- A one-sentence summary at the end

Then, once I understand the basics, briefly explain why this concept matters for building real software.`,
    description: 'Get beginner-friendly explanations for complex technical concepts.',
    promptType: 'ai-chat',
    targetAI: 'claude',
    isFavorite: true,
  },
];

const INFRA = [
  {
    title: 'Production Database',
    infraType: 'database',
    content: `host: db.prod.example.com
port: 5432
database: linkvault_prod
user: linkvault_app
ssl: true
pool_min: 5
pool_max: 20`,
    description: 'Primary PostgreSQL instance for production.',
    isFavorite: true,
    metadata: { host: 'db.prod.example.com', port: 5432 },
  },
  {
    title: 'Development ENV',
    infraType: 'env',
    content: `NODE_ENV=development
PORT=5000
HOST=0.0.0.0
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=node_user
DB_PASSWORD=changeme
DB_DATABASE=linkvault
DB_SYNCHRONIZE=true
JWT_SECRET=dev_super_secret_key_change_in_prod
ENCRYPTION_KEY=32_character_secret_key_here!!`,
    description: 'Local development environment variables.',
    isFavorite: false,
  },
  {
    title: 'Production ENV',
    infraType: 'env',
    content: `NODE_ENV=production
PORT=5000
HOST=0.0.0.0
DB_HOST=db.prod.example.com
DB_PORT=5432
DB_USERNAME=linkvault_app
DB_PASSWORD=<strong-password-here>
DB_DATABASE=linkvault_prod
DB_SYNCHRONIZE=false
JWT_SECRET=<minimum-32-char-random-secret>
REFRESH_TOKEN_SECRET=<another-32-char-secret>
ENCRYPTION_KEY=<32-char-encryption-key>
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=<app-password>
FRONTEND_URL=https://yourdomain.com`,
    description: 'Production environment — replace all placeholder values.',
    isFavorite: true,
  },
  {
    title: 'API Server — EU West',
    infraType: 'server',
    content: `# Connection
ssh deploy@api.eu-west.example.com -p 22 -i ~/.ssh/deploy_key

# Server specs
OS: Ubuntu 22.04 LTS
RAM: 4GB
CPU: 2 vCPU
Disk: 40GB SSD
Region: eu-west-1

# Services running
- PM2: linkvault-api (port 5000)
- Nginx: reverse proxy (ports 80/443)
- Certbot: SSL certificates

# Useful commands
pm2 logs linkvault-api
pm2 restart linkvault-api
nginx -t && systemctl reload nginx`,
    description: 'Primary API server in EU West.',
    isFavorite: false,
    metadata: { host: 'api.eu-west.example.com', port: 22 },
  },
  {
    title: 'App Docker Compose',
    infraType: 'docker',
    content: `version: '3.8'

services:
  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: unless-stopped
    ports:
      - "5000:5000"
    env_file: .env
    depends_on:
      db:
        condition: service_healthy
    networks:
      - app-network

  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: \${DB_USERNAME}
      POSTGRES_PASSWORD: \${DB_PASSWORD}
      POSTGRES_DB: \${DB_DATABASE}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${DB_USERNAME}"]
      interval: 5s
      retries: 5
    networks:
      - app-network

volumes:
  pgdata:

networks:
  app-network:
    driver: bridge`,
    description: 'Full-stack Docker Compose for production.',
    isFavorite: true,
  },
  {
    title: 'Deploy to Production',
    infraType: 'deployment',
    content: `# 1. Build frontend
cd frontend && npm run build

# 2. Build backend
cd backend && npm run build

# 3. Run database migrations
npm run migration:run

# 4. Upload to server
rsync -az --delete backend/dist/ deploy@server:/opt/app/dist/
rsync -az backend/package*.json deploy@server:/opt/app/

# 5. Install production deps
ssh deploy@server "cd /opt/app && npm ci --omit=dev"

# 6. Restart service
ssh deploy@server "pm2 restart linkvault-api"

# 7. Verify
curl https://api.example.com/api/health`,
    description: 'Step-by-step production deployment script.',
    isFavorite: false,
  },
  {
    title: 'Internal Network Config',
    infraType: 'network',
    content: `# Internal Network
Subnet: 10.0.1.0/24
Gateway: 10.0.1.1
DNS: 10.0.1.53, 8.8.8.8

# Servers
api-01:     10.0.1.10
api-02:     10.0.1.11
db-primary: 10.0.1.20
db-replica: 10.0.1.21
redis:      10.0.1.30
nginx-lb:   10.0.1.5

# Firewall rules
- Allow 443/tcp from 0.0.0.0/0 to nginx-lb
- Allow 5000/tcp from 10.0.1.0/24 to api-*
- Allow 5432/tcp from 10.0.1.10-11 to db-*
- Deny all other inbound`,
    description: 'Production network topology and firewall rules.',
    isFavorite: false,
  },
  {
    title: 'Backup Database',
    infraType: 'server',
    content: `# Backup replica
ssh backup@db-replica.internal

# Manual backup
pg_dump -h localhost -U linkvault_app linkvault_prod \
  --format=custom \
  --file=/backups/linkvault_$(date +%Y%m%d_%H%M%S).dump

# Automated daily backup cron
0 2 * * * pg_dump -h localhost -U linkvault_app linkvault_prod \
  --format=custom \
  --file=/backups/linkvault_$(date +%Y%m%d).dump \
  && find /backups -mtime +30 -delete

# Restore from backup
pg_restore -h localhost -U linkvault_app -d linkvault_prod \
  --clean --if-exists /backups/linkvault_20260101.dump`,
    description: 'Database backup server and restore procedures.',
    isFavorite: false,
  },
  {
    title: 'Redis Cache',
    infraType: 'database',
    content: `host: redis.internal
port: 6379
password: <redis-auth-token>
database: 0

# Key namespaces
dashboard:{userId}  → TTL 5min  (cached stats)
session:{token}     → TTL 7d    (refresh tokens)
ratelimit:{ip}      → TTL 15min (rate limiting)

# Connection string
redis://:password@redis.internal:6379/0

# CLI access
redis-cli -h redis.internal -a <password>`,
    description: 'Redis instance for caching and session storage.',
    isFavorite: false,
    metadata: { host: 'redis.internal', port: 6379 },
  },
  {
    title: 'CI/CD Pipeline',
    infraType: 'deployment',
    content: `# GitHub Actions — .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install & Build
        run: |
          cd backend && npm ci && npm run build
          cd ../frontend && npm ci && npm run build

      - name: Run migrations
        env:
          DATABASE_URL: \${{ secrets.DATABASE_URL }}
        run: cd backend && npm run migration:run

      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: \${{ secrets.DEPLOY_HOST }}
          username: deploy
          key: \${{ secrets.DEPLOY_KEY }}
          script: |
            cd /opt/app
            git pull origin main
            npm ci --omit=dev
            pm2 restart linkvault-api`,
    description: 'GitHub Actions CI/CD pipeline for automated deployments.',
    isFavorite: true,
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const token = await login();

  // Categories first
  console.log('Creating 5 categories…');
  const catIds = {};
  for (const cat of CATEGORIES) {
    try {
      const { category } = await post(token, '/categories', cat);
      catIds[cat.name] = category.id;
      process.stdout.write('.');
    } catch { process.stdout.write('x'); }
  }
  console.log(`  done\n`);

  // Tags
  console.log('Creating 8 tags…');
  const tagIds = {};
  for (const tag of TAGS) {
    try {
      const { tag: t } = await post(token, '/tags', tag);
      tagIds[tag.name] = t.id;
      process.stdout.write('.');
    } catch { process.stdout.write('x'); }
  }
  console.log(`  done\n`);

  // Notes — attach some categories/tags
  const notesWithMeta = NOTES.map((n, i) => ({
    ...n,
    categoryId: i < 4 ? catIds['Development'] : i < 7 ? catIds['Work'] : catIds['Personal'],
    tagIds: i % 3 === 0
      ? [tagIds['important'], tagIds['reference']].filter(Boolean)
      : i % 3 === 1
        ? [tagIds['todo']].filter(Boolean)
        : [],
  }));
  await seed(token, 'notes', '/notes', notesWithMeta);

  // Snippets
  const snippetsWithMeta = SNIPPETS.map((s, i) => ({
    ...s,
    categoryId: i < 5 ? catIds['Development'] : catIds['DevOps'],
    tagIds: s.language === 'ts' || s.language === 'tsx'
      ? [tagIds['javascript'], tagIds['reference']].filter(Boolean)
      : s.language === 'py'
        ? [tagIds['python']].filter(Boolean)
        : s.language === 'sql'
          ? [tagIds['sql']].filter(Boolean)
          : [],
  }));
  await seed(token, 'snippets', '/snippets', snippetsWithMeta);

  // Prompts
  const promptsWithMeta = PROMPTS.map((p, i) => ({
    ...p,
    categoryId: i < 5 ? catIds['AI & ML'] : catIds['Development'],
    tagIds: p.promptType === 'coding'
      ? [tagIds['reference']].filter(Boolean)
      : [tagIds['ai']].filter(Boolean),
  }));
  await seed(token, 'prompts', '/prompts', promptsWithMeta);

  // Infrastructure
  const infraWithMeta = INFRA.map((item, i) => ({
    ...item,
    categoryId: item.infraType === 'env' || item.infraType === 'deployment'
      ? catIds['DevOps']
      : item.infraType === 'database'
        ? catIds['Development']
        : catIds['DevOps'],
    tagIds: item.isFavorite ? [tagIds['important']].filter(Boolean) : [],
  }));
  await seed(token, 'infrastructure', '/infrastructure', infraWithMeta);

  console.log('✅ All test data created successfully!');
}

main().catch((err) => { console.error('\n❌', err.message); process.exit(1); });
