# Sprint 07: Dashboard & Analytics

**Status**: planned
**Epic**: Epik 6 — Dashboard & Analytics
**Duration**: 1 session (~2-3 hours)
**Goal**: Today's snapshot, streaks, quick actions, weekly review.

---

## Tasks

### S07-01: Dashboard API
- [ ] `GET /api/dashboard` — get all dashboard data
- [ ] `GET /api/dashboard/today` — get today's summary
- [ ] Returns: pending tasks, completed tasks, focus time, streaks, quick actions
- [ ] All routes protected

### S07-02: Dashboard Feature — Query Setup
- [ ] TanStack Query hooks:
  - [ ] `useDashboard()` — fetch all dashboard data
  - [ ] `useTodaySnapshot()` — fetch today's summary

### S07-03: Today's Snapshot Card
- [ ] `frontend/src/features/dashboard/components/SnapshotCard.tsx`
- [ ] Pending tasks count
- [ ] Completed tasks today
- [ ] Focus time today
- [ ] Journal status (done/not done)
- [ ] Refresh button

### S07-04: Streak Tracker
- [ ] `frontend/src/features/dashboard/components/StreakTracker.tsx`
- [ ] Journal streak (consecutive days)
- [ ] Task streak (tasks completed every day)
- [ ] Focus streak (focus sessions every day)
- [ ] Visual: flame icon + count

### S07-05: Quick Actions
- [ ] `frontend/src/features/dashboard/components/QuickActions.tsx`
- [ ] Quick capture button → opens idea modal
- [ ] Start timer button → navigates to /timer
- [ ] New task button → opens task form
- [ ] Write journal button → navigates to /journal

### S07-06: Weekly Overview
- [ ] `frontend/src/features/dashboard/components/WeeklyOverview.tsx`
- [ ] Task completion chart (7 days bar chart)
- [ ] Focus hours trend (7 days line chart)
- [ ] Using recharts or similar

### S07-07: Weekly Review (Basic)
- [ ] `frontend/src/features/dashboard/components/WeeklyReview.tsx`
- [ ] Template prompts:
  - [ ] What went well this week?
  - [ ] What could be improved?
  - [ ] Top 3 priorities for next week?
- [ ] Simple textarea inputs
- [ ] Save as note or journal entry (optional)

### S07-08: Dashboard Page
- [ ] `frontend/src/features/dashboard/DashboardPage.tsx`
- [ ] Layout:
  - [ ] Top: Welcome message + date
  - [ ] Left: Snapshot card, Streak tracker
  - [ ] Right: Quick actions, Weekly overview
  - [ ] Bottom: Weekly review (collapsible)
- [ ] Responsive: stack on mobile

---

## Verification Checklist

- [ ] Dashboard loads with today's data
- [ ] Pending tasks count matches actual
- [ ] Completed tasks count matches actual
- [ ] Focus time matches today's total
- [ ] Journal streak shows correct count
- [ ] Quick actions navigate correctly
- [ ] Quick capture from dashboard works
- [ ] Weekly chart shows last 7 days
- [ ] Refresh updates all data

---

## Acceptance Criteria (from PRD)

- [x] Daily summary: tasks completed, focus time, journal streak
- [x] Streak tracker untuk: journaling, daily task, focus sessions
- [x] Simple charts: task completion trend, focus hours trend
- [x] Quick action buttons: quick capture, start timer, new task

---

## Notes

- Charts: use `recharts` library
- Streaks computed server-side from data
- Dashboard data cached briefly (no real-time needed)
- Weekly review: optional MVP feature, skip if time constrained
