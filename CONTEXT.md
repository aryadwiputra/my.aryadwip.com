# ClarityFlow

Personal productivity platform helping users build productive habits incrementally (1% per day improvement).

## Language

**Journal Entry**:
One entry per user per day. Contains mood, energy level, and prompt responses (gratitude, intention, affirmation).
_Avoid_: Daily log, morning note

**Streak**:
Consecutive days a user completes a habit (journaling, daily task, focus session). Computed from entry timestamps.
_Avoid_: Consecutive count, habit chain

**Task**:
User-created work item with title, optional description, due date, priority (P1-P4), and status (todo, in_progress, completed).
_Avoid_: Todo, item, action

**Task View**:
Grouping of tasks by time horizon. "Today" = tasks due today. "This Week" = tasks due within 7 days. "Someday" = tasks without due date.
_Avoid_: Task list, task bucket

**Idea**:
Captured thought awaiting processing. Lives in the Inbox until user converts it to a Task or Note, or discards it.
_Avoid_: Thought, note draft, quick note

**Idea Inbox**:
Collection of all Ideas with "inbox" status. Source for processing into Tasks or Notes.
_Avoid_: Ideas list, captures

**Converted Idea**:
Idea that has been transformed into a Task or Note. Status changes to "converted"; not deleted. Preserved in history.
_Avoid_: Migrated idea, processed idea

**Note**:
Knowledge item with title, content (markdown), optional source attribution, and tags. Represents learning from books, articles, or personal insights.
_Avoid_: Knowledge entry, learning note, bookmark

**Focus Session**:
Timed work block (Pomodoro/Deep Work). Has a duration (25/50/90 min), status (active, completed, cancelled), and optional task association.
_Avoid_: Pomodoro session, work block, timer session

**Focus Mode**:
UI state where the app displays only the timer, minimising distractions. CSS overlay, not a background process.
_Avoid_: Deep work mode, distraction-free mode

**Dashboard**:
Home screen showing today's snapshot: pending tasks, focus time summary, habit streaks, and quick action buttons.
_Avoid_: Home, overview, today view

**Snapshot**:
Auto-generated summary of today's productivity data, loaded on each Dashboard visit. Includes manual refresh.
_Avoid_: Dashboard data, today summary
