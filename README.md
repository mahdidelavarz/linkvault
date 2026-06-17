# NeoVault

A self-hosted personal knowledge vault — one place to manage links, notes, code snippets, AI prompts, infrastructure configs, and API collections, with encrypted credential storage and offline PWA support.

## Features

### Modules
- **Links** — bookmark URLs with optional stored credentials (username, password, email, phone) encrypted at rest
- **Notes** — markdown-ready notes with pin support
- **Snippets** — code snippets with syntax highlighting for 15+ languages (JS, TS, Python, Rust, Go, SQL, YAML, and more) powered by CodeMirror
- **Prompts** — AI prompt library with variables, version history, target AI tagging, usage tracking, and collections
- **Infrastructure** — store server configs, Dockerfiles, SSH keys, and other infra content
- **API Client** — Postman-like HTTP client with collections, environments, cURL import, and code generation
- **Projects** — group items from any module into a unified project view with template support

### Cross-cutting
- **Encrypted Vault** — optional client-side vault key encryption for sensitive fields
- **Full-text Search** — PostgreSQL GIN indexes for fast search across all content types
- **Tags & Categories** — hierarchical category tree and flexible tagging across all modules
- **Dashboard** — activity stats, recent items, and quick-capture widget
- **Favorites** — mark any item as favorite across all modules
- **Bulk Actions** — select and act on multiple items at once
- **PWA / Offline** — installable progressive web app with offline queue and sync status
- **JWT Auth** — access + refresh token pair, password reset via email

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| State / Data | TanStack Query v5, Zustand |
| Forms / Validation | React Hook Form, Zod |
| Code Editor | CodeMirror 6 with multi-language support |
| PWA | Serwist (Workbox) |
| Backend | Express 5, TypeScript, TypeORM |
| Database | PostgreSQL 16 |
| Auth | JWT (jsonwebtoken), bcrypt |
| Email | Nodemailer |
| API Docs | Swagger UI |
| Infrastructure | Docker Compose, Nginx |

## Project Structure

```
neovault/
├── backend/
│   ├── src/
│   │   ├── config/         # DB, JWT, env, search indexes
│   │   ├── controllers/    # Route handlers
│   │   ├── entities/       # TypeORM entities
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── migrations/     # DB migrations
│   │   ├── routes/         # Express routers
│   │   ├── services/       # Business logic
│   │   └── utils/          # Crypto, SSRF protection, helpers
│   └── Dockerfile.dev
├── frontend/
│   └── src/
│       ├── app/            # Next.js App Router pages
│       └── features/       # Feature-sliced modules
│           ├── auth/
│           ├── links/
│           ├── notes/
│           ├── snippets/
│           ├── prompts/
│           ├── infrastructure/
│           ├── postman/
│           ├── projects/
│           ├── categories/
│           ├── search/
│           ├── dashboard/
│           ├── settings/
│           └── shared/
├── docker-compose.yml      # Production
├── docker-compose.dev.yml  # Development
├── .env.example
└── nginx/                  # Nginx reverse proxy config
```

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/get-started) and Docker Compose
- Node.js 20+ (for local development without Docker)

### Quick Start with Docker (Recommended)

**1. Clone and configure**

```bash
git clone <repo-url>
cd neovault
cp .env.example .env
```

**2. Edit `.env`** — at minimum change the secrets:

```env
JWT_SECRET=your-strong-secret-here
ENCRYPTION_KEY=exactly-32-characters-long!!!!!
DB_PASSWORD=your-db-password
```

**3. Start development environment**

```bash
docker compose -f docker-compose.dev.yml up
```

Services will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Swagger UI: http://localhost:5000/api-docs

**4. Start production environment**

```bash
docker compose up -d
```

Production routes everything through Nginx on ports 80/443.

### Docker Commands Reference

```bash
# Start in background
docker compose -f docker-compose.dev.yml up -d

# Rebuild images after Dockerfile changes
docker compose -f docker-compose.dev.yml up --build

# View logs
docker compose -f docker-compose.dev.yml logs -f

# Stop services
docker compose -f docker-compose.dev.yml down

# Stop and remove database volume (clears all data)
docker compose -f docker-compose.dev.yml down -v

# Shell into a service
docker compose -f docker-compose.dev.yml exec backend sh
docker compose -f docker-compose.dev.yml exec postgres psql -U node_user -d linkvault

# Restart a single service
docker compose -f docker-compose.dev.yml restart backend
```

### Local Development (without Docker)

**Backend**

```bash
cd backend
npm install
cp ../.env.example ../.env   # then edit .env
npm run dev
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

Make sure PostgreSQL is running locally and `DB_HOST=localhost` is set in `.env`.

**Database migrations**

```bash
cd backend
npm run migration:run        # development (ts-node)
npm run migration:run:prod   # production (compiled JS)
```

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```env
# Server
NODE_ENV=development
PORT=5000
HOST=0.0.0.0

# Database
DB_HOST=localhost          # use "postgres" inside Docker Compose
DB_PORT=5432
DB_USERNAME=node_user
DB_PASSWORD=change-me
DB_DATABASE=linkvault
DB_SYNCHRONIZE=true        # set to false in production

# JWT & Encryption
JWT_SECRET=change-me-in-production
JWT_EXPIRES_IN=7d
ENCRYPTION_KEY=32-character-encryption-key!!  # must be exactly 32 chars

# SMTP (password reset emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=NeoVault <noreply@yourdomain.com>

# CORS
ALLOWED_ORIGINS=http://localhost:3000
FRONTEND_URL=http://localhost:3000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

> **Security note:** Never commit `.env` to version control. The `ENCRYPTION_KEY` is used for AES encryption of credentials stored in the vault — rotating it will make existing encrypted data unreadable.

## API Overview

The backend exposes a RESTful API under `/api`. Swagger UI is available at `/api-docs` in development.

| Resource | Endpoint prefix |
|---|---|
| Auth | `/api/auth` |
| Links | `/api/links` |
| Notes | `/api/notes` |
| Snippets | `/api/snippets` |
| Prompts | `/api/prompts` |
| Prompt Collections | `/api/prompt-collections` |
| Infrastructure | `/api/infra` |
| API Collections | `/api/api-collections` |
| Projects | `/api/projects` |
| Categories | `/api/categories` |
| Tags | `/api/tags` |
| Search | `/api/search` |
| Dashboard | `/api/dashboard` |
| Vault | `/api/vault` |

All protected routes require a `Bearer` JWT token in the `Authorization` header.

## Security

- Passwords and sensitive link credentials are AES-encrypted before storage using the `ENCRYPTION_KEY`
- The optional Vault feature adds a second layer: a per-user vault key encrypted with a BIP39 passphrase, stored encrypted on the server
- SSRF protection is applied to any user-supplied URLs
- Rate limiting is enabled on auth endpoints via `express-rate-limit`
- Security headers are set by `helmet`
- Input validation uses `zod` schemas on both frontend and backend

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a pull request

Please keep PRs focused — one feature or fix per PR.

## License

MIT
