import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { journals as journalsTable, tasks as tasksTable, focusSessions as sessionsTable, habits as habitsTable, habitLogs as habitLogsTable } from "../db/schema";
import { authMiddleware } from "../middleware/auth";
import type { AppEnv } from "../types";

const gamification = new Hono<AppEnv>().use("*", authMiddleware);

const dayKey = (ts: number) => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const XP = {
  journal: 20,
  task: 10,
  focus: 15,
  habit: 5,
};

const LEVELS = [
  { level: 1, min: 0, title: "Pemula" },
  { level: 2, min: 100, title: "Konsisten" },
  { level: 3, min: 300, title: "Rajin" },
  { level: 4, min: 700, title: "Produktif" },
  { level: 5, min: 1400, title: "Fokus" },
  { level: 6, min: 2400, title: "Mengalir" },
  { level: 7, min: 3800, title: "Master" },
  { level: 8, min: 5600, title: "Legenda" },
];

function levelFor(xp: number) {
  let lvl = LEVELS[0];
  for (const l of LEVELS) {
    if (xp >= l.min) lvl = l;
  }
  const next = LEVELS.find((l) => l.min > lvl.min);
  return {
    level: lvl.level,
    title: lvl.title,
    xp,
    nextLevelXp: next ? next.min : null,
    progress: next ? Math.min(1, (xp - lvl.min) / (next.min - lvl.min)) : 1,
  };
}

// GET /api/gamification
gamification.get("/", (c) => {
  const userId = c.get("userId");

  const journals = db.select().from(journalsTable).where(eq(journalsTable.userId, userId)).all();
  const tasks = db.select().from(tasksTable).where(eq(tasksTable.userId, userId)).all();
  const sessions = db.select().from(sessionsTable).where(eq(sessionsTable.userId, userId)).all();
  const habits = db.select().from(habitsTable).where(eq(habitsTable.userId, userId)).all();
  const habitLogs = db.select().from(habitLogsTable).where(eq(habitLogsTable.userId, userId)).all();

  // XP
  const xp =
    journals.length * XP.journal +
    tasks.filter((t) => t.status === "completed").length * XP.task +
    sessions.filter((s) => s.status === "completed").length * XP.focus +
    habitLogs.length * XP.habit;

  // No-scroll streak (self-reported days with noScroll=1)
  const noScrollDays = new Set(journals.filter((j) => j.noScroll).map((j) => j.date));
  let noScrollStreak = 0;
  if (noScrollDays.size > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    let cursor = noScrollDays.has(fmt(today)) ? today : new Date(today.getTime() - 86400000);
    while (noScrollDays.has(fmt(cursor))) {
      noScrollStreak++;
      cursor = new Date(cursor.getTime() - 86400000);
    }
  }

  // Badges
  const badges: { id: string; name: string; icon: string; earned: boolean }[] = [
    { id: "first-journal", name: "Journal Pertama", icon: "📓", earned: journals.length > 0 },
    { id: "journal-7", name: "7 Hari Journal", icon: "📚", earned: journals.length >= 7 },
    { id: "journal-30", name: "30 Hari Journal", icon: "🗂️", earned: journals.length >= 30 },
    { id: "task-10", name: "10 Task Selesai", icon: "✅", earned: tasks.filter((t) => t.status === "completed").length >= 10 },
    { id: "focus-5", name: "5 Sesi Fokus", icon: "⏱️", earned: sessions.filter((s) => s.status === "completed").length >= 5 },
    { id: "habit-7", name: "7 Habit Log", icon: "🔁", earned: habitLogs.length >= 7 },
    { id: "no-scroll-3", name: "3 Hari Anti-Doomscroll", icon: "🚫", earned: noScrollStreak >= 3 },
    { id: "evening-journal", name: "Refleksi Malam", icon: "🌙", earned: journals.some((j) => j.slot === "evening") },
  ];

  // Mood insight: average mood on days with focus vs without
  const moodVal = (m: string | null) => (m === "great" ? 5 : m === "good" ? 4 : m === "okay" ? 3 : m === "low" ? 2 : m === "bad" ? 1 : null);
  const dayHasFocus = new Set(sessions.filter((s) => s.status === "completed").map((s) => dayKey(s.endedAt ?? s.startedAt)));
  let focusMoodSum = 0, focusMoodCount = 0, noFocusMoodSum = 0, noFocusMoodCount = 0;
  for (const j of journals) {
    const v = moodVal(j.mood);
    if (v === null) continue;
    if (dayHasFocus.has(j.date)) { focusMoodSum += v; focusMoodCount++; }
    else { noFocusMoodSum += v; noFocusMoodCount++; }
  }
  const insight =
    focusMoodCount > 0 && noFocusMoodCount > 0
      ? {
          withFocus: focusMoodSum / focusMoodCount,
          withoutFocus: noFocusMoodSum / noFocusMoodCount,
          message:
            focusMoodSum / focusMoodCount >= noFocusMoodSum / noFocusMoodCount
              ? "Hari dengan sesi fokus cenderung mood-nya lebih baik ✨"
              : "Coba tambah sesi fokus — belum terlihat pengaruhnya ke mood.",
        }
      : null;

  return c.json(
    {
      ...levelFor(xp),
      xpBreakdown: { journal: journals.length * XP.journal, task: tasks.filter((t) => t.status === "completed").length * XP.task, focus: sessions.filter((s) => s.status === "completed").length * XP.focus, habit: habitLogs.length * XP.habit },
      noScrollStreak,
      badges,
      insight,
    },
    200,
  );
});

export default gamification;
