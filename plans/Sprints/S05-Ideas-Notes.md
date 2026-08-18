# Sprint 05: Idea Capture + Knowledge Notes

**Status**: planned
**Epic**: Epik 3 (Idea Capture) + Epik 4 (Knowledge Management)
**Duration**: 1-2 sessions (~2-4 hours)
**Goal**: Quick capture, inbox, idea conversion, note management.

---

## Tasks

### S05-01: Idea API
- [ ] `GET /api/ideas` — list ideas (inbox/converted/archived)
- [ ] `POST /api/ideas` — quick capture idea
- [ ] `PUT /api/ideas/:id` — update idea
- [ ] `DELETE /api/ideas/:id` — delete idea
- [ ] `POST /api/ideas/:id/convert-to-task` — convert to task, return task
- [ ] `POST /api/ideas/:id/convert-to-note` — convert to note, return note
- [ ] All routes protected

### S05-02: Idea Feature — Query Setup
- [ ] TanStack Query hooks:
  - [ ] `useIdeas(status)` — fetch ideas by status
  - [ ] `useCaptureIdea()` — create mutation
  - [ ] `useUpdateIdea()` — update mutation
  - [ ] `useDeleteIdea()` — delete mutation
  - [ ] `useConvertToTask()` — convert mutation
  - [ ] `useConvertToNote()` — convert mutation

### S05-03: Quick Capture
- [ ] `frontend/src/features/ideas/components/QuickCapture.tsx`
- [ ] Floating action button (FAB) in corner
- [ ] Keyboard shortcut: Ctrl/Cmd + K
- [ ] Modal with single textarea
- [ ] Auto-timestamp on capture
- [ ] Close on Escape, click outside

### S05-04: Ideas Inbox
- [ ] `frontend/src/features/ideas/IdeasPage.tsx`
- [ ] List all "inbox" ideas
- [ ] Display: content preview, capture timestamp
- [ ] Actions per idea:
  - [ ] Convert to Task → opens task form with content pre-filled
  - [ ] Convert to Note → opens note form with content pre-filled
  - [ ] Edit
  - [ ] Delete

### S05-05: Note API
- [ ] `GET /api/notes` — list notes (filters: tags, search)
- [ ] `POST /api/notes` — create note
- [ ] `GET /api/notes/:id` — get single note
- [ ] `PUT /api/notes/:id` — update note
- [ ] `DELETE /api/notes/:id` — delete note
- [ ] `GET /api/notes/search?q=` — full-text search
- [ ] All routes protected

### S05-06: Note Feature — Query Setup
- [ ] TanStack Query hooks:
  - [ ] `useNotes(filters)` — fetch notes
  - [ ] `useNote(id)` — fetch single note
  - [ ] `useCreateNote()` — create mutation
  - [ ] `useUpdateNote()` — update mutation
  - [ ] `useDeleteNote()` — delete mutation
  - [ ] `useSearchNotes(query)` — search mutation

### S05-07: Note Form & Editor
- [ ] `frontend/src/features/notes/components/NoteForm.tsx`
- [ ] Fields:
  - [ ] Title (required)
  - [ ] Content (textarea or simple markdown editor)
  - [ ] Source (optional, e.g., "Book: Atomic Habits")
  - [ ] Tags (multi-select)
- [ ] Basic markdown preview (bold, italic, lists)

### S05-08: Notes Page
- [ ] `frontend/src/features/notes/NotesPage.tsx`
- [ ] List view with cards
- [ ] Display: title, source, tags, date
- [ ] Search bar
- [ ] Filter by tags
- [ ] Click to view/edit

### S05-09: Tags System
- [ ] `frontend/src/features/shared/TagInput.tsx`
- [ ] Tag creation on type
- [ ] Tag suggestions/autocomplete
- [ ] Tag display in lists

---

## Verification Checklist

- [ ] Quick capture (FAB) → idea saved to inbox
- [ ] Ctrl/Cmd+K → opens quick capture modal
- [ ] Idea in inbox → "Convert to Task" → task form opens with content
- [ ] Idea in inbox → "Convert to Note" → note form opens with content
- [ ] Converted idea → status changes to "converted", not deleted
- [ ] Create note → saved with title, content, source, tags
- [ ] Search notes → returns matching results
- [ ] Filter by tag → shows only matching notes
- [ ] Delete idea → removed from DB

---

## Acceptance Criteria (from PRD)

**Idea Capture:**
- [x] Quick capture via keyboard shortcut (Ctrl/Cmd+K)
- [x] Capture box always accessible (floating button)
- [x] Ide langsung masuk ke "Inbox" collection
- [x] User bisa convert idea ke task atau note
- [x] Timestamp capture otomatis

**Knowledge Notes:**
- [x] User bisa buat notes dengan title, content, source
- [x] Notes bisa di-tag dengan topics/categories
- [x] Quick search notes by title, content, tags

---

## Notes

- Idea status: `inbox | converted | archived`
- Note content: plain text or simple markdown
- Tags stored as JSON array
- Search: LIKE query on title and content
