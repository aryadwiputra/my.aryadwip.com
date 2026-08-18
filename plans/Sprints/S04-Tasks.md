# Sprint 04: Task Management

**Status**: planned
**Epic**: Epik 2 — Task Management
**Duration**: 1-2 sessions (~2-4 hours)
**Goal**: Task CRUD, views (Today/Week/Someday), filters, completion.

---

## Tasks

### S04-01: Task API
- [ ] `GET /api/tasks` — list tasks (filters: status, priority, date range)
- [ ] `POST /api/tasks` — create task
- [ ] `GET /api/tasks/:id` — get single task
- [ ] `PUT /api/tasks/:id` — update task
- [ ] `DELETE /api/tasks/:id` — delete task
- [ ] `PATCH /api/tasks/:id/complete` — mark complete with timestamp
- [ ] `PATCH /api/tasks/:id/uncomplete` — mark incomplete
- [ ] `GET /api/tasks/stats` — get task completion stats
- [ ] All routes protected

### S04-02: Task Feature — Query Setup
- [ ] TanStack Query hooks:
  - [ ] `useTasks(filters)` — fetch filtered task list
  - [ ] `useTask(id)` — fetch single task
  - [ ] `useCreateTask()` — create mutation
  - [ ] `useUpdateTask()` — update mutation
  - [ ] `useDeleteTask()` — delete mutation
  - [ ] `useCompleteTask()` — complete mutation
  - [ ] `useTaskStats()` — fetch stats
- [ ] Optimistic updates for complete/uncomplete

### S04-03: Task Form
- [ ] `frontend/src/features/tasks/components/TaskForm.tsx`
- [ ] Fields:
  - [ ] Title (required)
  - [ ] Description (optional, textarea)
  - [ ] Due date (optional, date picker)
  - [ ] Priority (P1-P4, select)
  - [ ] Tags (multi-select, comma-separated input)
- [ ] Validation with zod

### S04-04: Task List Views
- [ ] `frontend/src/features/tasks/components/TaskList.tsx`
- [ ] Three views (tabs or sections):
  - [ ] **Today** — tasks where dueDate = today
  - [ ] **This Week** — tasks where dueDate within 7 days
  - [ ] **Someday** — tasks with no due date
- [ ] Each task shows: title, priority badge, due date, tags
- [ ] Click to edit

### S04-05: Task Filters & Sort
- [ ] Filter by priority (P1, P2, P3, P4)
- [ ] Filter by tags
- [ ] Filter by completion status
- [ ] Sort by: due date, priority, created date
- [ ] Persist filter state in URL params

### S04-06: Task Actions
- [ ] Complete button → PATCH /complete
- [ ] Uncomplete button → PATCH /uncomplete
- [ ] Delete with confirmation
- [ ] Archive completed tasks

### S04-07: Tasks Page
- [ ] `frontend/src/features/tasks/TasksPage.tsx`
- [ ] Tab navigation (Today / This Week / Someday)
- [ ] "New Task" button → opens form
- [ ] Filter bar
- [ ] Task list with drag-to-reorder (optional)

---

## Verification Checklist

- [ ] Create task → saved with all fields
- [ ] Task with today's due date → appears in Today view
- [ ] Task with future due date → appears in This Week view
- [ ] Task without due date → appears in Someday view
- [ ] Filter by P1 → only P1 tasks shown
- [ ] Complete task → status updated, timestamp added
- [ ] Completed task → moves to "completed" or archived
- [ ] Edit task → updates in DB
- [ ] Delete task → removed from DB

---

## Acceptance Criteria (from PRD)

- [x] User bisa buat task dengan: title, description, due date, priority (P1-P4), tags
- [x] Task bisa di-group: Today, This Week, Someday/Maybe
- [x] Filter dan sort task by date, priority, tags
- [x] Completed task masuk ke "completed log" dengan completion timestamp
- [x] Task bisa di-archive

---

## Notes

- Priority enum: `P1 | P2 | P3 | P4`
- Status enum: `todo | in_progress | completed`
- Tags stored as JSON array: `string[]`
- Completed timestamp: `completedAt`
- Completed tasks optionally hidden from default view (show in "Completed" section)
