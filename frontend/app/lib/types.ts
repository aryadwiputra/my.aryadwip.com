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
  // morning
  gratitude?: string;
  intention?: string;
  affirmation?: string;
  // evening
  win?: string;
  wentWell?: string;
  toImprove?: string;
  lesson?: string;
}

export type JournalSlot = "morning" | "evening";

export interface Journal {
  id: string;
  date: string;
  slot: JournalSlot;
  mood?: string | null;
  energy?: number | null;
  prompts: JournalPrompts;
  noScroll?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface JournalStreaks {
  current: number;
  longest: number;
}

export interface JournalPayload {
  slot?: JournalSlot;
  mood?: Mood;
  energy?: number;
  noScroll?: boolean;
  prompts: JournalPrompts;
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
  moodTrend: { date: string; mood: string; energy: number | null }[];
  stats: {
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    totalSessions: number;
    totalFocusMinutes: number;
    totalJournals: number;
    totalHabits: number;
  };
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  createdAt: number;
  updatedAt: number;
  doneToday: boolean;
  streak: number;
  totalDone: number;
}

export interface HabitPayload {
  name: string;
  icon?: string;
  color?: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  earned: boolean;
}

export interface GamificationData {
  level: number;
  title: string;
  xp: number;
  nextLevelXp: number | null;
  progress: number;
  xpBreakdown: { journal: number; task: number; focus: number; habit: number };
  noScrollStreak: number;
  badges: Badge[];
  insight: { withFocus: number; withoutFocus: number; message: string } | null;
}