# Docker Plan

Services:
- frontend (Next.js)
- backend (Express)
- postgres

Ports:
- frontend: 3000
- backend: 4000
- postgres: 5432

Volumes:
- postgres_data:/var/lib/postgresql/data
