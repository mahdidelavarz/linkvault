# API Design (MVP)

Base URL: /api

---

## Auth

POST /auth/register
- body:
  - username
  - password

POST /auth/login
- body:
  - username
  - password

POST /auth/logout

GET /auth/me
- returns current user

---

## Links

GET /links
POST /links

GET /links/:id
PUT /links/:id
DELETE /links/:id

---

## Notes

GET /notes
POST /notes

GET /notes/:id
PUT /notes/:id
DELETE /notes/:id

---

## Categories

GET /categories
POST /categories
PUT /categories/:id
DELETE /categories/:id

---

## Tags

GET /tags
POST /tags
