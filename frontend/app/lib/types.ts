export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: number;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export type Mood = "great" | "good" | "okay" | "low" | "bad";

export interface JournalPrompts {
  gratitude?: string;
  intention?: string;
  affirmation?: string;
}

export interface Journal {
  id: string;
  date: string; // YYYY-MM-DD
  mood?: Mood | null;
  energy?: number | null;
  prompts: JournalPrompts;
  createdAt: number;
  updatedAt: number;
}

export interface JournalStreaks {
  current: number;
  longest: number;
}

export interface JournalPayload {
  mood?: Mood;
  energy?: number;
  prompts?: JournalPrompts;
}

export type TaskPriority = "P1" | "P2" | "P3" | "P4";
export type TaskStatus = "todo" | "in_progress" | "completed";

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  tags: string[];
  completedAt?: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface TaskPayload {
  title?: string;
  description?: string | null;
  dueDate?: string | null;
  priority?: TaskPriority;
  tags?: string[];
}

export interface TaskStats {
  total: number;
  pending: number;
  completed: number;
  completedToday: number;
}

export type IdeaStatus = "inbox" | "converted" | "archived";

export interface Idea {
  id: string;
  content: string;
  status: IdeaStatus;
  createdAt: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  source?: string | null;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface NotePayload {
  title: string;
  content?: string;
  source?: string;
  tags?: string[];
}

export type SessionStatus = "active" | "completed" | "cancelled";

export interface FocusSession {
  id: string;
  taskId?: string | null;
  duration: number; // planned minutes
  startedAt: number;
  endedAt?: number | null;
  status: SessionStatus;
  createdAt: number;
}

export interface TodaySummary {
  sessions: FocusSession[];
  focusMinutes: number;
}

export interface SessionStats {
  todayMinutes: number;
  weekMinutes: number;
  todaySessions: number;
  completedToday: number;
  totalSessions: number;
}

export interface Streak {
  current: number;
  longest: number;
}

export interface DashboardDay {
  date: string;
  label: string;
  tasksCompleted: number;
  focusMinutes: number;
}

export interface DashboardData {
  today: {
    pendingTasks: number;
    completedToday: number;
    focusMinutes: number;
    journalDone: boolean;
    journalMood?: string | null;
  };
  streaks: {
    journal: Streak;
    task: Streak;
    focus: Streak;
  };
  week: DashboardDay[];
}