# Sprint 08: Polish

**Status**: planned
**Epic**: —
**Duration**: 1 session (~2-3 hours)
**Goal**: Dark mode, responsive, error handling, data export.

---

## Tasks

### S08-01: Dark Mode
- [ ] Theme toggle button in header
- [ ] Detect system preference (`prefers-color-scheme`)
- [ ] Persist preference in localStorage
- [ ] Apply dark theme via Tailwind `dark:` classes
- [ ] Ensure all components support both themes

### S08-02: Responsive Design
- [ ] Mobile: < 768px
  - [ ] Hamburger menu instead of sidebar
  - [ ] Stacked layouts
  - [ ] Touch-friendly tap targets (min 44px)
- [ ] Tablet: 768-1024px
  - [ ] Collapsible sidebar
  - [ ] Two-column layouts where appropriate
- [ ] Desktop: > 1024px
  - [ ] Full sidebar
  - [ ] Multi-column layouts

### S08-03: Error Handling
- [ ] Toast notifications for:
  - [ ] Success actions (saved, created, etc.)
  - [ ] Errors (API failures, validation errors)
  - [ ] Info (session ended, etc.)
- [ ] Retry logic for failed API calls
- [ ] Offline indicator (if applicable)
- [ ] Graceful degradation

### S08-04: Loading States
- [ ] Optimistic updates for:
  - [ ] Task completion
  - [ ] Idea capture
  - [ ] Journal save
- [ ] Skeleton loaders for initial data fetch
- [ ] Button loading states during mutations

### S08-05: Data Export
- [ ] `GET /api/export` — export all user data as JSON
- [ ] Export button in settings
- [ ] File download with timestamp in filename
- [ ] Include: journals, tasks, ideas, notes, sessions

### S08-06: Account Settings
- [ ] `frontend/src/features/settings/SettingsPage.tsx`
- [ ] View profile (name, email)
- [ ] Change password (optional)
- [ ] Delete account button
- [ ] Export data button
- [ ] Theme toggle

### S08-07: Performance (Optional)
- [ ] Code splitting per route
- [ ] Lazy load heavy components (charts)
- [ ] Remove unused dependencies
- [ ] Bundle size check

---

## Verification Checklist

- [ ] Toggle dark mode → theme changes
- [ ] Dark mode persists on refresh
- [ ] System preference detected on first load
- [ ] Mobile: all pages usable
- [ ] Tablet: layouts adapt correctly
- [ ] Toast notifications appear on actions
- [ ] Export → downloads valid JSON file
- [ ] Delete account → removes all user data
- [ ] All loading states show appropriate feedback

---

## Acceptance Criteria (from PRD)

- [x] All data stored in database
- [x] Data export (JSON) anytime
- [x] Delete account dengan full data removal option

---

## Notes

- Dark mode: Tailwind `darkMode: 'class'`
- Toast library: custom implementation or `sonner`
- Export format: `{ exportedAt, version, data: { journals, tasks, ideas, notes, sessions } }`
- Delete account: soft delete (mark as deleted) or hard delete based on preference
