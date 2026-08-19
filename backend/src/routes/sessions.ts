import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { and, desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../db";
import { focusSessions as sessionsTable } from "../db/schema";
import { authMiddleware } from "../middleware/auth";
import type { AppEnv } from "../types";

const sessionRoutes = new Hono<AppEnv>().use("*", authMiddleware);

const createSchema = z.object({
  duration: z.number().int().min(1).max(600, "Durasi maksimal 600 menit"),
  taskId: z.string().optional(),
});

const updateSchema = z.object({
  status: z.enum(["active", "completed", "cancelled"]),
});

type SessionRow = (typeof sessionsTable)["$inferSelect"];

function serialize(s: SessionRow) {
  return {
    id: s.id,
    taskId: s.taskId,
    duration: s.duration,
    startedAt: s.startedAt,
    endedAt: s.endedAt,
    status: s.status,
    createdAt: s.createdAt,
  };
}

const startOfDay = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

// GET /api/sessions
sessionRoutes.get("/", (c) => {
  const userId = c.get("userId");
  const rows = db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.userId, userId))
    .orderBy(desc(sessionsTable.startedAt))
    .all();
  return c.json({ sessions: rows.map(serialize) }, 200);
});

// GET /api/sessions/today
sessionRoutes.get("/today", (c) => {
  const userId = c.get("userId");
  const dayStart = startOfDay();
  const rows = db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.userId, userId))
    .all()
    .filter((s) => s.startedAt >= dayStart);
  const focusMinutes = rows
    .filter((s) => s.status === "completed" && s.endedAt)
    .reduce((sum, s) => sum + Math.round(((s.endedAt! - s.startedAt) / 60000) * 100) / 100, 0);
  rows.sort((a, b) => b.startedAt - a.startedAt);
  return c.json({ sessions: rows.map(serialize), focusMinutes: Math.round(focusMinutes) }, 200);
});

// GET /api/sessions/stats
sessionRoutes.get("/stats", (c) => {
  const userId = c.get("userId");
  const rows = db.select().from(sessionsTable).where(eq(sessionsTable.userId, userId)).all();
  const dayStart = startOfDay();
  const weekStart = dayStart - 6 * 24 * 60 * 60 * 1000;

  const todayRows = rows.filter((s) => s.startedAt >= dayStart);
  const weekRows = rows.filter((s) => s.startedAt >= weekStart);

  const focusMinutes = (list: SessionRow[]) =>
    list
      .filter((s) => s.status === "completed" && s.endedAt)
      .reduce((sum, s) => sum + Math.round(((s.endedAt! - s.startedAt) / 60000) * 100) / 100, 0);

  return c.json(
    {
      todayMinutes: Math.round(focusMinutes(todayRows)),
      weekMinutes: Math.round(focusMinutes(weekRows)),
      todaySessions: todayRows.length,
      completedToday: todayRows.filter((s) => s.status === "completed").length,
      totalSessions: rows.length,
    },
    200,
  );
});

// POST /api/sessions
sessionRoutes.post("/", zValidator("json", createSchema), (c) => {
  const userId = c.get("userId");
  const { duration, taskId } = c.req.valid("json");
  const id = nanoid();
  const now = Date.now();

  // Auto-cancel any lingering active session before starting a new one,
  // so the user never ends up with two active sessions.
  const active = db
    .select()
    .from(sessionsTable)
    .where(and(eq(sessionsTable.userId, userId), eq(sessionsTable.status, "active")))
    .all();
  for (const s of active) {
    db.update(sessionsTable)
      .set({ status: "cancelled", endedAt: now })
      .where(eq(sessionsTable.id, s.id))
      .run();
  }

  db.insert(sessionsTable)
    .values({ id, userId, taskId: taskId ?? null, duration, startedAt: now, status: "active", createdAt: now })
    .run();
  const row = db.select().from(sessionsTable).where(eq(sessionsTable.id, id)).get()!;
  return c.json({ session: serialize(row) }, 201);
});

// PATCH /api/sessions/:id  (mark completed / cancelled)
sessionRoutes.patch("/:id", zValidator("json", updateSchema), (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");
  const { status } = c.req.valid("json");
  const existing = db
    .select()
    .from(sessionsTable)
    .where(and(eq(sessionsTable.id, id), eq(sessionsTable.userId, userId)))
    .get();
  if (!existing) return c.json({ error: "NotFound", message: "Sesi tidak ditemukan" }, 404);

  const endedAt = status === "active" ? null : Date.now();
  db.update(sessionsTable)
    .set({ status, endedAt })
    .where(and(eq(sessionsTable.id, id), eq(sessionsTable.userId, userId)))
    .run();
  const row = db.select().from(sessionsTable).where(eq(sessionsTable.id, id)).get()!;
  return c.json({ session: serialize(row) }, 200);
});

export default sessionRoutes;