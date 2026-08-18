# Sprint 02: Core UI Shell

**Status**: planned
**Epic**: —
**Duration**: 1 session (~2-3 hours)
**Goal**: Layout, navigation, shared components, auth protection.

---

## Tasks

### S02-01: Project Structure
- [ ] Create feature directories:
  - [ ] `frontend/src/features/auth/`
  - [ ] `frontend/src/features/journal/`
  - [ ] `frontend/src/features/tasks/`
  - [ ] `frontend/src/features/ideas/`
  - [ ] `frontend/src/features/notes/`
  - [ ] `frontend/src/features/timer/`
  - [ ] `frontend/src/features/dashboard/`
- [ ] Create shared directories:
  - [ ] `frontend/src/components/ui/` — reusable primitives
  - [ ] `frontend/src/hooks/` — shared hooks
  - [ ] `frontend/src/lib/` — utilities

### S02-02: Shared UI Components
- [ ] `Button` — variants: primary, secondary, ghost, danger; sizes: sm, md, lg
- [ ] `Input` — text, email, password, with label and error
- [ ] `Card` — container with header, body, footer
- [ ] `Badge` — priority badges (P1-P4), status badges
- [ ] `Modal` — accessible dialog
- [ ] `Dropdown` — menu trigger
- [ ] `Skeleton` — loading placeholder
- [ ] `Toast` — notification component

### S02-03: Layout
- [ ] `frontend/src/components/Layout.tsx`
  - [ ] Sidebar navigation (desktop)
  - [ ] Mobile hamburger menu
  - [ ] Main content area
- [ ] `frontend/src/components/NavItem.tsx` — nav link with active state
- [ ] Responsive: mobile (<768px), tablet (768-1024px), desktop (>1024px)

### S02-04: Routing
- [ ] `frontend/src/routes.ts` — update with all routes
  - [ ] `/` → redirect to /dashboard or /login
  - [ ] `/login` → login page
  - [ ] `/register` → register page
  - [ ] `/dashboard` → dashboard (protected)
  - [ ] `/journal` → journal page (protected)
  - [ ] `/tasks` → tasks page (protected)
  - [ ] `/ideas` → ideas inbox (protected)
  - [ ] `/notes` → notes page (protected)
  - [ ] `/timer` → focus timer (protected)
  - [ ] `/settings` → account settings (protected)

### S02-05: Auth Protection
- [ ] `frontend/src/hooks/useAuth.ts` — auth hook
- [ ] Protected route wrapper — redirect to /login if not authenticated
- [ ] Redirect to /dashboard after login
- [ ] Auth middleware in loaders

### S02-06: Loading & Error States
- [ ] Global loading indicator
- [ ] Route-level loading skeletons
- [ ] Error boundary with retry option
- [ ] 404 page

---

## Verification Checklist

- [ ] All navigation links work
- [ ] Clicking nav item updates active state
- [ ] Mobile: hamburger menu opens/closes
- [ ] Unauthenticated access to /dashboard → redirect to /login
- [ ] Authenticated access to /login → redirect to /dashboard
- [ ] Loading skeleton shows during data fetch
- [ ] Error boundary catches and displays errors gracefully
- [ ] 404 page shows for unknown routes

---

## Notes

- Use existing `app.css` for global styles
- Tailwind v4: use `@apply` in components sparingly, prefer utility classes
- Lucide icons: consistent stroke width, size variants
- Mobile-first responsive design
