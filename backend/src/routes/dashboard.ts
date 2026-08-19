import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../db";
import { journals as journalsTable, tasks as tasksTable, focusSessions as sessionsTable, weeklyReviews as reviewsTable, habits as habitsTable, habitLogs as habitLogsTable } from "../db/schema";
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

  // Mood trend (last 30 days)
  const moodTrend: { date: string; mood: string; energy: number | null }[] = journals
    .filter((j) => {
      const jDate = new Date(j.date + "T00:00:00").getTime();
      return jDate >= todayStart - 30 * 24 * 60 * 60 * 1000;
    })
    .map((j) => ({ date: j.date, mood: j.mood ?? "okay", energy: j.energy }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Stats summary
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const totalSessions = sessions.filter((s) => s.status === "completed").length;
  const totalFocusMinutes = Math.round(sessions.filter((s) => s.status === "completed").reduce((sum, s) => sum + ((s.endedAt ?? s.startedAt) - s.startedAt) / 60000, 0));
  const totalJournals = journals.length;
  const totalHabits = db.select({ count: habitsTable.id }).from(habitsTable).where(eq(habitsTable.userId, userId)).all().length;

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
      moodTrend,
      stats: {
        totalTasks,
        completedTasks,
        completionRate,
        totalSessions,
        totalFocusMinutes,
        totalJournals,
        totalHabits,
      },
    },
    200,
  );
});

// GET /api/dashboard/reviews?weekStart=YYYY-MM-DD
dashboard.get("/reviews", (c) => {
  const userId = c.get("userId");
  const weekStart = c.req.query("weekStart");
  if (!weekStart) {
    return c.json({ error: "weekStart query parameter required" }, 400);
  }
  const row = db
    .select()
    .from(reviewsTable)
    .where(and(eq(reviewsTable.userId, userId), eq(reviewsTable.weekStart, weekStart)))
    .get();
  if (!row) {
    return c.json({ review: null }, 200);
  }
  return c.json({ review: { ...row } }, 200);
});

// POST /api/dashboard/reviews
dashboard.post(
  "/reviews",
  zValidator("json", z.object({
    weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "weekStart format YYYY-MM-DD"),
    whatWentWell: z.string().optional(),
    whatToImprove: z.string().optional(),
    nextPriorities: z.string().optional(),
  })),
  (c) => {
    const userId = c.get("userId");
    const { weekStart, whatWentWell, whatToImprove, nextPriorities } = c.req.valid("json");
    const now = Date.now();
    const existing = db
      .select()
      .from(reviewsTable)
      .where(and(eq(reviewsTable.userId, userId), eq(reviewsTable.weekStart, weekStart)))
      .get();
    if (existing) {
      db.update(reviewsTable)
        .set({
          whatWentWell: whatWentWell ?? existing.whatWentWell,
          whatToImprove: whatToImprove ?? existing.whatToImprove,
          nextPriorities: nextPriorities ?? existing.nextPriorities,
          updatedAt: now,
        })
        .where(and(eq(reviewsTable.userId, userId), eq(reviewsTable.weekStart, weekStart)))
        .run();
      const updated = db.select().from(reviewsTable).where(eq(reviewsTable.id, existing.id)).get()!;
      return c.json({ review: updated }, 200);
    }
    const id = nanoid();
    db.insert(reviewsTable).values({
      id,
      userId,
      weekStart,
      whatWentWell: whatWentWell ?? null,
      whatToImprove: whatToImprove ?? null,
      nextPriorities: nextPriorities ?? null,
      createdAt: now,
      updatedAt: now,
    }).run();
    const row = db.select().from(reviewsTable).where(eq(reviewsTable.id, id)).get()!;
    return c.json({ review: row }, 201);
  },
);

// GET /api/dashboard/calendar?month=YYYY-MM
dashboard.get("/calendar", (c) => {
  const userId = c.get("userId");
  const month = c.req.query("month");
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return c.json({ error: "month query parameter required (YYYY-MM)" }, 400);
  }
  const [y, m] = month.split("-").map(Number);
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 0); // last day of month
  const pad = (n: number) => String(n).padStart(2, "0");
  const startKey = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`;
  const endKey = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}`;

  const tasks = db.select().from(tasksTable).where(eq(tasksTable.userId, userId)).all();
  const journals = db.select().from(journalsTable).where(eq(journalsTable.userId, userId)).all();
  const habitLogs = db.select().from(habitLogsTable).where(eq(habitLogsTable.userId, userId)).all();

  const monthTasks = tasks.filter((t) => t.dueDate && t.dueDate >= startKey && t.dueDate <= endKey);
  const monthJournals = journals.filter((j) => j.date >= startKey && j.date <= endKey);
  const monthHabitLogs = habitLogs.filter((l) => l.date >= startKey && l.date <= endKey);

  return c.json({
    tasks: monthTasks.map((t) => ({ id: t.id, date: t.dueDate, title: t.title, status: t.status, priority: t.priority })),
    journals: monthJournals.map((j) => ({ id: j.id, date: j.date, mood: j.mood })),
    habitLogs: monthHabitLogs.map((l) => ({ id: l.id, date: l.date, habitId: l.habitId })),
  }, 200);
});

export default dashboard;