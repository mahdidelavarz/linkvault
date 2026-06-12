Here's a comprehensive development documentation for your LinkVault application:

```markdown
# LinkVault - Development Documentation 🗂️

## Project Overview
A personal web application for managing links, notes, commands, sample codes, and small files. The MVP focuses on simplicity, security, and fast access to stored information.

---

## Tech Stack

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Data Fetching:** React Query (TanStack Query)
- **HTTP Client:** Axios
- **Icons:** Iconify
- **PWA:** next-pwa

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **ORM:** TypeORM
- **Database:** SQL Server
- **Authentication:** JWT + bcrypt

---

## MVP Features (v1.0.0)

### Authentication
- Username + Password registration/login
- JWT token-based authentication
- Password hashing with bcrypt
- Protected routes on both frontend and backend

### Link Management
- CRUD operations for links
- Link fields: URL, title, description, username, password (encrypted), email, phone
- Favorite/unfavorite links
- Private by default

### Notes
- Create/Read/Update/Delete notes
- Markdown support with preview
- Auto-save functionality
- Pin/unpin notes

### Categories & Tags
- Hierarchical category structure (parent-child)
- Tag system with many-to-many relationships
- Categories and tags are user-specific
- Apply categories/tags to all item types

### Search
- Global search across links and notes
- Server-side filtering and pagination
- Search by title, description, tags, categories

---

## Full Features (Post-MVP)

### v1.1.0 - Enhanced Content
- Code snippets with syntax highlighting
- File uploads (images, PDFs, small documents)
- Rich text editor option for notes
- Bulk import/export (JSON, CSV)

### v1.2.0 - Organization
- Nested categories (unlimited depth)
- Smart collections (auto-categorized based on rules)
- Archive/unarchive items
- Duplicate link detection

### v1.3.0 - Collaboration
- Share links/notes with other users
- Read-only public sharing links
- Team spaces

### v1.4.0 - Advanced Features
- Browser extension for quick saving
- API access for third-party integrations
- Link health checker (broken link detection)
- OCR for image-based content
- Web scraping for auto-filling link metadata

### v2.0.0 - Enterprise Features
- SSO integration (OAuth2, SAML)
- Audit logs
- Advanced permissions (roles)
- Version history for notes
- Backup to cloud storage (S3, Google Drive)

---

## Development Timeline

### Phase 1: Foundation (Week 1-2)
- Project setup (monorepo structure)
- Database schema design and setup
- Authentication system (backend)
- Basic UI layout and navigation

### Phase 2: Core Features (Week 3-4)
- Link CRUD operations
- Category management
- Tag system
- Basic search functionality

### Phase 3: Notes & Enhancement (Week 5-6)
- Notes with Markdown support
- Auto-save functionality
- Pinning system
- Advanced search and filtering

### Phase 4: Polish & Launch (Week 7-8)
- PWA implementation
- UI/UX improvements
- Performance optimization
- Testing and bug fixes
- MVP deployment

---

## Folder Structure

```
linkvault/
├── frontend/
│   ├── public/
│   │   ├── icons/
│   │   ├── manifest.json
│   │   └── sw.js
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── register/
│   │   │   │       └── page.tsx
│   │   │   ├── (dashboard)/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── links/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── create/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── favorites/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── notes/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── create/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── categories/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── tags/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── search/
│   │   │   │       └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── providers.tsx
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   └── Loading.tsx
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── MainLayout.tsx
│   │   │   │   └── MobileNav.tsx
│   │   │   ├── links/
│   │   │   │   ├── LinkCard.tsx
│   │   │   │   ├── LinkForm.tsx
│   │   │   │   ├── LinkList.tsx
│   │   │   │   └── LinkActions.tsx
│   │   │   ├── notes/
│   │   │   │   ├── NoteCard.tsx
│   │   │   │   ├── NoteEditor.tsx
│   │   │   │   ├── NoteList.tsx
│   │   │   │   └── MarkdownPreview.tsx
│   │   │   ├── categories/
│   │   │   │   ├── CategoryTree.tsx
│   │   │   │   └── CategoryForm.tsx
│   │   │   ├── tags/
│   │   │   │   ├── TagInput.tsx
│   │   │   │   └── TagBadge.tsx
│   │   │   └── search/
│   │   │       ├── SearchBar.tsx
│   │   │       └── SearchResults.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useLinks.ts
│   │   │   ├── useNotes.ts
│   │   │   ├── useCategories.ts
│   │   │   ├── useTags.ts
│   │   │   └── useSearch.ts
│   │   ├── lib/
│   │   │   ├── axios.ts
│   │   │   └── utils.ts
│   │   ├── store/
│   │   │   ├── authStore.ts
│   │   │   ├── uiStore.ts
│   │   │   └── searchStore.ts
│   │   ├── types/
│   │   │   ├── link.ts
│   │   │   ├── note.ts
│   │   │   ├── category.ts
│   │   │   ├── tag.ts
│   │   │   └── user.ts
│   │   └── constants/
│   │       └── index.ts
│   ├── .env.local
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   └── jwt.ts
│   │   ├── entities/
│   │   │   ├── User.ts
│   │   │   ├── Link.ts
│   │   │   ├── Note.ts
│   │   │   ├── File.ts
│   │   │   ├── Category.ts
│   │   │   ├── Tag.ts
│   │   │   └── Taggable.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── validation.ts
│   │   │   └── errorHandler.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── links.ts
│   │   │   ├── notes.ts
│   │   │   ├── categories.ts
│   │   │   ├── tags.ts
│   │   │   └── search.ts
│   │   ├── controllers/
│   │   │   ├── AuthController.ts
│   │   │   ├── LinkController.ts
│   │   │   ├── NoteController.ts
│   │   │   ├── CategoryController.ts
│   │   │   ├── TagController.ts
│   │   │   └── SearchController.ts
│   │   ├── services/
│   │   │   ├── AuthService.ts
│   │   │   ├── LinkService.ts
│   │   │   ├── NoteService.ts
│   │   │   ├── CategoryService.ts
│   │   │   ├── TagService.ts
│   │   │   └── SearchService.ts
│   │   ├── utils/
│   │   │   ├── encryption.ts
│   │   │   └── helpers.ts
│   │   └── app.ts
│   ├── .env
│   ├── tsconfig.json
│   ├── ormconfig.json
│   └── package.json
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## Database Schema

### Users
```sql
CREATE TABLE users (
    id INT PRIMARY KEY IDENTITY(1,1),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);
```

### Categories
```sql
CREATE TABLE categories (
    id INT PRIMARY KEY IDENTITY(1,1),
    name VARCHAR(100) NOT NULL,
    parent_id INT NULL,
    user_id INT NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (parent_id) REFERENCES categories(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Links
```sql
CREATE TABLE links (
    id INT PRIMARY KEY IDENTITY(1,1),
    url VARCHAR(2048) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    username VARCHAR(100),
    password_encrypted VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    is_favorite BIT DEFAULT 0,
    category_id INT,
    user_id INT NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Notes
```sql
CREATE TABLE notes (
    id INT PRIMARY KEY IDENTITY(1,1),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    is_pinned BIT DEFAULT 0,
    category_id INT,
    user_id INT NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Tags
```sql
CREATE TABLE tags (
    id INT PRIMARY KEY IDENTITY(1,1),
    name VARCHAR(50) NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE (name, user_id)
);
```

### Taggables (Polymorphic)
```sql
CREATE TABLE taggables (
    id INT PRIMARY KEY IDENTITY(1,1),
    tag_id INT NOT NULL,
    taggable_id INT NOT NULL,
    taggable_type VARCHAR(20) NOT NULL, -- 'link', 'note', 'file'
    FOREIGN KEY (tag_id) REFERENCES tags(id)
);
```

---

## API Endpoints (MVP)

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Links
- `GET /api/links` - List links (with filtering, sorting, pagination)
- `POST /api/links` - Create link
- `GET /api/links/:id` - Get single link
- `PUT /api/links/:id` - Update link
- `DELETE /api/links/:id` - Delete link
- `PATCH /api/links/:id/favorite` - Toggle favorite

### Notes
- `GET /api/notes` - List notes
- `POST /api/notes` - Create note
- `GET /api/notes/:id` - Get single note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note
- `PATCH /api/notes/:id/pin` - Toggle pin

### Categories
- `GET /api/categories` - Get category tree
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Tags
- `GET /api/tags` - List user tags
- `POST /api/tags` - Create tag
- `DELETE /api/tags/:id` - Delete tag

### Search
- `GET /api/search?q=query&type=link|note` - Global search

---

## Security Measures

- JWT tokens with 24h expiration
- Passwords hashed with bcrypt (salt rounds: 12)
- Encrypted storage for link credentials (AES-256)
- Input validation on all endpoints
- SQL injection prevention via TypeORM
- Rate limiting on auth endpoints
- CORS configuration
- Helmet.js for security headers

---

## Development Guidelines

### Git Workflow
- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches

### Commit Convention
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `docs:` - Documentation
- `style:` - Styling changes
- `test:` - Testing

### Code Quality
- ESLint + Prettier configuration
- TypeScript strict mode
- Unit tests for services (Jest)
- Component testing (React Testing Library)
- API testing (Supertest)
```

This documentation provides a clear roadmap for development, organized folder structure, database schema, API endpoints, and guidelines for building the LinkVault application. The MVP scope is clearly defined with a realistic 8-week timeline, while future features are organized into logical version increments.