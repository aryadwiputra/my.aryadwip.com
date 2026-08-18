# Sprint 03: Morning Journal

**Status**: planned
**Epic**: Epik 1 — Morning Journal
**Duration**: 1-2 sessions (~2-4 hours)
**Goal**: Journal CRUD, mood selection, streak tracking.

---

## Tasks

### S03-01: Journal API
- [ ] `GET /api/journals` — list user's journals (with date filters)
- [ ] `POST /api/journals` — create journal entry (one per day)
- [ ] `GET /api/journals/:id` — get single journal
- [ ] `PUT /api/journals/:id` — update journal
- [ ] `DELETE /api/journals/:id` — delete journal
- [ ] `GET /api/journals/streaks` — get journaling streak data
- [ ] All routes protected (require auth)

### S03-02: Journal Feature — Query Setup
- [ ] TanStack Query hooks:
  - [ ] `useJournals()` — fetch journal list
  - [ ] `useJournal(id)` — fetch single journal
  - [ ] `useCreateJournal()` — create mutation
  - [ ] `useUpdateJournal()` — update mutation
  - [ ] `useDeleteJournal()` — delete mutation
  - [ ] `useJournalStreak()` — fetch streak data
- [ ] Query keys with proper invalidation

### S03-03: Journal Entry Form
- [ ] `frontend/src/features/journal/components/JournalForm.tsx`
- [ ] Three prompts:
  - [ ] Gratitude — textarea
  - [ ] Intention — textarea
  - [ ] Affirmation — textarea
- [ ] Mood selector — 5 emoji buttons (great, good, okay, low, bad)
- [ ] Energy level — 1-5 scale slider/buttons
- [ ] Auto-timestamp on create
- [ ] Save/edit functionality

### S03-04: Journal List View
- [ ] `frontend/src/features/journal/components/JournalList.tsx`
- [ ] List entries by date (newest first)
- [ ] Display mood emoji, energy level, date
- [ ] Click to view/edit entry
- [ ] Empty state for no entries

### S03-05: Journal Streak Display
- [ ] Streak counter component
- [ ] Current streak count
- [ ] Longest streak count
- [ ] Visual streak calendar (optional)

### S03-06: Journal Page
- [ ] `frontend/src/features/journal/JournalPage.tsx`
- [ ] "Today's Journal" prompt if no entry today
- [ ] Quick edit for existing entry
- [ ] Navigation to history view
- [ ] Streak display

---

## Verification Checklist

- [ ] Create journal entry → saved to DB with correct date
- [ ] View journal → shows all prompts, mood, energy
- [ ] Edit journal → updates in DB
- [ ] Delete journal → removed from DB
- [ ] List journals → shows all entries sorted by date
- [ ] Streak: complete 3 consecutive days → streak = 3
- [ ] Streak: miss a day → streak resets to 1
- [ ] "One entry per day" enforced (edit instead of create)
- [ ] Unauthenticated access → 401

---

## Acceptance Criteria (from PRD)

- [x] User bisa pilih dari 3-5 daily prompts (gratitude, intention, affirmation)
- [x] Journal entries tersimpan dengan timestamp otomatis
- [x] User bisa lihat streak journaling
- [x] Entries bisa di-tag dengan mood/energy level

---

## Notes

- Mood enum: `great | good | okay | low | bad`
- Energy: integer 1-5
- Prompts stored as JSON: `{ gratitude: string, intention: string, affirmation: string }`
- Date format: ISO 8601 (YYYY-MM-DD)
- Streak: consecutive days with at least one journal entry
