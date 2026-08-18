# Sprint 01: Foundation Setup

**Status**: planned
**Epic**: —
**Duration**: 1 session (~2-3 hours)
**Goal**: Project scaffold, auth, database, API structure.

---

## Tasks

### S01-01: Backend Dependencies
- [ ] Install: drizzle-orm, better-sqlite3, drizzle-kit, zod, jose, bcrypt, nanoid
- [ ] Setup `backend/tsconfig.json` with strict mode
- [ ] Create `backend/src/db/` directory

### S01-02: Database Schema
- [ ] `backend/src/db/schema.ts` — define all tables:
  - [ ] `users`: id, email, passwordHash, name, createdAt, updatedAt
  - [ ] `journals`: id, userId, date, mood, energy, prompts (JSON), createdAt, updatedAt
  - [ ] `tasks`: id, userId, title, description, dueDate, priority (P1-P4), status, tags (JSON), completedAt, createdAt, updatedAt
  - [ ] `ideas`: id, userId, content, status (inbox/converted/archived), createdAt
  - [ ] `notes`: id, userId, title, content, source, tags (JSON), createdAt, updatedAt
  - [ ] `focusSessions`: id, userId, taskId, duration, startedAt, endedAt, status, createdAt
- [ ] `backend/src/db/index.ts` — SQLite connection (in-memory dev, file-based prod)
- [ ] Run initial migration

### S01-03: Auth API
- [ ] `POST /api/auth/register` — validate input, hash password, create user, return tokens
- [ ] `POST /api/auth/login` — verify email+password, return tokens
- [ ] `POST /api/auth/refresh` — validate refresh token, return new access token
- [ ] `POST /api/auth/logout` — invalidate refresh token
- [ ] `GET /api/auth/me` — return current user profile
- [ ] Auth middleware — verify JWT, attach user to context

### S01-04: Frontend Dependencies
- [ ] Install: @tanstack/react-query, zustand, lucide-react, clsx, tailwind-merge, date-fns
- [ ] Setup `frontend/tsconfig.json` path aliases

### S01-05: API Client
- [ ] `frontend/src/lib/api.ts` — fetch wrapper with:
  - [ ] Base URL config (VITE_API_URL)
  - [ ] Auth header injection
  - [ ] Token refresh logic
  - [ ] Error handling
- [ ] TypeScript types for all API responses

### S01-06: Auth State
- [ ] Zustand store: `frontend/src/stores/auth.ts`
  - [ ] Store access/refresh tokens
  - [ ] Store user profile
  - [ ] Login/logout actions
- [ ] Persist tokens to localStorage
- [ ] Initialize auth state on app load

### S01-07: Login/Register Pages
- [ ] `frontend/src/routes/login.tsx` — login form
- [ ] `frontend/src/routes/register.tsx` — registration form
- [ ] Form validation (zod schemas)
- [ ] Error display
- [ ] Redirect to dashboard after success

---

## Verification Checklist

- [ ] `cd backend && bun run dev` — server starts on :3000
- [ ] `cd frontend && npm run dev` — frontend starts on :5173
- [ ] POST /api/auth/register → user created, tokens returned
- [ ] POST /api/auth/login → valid login returns tokens
- [ ] POST /api/auth/login → invalid credentials returns 401
- [ ] GET /api/auth/me with valid token → user data returned
- [ ] GET /api/auth/me without token → 401 returned
- [ ] POST /api/auth/refresh → new access token returned
- [ ] Register page → creates user → redirects to dashboard
- [ ] Login page → validates credentials → redirects on success
- [ ] Unauthenticated access to protected route → redirects to login

---

## Notes

- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173`
- CORS: Allow frontend origin
- In-memory SQLite resets on server restart (dev only)
- JWT access token expiry: 15 min
- JWT refresh token expiry: 7 days
- Password: bcrypt with cost factor 12
