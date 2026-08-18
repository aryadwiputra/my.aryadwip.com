# Sprint 06: Focus Timer

**Status**: planned
**Epic**: Epik 5 — Focus Mode & Deep Work
**Duration**: 1-2 sessions (~2-4 hours)
**Goal**: Pomodoro timer, session tracking, focus mode.

---

## Tasks

### S06-01: Session API
- [ ] `GET /api/sessions` — list sessions (with date filters)
- [ ] `POST /api/sessions` — start new session
- [ ] `PATCH /api/sessions/:id` — update session (mark complete, cancel)
- [ ] `GET /api/sessions/stats` — get focus time analytics
- [ ] `GET /api/sessions/today` — get today's session summary
- [ ] All routes protected

### S06-02: Session Feature — Query Setup
- [ ] TanStack Query hooks:
  - [ ] `useSessions(filters)` — fetch sessions
  - [ ] `useStartSession()` — create session mutation
  - [ ] `useUpdateSession()` — update mutation
  - [ ] `useSessionStats()` — fetch stats
  - [ ] `useTodaySessions()` — fetch today's sessions

### S06-03: Timer Component
- [ ] `frontend/src/features/timer/components/Timer.tsx`
- [ ] Countdown display (MM:SS format)
- [ ] Preset buttons: 25 min, 50 min, 90 min
- [ ] Custom duration input
- [ ] Start/Pause/Stop/Reset controls
- [ ] Visual progress indicator (circular or bar)

### S06-04: Focus Mode
- [ ] `frontend/src/features/timer/components/FocusMode.tsx`
- [ ] Fullscreen overlay (CSS: `position: fixed`, `inset: 0`)
- [ ] Shows only: timer, pause button, exit button
- [ ] Dark background for focus
- [ ] Exit with Escape key or button

### S06-05: Task Association
- [ ] "Link to task" dropdown in timer
- [ ] Shows user's tasks (optional)
- [ ] Session stores taskId

### S06-06: Session Counter
- [ ] Display: "Sessions today: X"
- [ ] Display: "Focus time today: Xh Xm"
- [ ] Weekly summary (sessions per day)

### S06-07: Break Reminders
- [ ] Notification/alert at session end
- [ ] Sound notification (optional, toggle)
- [ ] "Take a break" message
- [ ] Break duration suggestion (5-10 min)

### S06-08: Session History
- [ ] `frontend/src/features/timer/components/SessionHistory.tsx`
- [ ] List past sessions
- [ ] Display: date, duration, linked task (if any)
- [ ] Filter by date range

### S06-09: Timer Page
- [ ] `frontend/src/features/timer/TimerPage.tsx`
- [ ] Timer component (primary)
- [ ] Session counter and today's summary
- [ ] Link to task
- [ ] Focus Mode button
- [ ] Session history section

---

## Verification Checklist

- [ ] Start 25min timer → counts down to 0
- [ ] Pause timer → countdown stops
- [ ] Resume timer → continues from paused time
- [ ] Stop timer → session marked as cancelled
- [ ] Complete timer → session marked as completed with actual duration
- [ ] Session saved to DB with correct timestamps
- [ ] Focus Mode → fullscreen overlay activates
- [ ] Exit Focus Mode → returns to normal view
- [ ] Link session to task → taskId stored
- [ ] Today's summary shows correct session count
- [ ] Break reminder appears at session end

---

## Acceptance Criteria (from PRD)

- [x] Pomodoro timer dengan customizable durations (work: 25/50/90 min)
- [x] Session counter untuk daily/weekly stats
- [x] Mode "Deep Work" — full screen focus, block notifications indicator
- [x] Session history dengan duration dan task association

---

## Notes

- Session status: `active | completed | cancelled`
- Duration: integer (minutes)
- Timer runs client-side (setInterval)
- Server only stores start/end times
- Break reminders: visual toast, optional sound via Web Audio API
- Focus Mode: CSS overlay, not background process
