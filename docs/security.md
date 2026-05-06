# Security Decisions (MVP)

- Password hashing: bcrypt
- JWT access token lifetime: 15 minutes
- JWT refresh token lifetime: 7 days
- Token storage: HttpOnly cookies
- Sensitive link fields encryption: AES (server-side)
- Soft delete for all main entities
- No public sharing in MVP
