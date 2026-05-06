# LinkVault 🗂️
A personal web application for managing links, notes, commands, and small files.

---

## 1. Project Overview

LinkVault is a web-based personal knowledge and link management system.
Users can securely store and organize:
- Links (with optional credentials)
- Notes (Markdown)
- Commands / snippets
- Small files

The focus of the MVP is simplicity, security, and fast access.

---

## 2. Tech Stack

### Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- React Query
- Zustand
- Axios
- Iconify
- PWA support

### Backend
- Node.js
- Express
- TypeORM
- PostgreSQL
- JWT Authentication

### DevOps
- Docker
- Docker Compose

---

## 3. Authentication (MVP)

- Username + Password only
- Token-based authentication (JWT)
- Password hashing using bcrypt
- No OAuth / no email verification (for MVP)

---

## 4. Core Features (MVP Scope)

### 4.1 Link Management
- Create / Read / Update / Delete links
- Each link can include:
  - URL
  - Title
  - Description
  - Username (optional)
  - Password (optional, encrypted)
  - Email (optional)
  - Phone number (optional)
- Favorite links
- Private by default

### 4.2 Notes
- Markdown-based notes
- Auto-save
- Pin notes
- Categories and tags

### 4.3 Categories & Tags
- Hierarchical categories (folder-like structure)
- Free-form tags
- Categories and tags are user-specific
- Applicable to all item types (links, notes, files, snippets)

### 4.4 Search
- Global search across:
  - Links
  - Notes
  - Files
- Server-side filtering

---

## 5. Data Organization Strategy

### Categories
- Tree-based structure
- One category per item
- Used for structural organization

### Tags
- Many-to-many relationship
- Used for flexible filtering and fast access
- Polymorphic tagging (links, notes, files)

---

## 6. Database Entities (High Level)

- User
- Link
- Note
- File
- Category
- Tag
- Taggable (polymorphic join table)

---

## 7. Development Phases & Timeline

### Phase 1 – Planning (Week 1)
- Finalize MVP scope
- Define database schema
- Setup project structure
- Setup Docker environment

### Phase 2 – Backend Core (Week 2)
- Auth (JWT)
- User entity
- CRUD for Links
- Category & Tag system
- PostgreSQL integration

### Phase 3 – Frontend Core (Week 3)
- Auth pages (Login / Register)
- Dashboard layout
- Link management UI
- Category & Tag UI
- Global search

### Phase 4 – Notes & Files (Week 4)
- Notes (Markdown editor)
- File upload (small files)
- Favorite & pin features

### Phase 5 – Polish & PWA (Week 5)
- PWA setup
- Offline caching
- Performance optimization
- UI/UX improvements

---

## 8. Folder Structure (Suggested)

### Frontend (Next.js)
