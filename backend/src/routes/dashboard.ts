import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { journals as journalsTable, tasks as tasksTable, focusSessions as sessionsTable } from "../db/schema";
import { authMiddleware } from "../middleware/auth";
import type { AppEnv } from "../types";

const dashboard = new Hono<AppEnv>().use("*", authMiddleware);

const pad = (n: number) => String(n).padStart(2, "0");
function dayKey(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function fmt(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function startOfToday(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function currentStreak(dates: Set<string>, todayKey: string): number {
  if (dates.size === 0) return 0;
  const dayMs = 24 * 60 * 60 * 1000;
  const today = new Date(todayKey + "T00:00:00Z");
  let cursor = dates.has(todayKey) ? today : new Date(today.getTime() - dayMs);
  let streak = 0;
  while (dates.has(fmt(cursor))) {
    streak++;
    cursor = new Date(cursor.getTime() - dayMs);
  }
  return streak;
}

function longestStreak(dateList: string[]): number {
  const sorted = [...new Set(dateList)].sort();
  if (sorted.length === 0) return 0;
  const dayMs = 24 * 60 * 60 * 1000;
  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + "T00:00:00Z");
    const curr = new Date(sorted[i] + "T00:00:00Z");
    if (curr.getTime() - prev.getTime() === dayMs) run++;
    else {
      longest = Math.max(longest, run);
      run = 1;
    }
  }
  return Math.max(longest, run);
}

dashboard.get("/", (c) => {
  const userId = c.get("userId");
  const now = Date.now();
  const todayStart = startOfToday();
  const todayKey = dayKey(now);

  const journals = db.select().from(journalsTable).where(eq(journalsTable.userId, userId)).all();
  const tasks = db.select().from(tasksTable).where(eq(tasksTable.userId, userId)).all();
  const sessions = db.select().from(sessionsTable).where(eq(sessionsTable.userId, userId)).all();

  // Today's snapshot
  const pendingTasks = tasks.filter((t) => t.status !== "completed").length;
  const completedToday = tasks.filter((t) => t.status === "completed" && t.completedAt !== null && t.completedAt >= todayStart).length;
  const todaySessions = sessions.filter((s) => s.startedAt >= todayStart);
  const focusMinutes = Math.round(
    todaySessions
      .filter((s) => s.status === "completed" && s.endedAt)
      .reduce((sum, s) => sum + (s.endedAt! - s.startedAt) / 60000, 0),
  );
  const todayJournal = journals.find((j) => j.date === todayKey);
  const streaks = {
    journal: { current: currentStreak(new Set(journals.map((j) => j.date)), todayKey), longest: longestStreak(journals.map((j) => j.date)) },
    task: {
      current: currentStreak(new Set(tasks.filter((t) => t.completedAt).map((t) => dayKey(t.completedAt!))), todayKey),
      longest: longestStreak(tasks.filter((t) => t.completedAt).map((t) => dayKey(t.completedAt!))),
    },
    focus: {
      current: currentStreak(new Set(sessions.filter((s) => s.status === "completed").map((s) => dayKey(s.endedAt ?? s.startedAt))), todayKey),
      longest: longestStreak(sessions.filter((s) => s.status === "completed").map((s) => dayKey(s.endedAt ?? s.startedAt))),
    },
  };

  // Weekly (last 7 days)
  const week: { date: string; label: string; tasksCompleted: number; focusMinutes: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(todayStart - i * 24 * 60 * 60 * 1000);
    const key = fmt(d);
    const dayStart = new Date(`${key}T00:00:00`).getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;
    const taskCount = tasks.filter((t) => t.completedAt !== null && t.completedAt >= dayStart && t.completedAt <= dayEnd).length;
    const daySessions = sessions.filter((s) => s.status === "completed" && s.endedAt !== null && s.endedAt >= dayStart && s.endedAt <= dayEnd);
    const focMin = Math.round(daySessions.reduce((sum, s) => sum + ((s.endedAt! - s.startedAt) / 60000), 0));
    week.push({ date: key, label: key.slice(5), tasksCompleted: taskCount, focusMinutes: focMin });
  }

  return c.json(
    {
      today: {
        pendingTasks,
        completedToday,
        focusMinutes,
        journalDone: Boolean(todayJournal),
        journalMood: todayJournal?.mood ?? null,
      },
      streaks,
      week,
    },
    200,
  );
});

export default dashboard;