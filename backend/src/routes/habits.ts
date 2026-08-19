import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../db";
import { habits as habitsTable, habitLogs as habitLogsTable } from "../db/schema";
import { authMiddleware } from "../middleware/auth";
import type { AppEnv } from "../types";

const habitRoutes = new Hono<AppEnv>().use("*", authMiddleware);

const createSchema = z.object({
  name: z.string().min(1, "Nama habit wajib diisi").max(100),
  icon: z.string().max(20).optional(),
  color: z.string().max(20).optional(),
});

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  icon: z.string().max(20).optional(),
  color: z.string().max(20).optional(),
});

const dateField = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD");

type HabitRow = (typeof habitsTable)["$inferSelect"];

function todayStr(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function serialize(h: HabitRow, logs: { date: string }[]) {
  const dates = new Set(logs.filter((l) => l.date).map((l) => l.date));
  // current streak: count consecutive days ending today (or yesterday if today not done)
  const done = new Set(logs.map((l) => l.date));
  let streak = 0;
  let cursor = new Date();
  // if today not done, start from yesterday
  if (!done.has(todayStr())) {
    cursor.setDate(cursor.getDate() - 1);
  }
  for (;;) {
    const m = String(cursor.getMonth() + 1).padStart(2, "0");
    const day = String(cursor.getDate()).padStart(2, "0");
    const key = `${cursor.getFullYear()}-${m}-${day}`;
    if (!done.has(key)) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return {
    id: h.id,
    name: h.name,
    icon: h.icon,
    color: h.color,
    createdAt: h.createdAt,
    updatedAt: h.updatedAt,
    doneToday: dates.has(todayStr()),
    streak,
    totalDone: logs.length,
  };
}

// GET /api/habits
habitRoutes.get("/", (c) => {
  const userId = c.get("userId");
  const habits = db.select().from(habitsTable).where(eq(habitsTable.userId, userId)).all();
  const logs = db
    .select({ habitId: habitLogsTable.habitId, date: habitLogsTable.date })
    .from(habitLogsTable)
    .where(eq(habitLogsTable.userId, userId))
    .all();
  const byHabit = new Map<string, { date: string }[]>();
  for (const l of logs) {
    const arr = byHabit.get(l.habitId) ?? [];
    arr.push({ date: l.date });
    byHabit.set(l.habitId, arr);
  }
  return c.json({ habits: habits.map((h) => serialize(h, byHabit.get(h.id) ?? [])) }, 200);
});

// POST /api/habits
habitRoutes.post("/", zValidator("json", createSchema), (c) => {
  const userId = c.get("userId");
  const { name, icon, color } = c.req.valid("json");
  const now = Date.now();
  const id = nanoid();
  db.insert(habitsTable)
    .values({ id, userId, name, icon: icon ?? "check", color: color ?? "blue", createdAt: now, updatedAt: now })
    .run();
  const row = db.select().from(habitsTable).where(eq(habitsTable.id, id)).get()!;
  return c.json({ habit: serialize(row, []) }, 201);
});

// PUT /api/habits/:id
habitRoutes.put("/:id", zValidator("json", updateSchema), (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");
  const body = c.req.valid("json");
  const existing = db
    .select()
    .from(habitsTable)
    .where(and(eq(habitsTable.id, id), eq(habitsTable.userId, userId)))
    .get();
  if (!existing) return c.json({ error: "NotFound", message: "Habit tidak ditemukan" }, 404);
  db.update(habitsTable)
    .set({
      name: body.name !== undefined ? body.name : existing.name,
      icon: body.icon !== undefined ? body.icon : existing.icon,
      color: body.color !== undefined ? body.color : existing.color,
      updatedAt: Date.now(),
    })
    .where(and(eq(habitsTable.id, id), eq(habitsTable.userId, userId)))
    .run();
  const row = db.select().from(habitsTable).where(eq(habitsTable.id, id)).get()!;
  const logs = db
    .select({ date: habitLogsTable.date })
    .from(habitLogsTable)
    .where(eq(habitLogsTable.habitId, id))
    .all();
  return c.json({ habit: serialize(row, logs) }, 200);
});

// DELETE /api/habits/:id
habitRoutes.delete("/:id", (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");
  const existing = db
    .select()
    .from(habitsTable)
    .where(and(eq(habitsTable.id, id), eq(habitsTable.userId, userId)))
    .get();
  if (!existing) return c.json({ error: "NotFound", message: "Habit tidak ditemukan" }, 404);
  db.delete(habitsTable).where(and(eq(habitsTable.id, id), eq(habitsTable.userId, userId))).run();
  return c.json({ message: "Habit dihapus" }, 200);
});

// POST /api/habits/:id/toggle  { date? }
habitRoutes.post("/:id/toggle", zValidator("json", z.object({ date: dateField.optional() })), (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");
  const { date } = c.req.valid("json");
  const target = date ?? todayStr();
  const existing = db
    .select()
    .from(habitsTable)
    .where(and(eq(habitsTable.id, id), eq(habitsTable.userId, userId)))
    .get();
  if (!existing) return c.json({ error: "NotFound", message: "Habit tidak ditemukan" }, 404);
  const log = db
    .select()
    .from(habitLogsTable)
    .where(and(eq(habitLogsTable.habitId, id), eq(habitLogsTable.date, target)))
    .get();
  if (log) {
    db.delete(habitLogsTable).where(eq(habitLogsTable.id, log.id)).run();
  } else {
    db.insert(habitLogsTable)
      .values({ id: nanoid(), habitId: id, userId, date: target, createdAt: Date.now() })
      .run();
  }
  const logs = db
    .select({ date: habitLogsTable.date })
    .from(habitLogsTable)
    .where(eq(habitLogsTable.habitId, id))
    .all();
  const row = db.select().from(habitsTable).where(eq(habitsTable.id, id)).get()!;
  return c.json({ habit: serialize(row, logs) }, 200);
});

export default habitRoutes;