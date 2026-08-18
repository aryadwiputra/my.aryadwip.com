import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { db } from "../db";
import {
  focusSessions as sessionsTable,
  ideas as ideasTable,
  journals as journalsTable,
  notes as notesTable,
  tasks as tasksTable,
  users as usersTable,
} from "../db/schema";
import { authMiddleware } from "../middleware/auth";
import { hashPassword, verifyPassword } from "../lib/password";
import type { AppEnv } from "../types";

const settings = new Hono<AppEnv>().use("*", authMiddleware);

const parseTags = (raw: string | null): string[] => {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
};
const parsePrompts = (raw: string | null) => {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

// GET /api/settings/export
settings.get("/export", (c) => {
  const userId = c.get("userId");

  const journals = db.select().from(journalsTable).where(eq(journalsTable.userId, userId)).all().map((j) => ({
    id: j.id,
    date: j.date,
    mood: j.mood,
    energy: j.energy,
    prompts: parsePrompts(j.prompts),
    createdAt: j.createdAt,
    updatedAt: j.updatedAt,
  }));
  const tasks = db.select().from(tasksTable).where(eq(tasksTable.userId, userId)).all().map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    dueDate: t.dueDate,
    priority: t.priority,
    status: t.status,
    tags: parseTags(t.tags),
    completedAt: t.completedAt,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  }));
  const ideas = db.select().from(ideasTable).where(eq(ideasTable.userId, userId)).all().map((i) => ({
    id: i.id,
    content: i.content,
    status: i.status,
    createdAt: i.createdAt,
  }));
  const notes = db.select().from(notesTable).where(eq(notesTable.userId, userId)).all().map((n) => ({
    id: n.id,
    title: n.title,
    content: n.content,
    source: n.source,
    tags: parseTags(n.tags),
    createdAt: n.createdAt,
    updatedAt: n.updatedAt,
  }));
  const sessions = db.select().from(sessionsTable).where(eq(sessionsTable.userId, userId)).all().map((s) => ({
    id: s.id,
    taskId: s.taskId,
    duration: s.duration,
    startedAt: s.startedAt,
    endedAt: s.endedAt,
    status: s.status,
    createdAt: s.createdAt,
  }));

  return c.json({
    exportedAt: new Date().toISOString(),
    version: 1,
    data: { journals, tasks, ideas, notes, sessions },
  });
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
  newPassword: z.string().min(8, "Password baru minimal 8 karakter"),
});

// POST /api/settings/change-password
settings.post("/change-password", zValidator("json", changePasswordSchema), async (c) => {
  const userId = c.get("userId");
  const { currentPassword, newPassword } = c.req.valid("json");
  const user = db.select().from(usersTable).where(eq(usersTable.id, userId)).get();
  if (!user) return c.json({ error: "NotFound", message: "User tidak ditemukan" }, 404);

  const ok = await verifyPassword(currentPassword, user.passwordHash);
  if (!ok) return c.json({ error: "Unauthorized", message: "Password saat ini salah" }, 401);

  const passwordHash = await hashPassword(newPassword);
  db.update(usersTable)
    .set({ passwordHash, updatedAt: Date.now() })
    .where(eq(usersTable.id, userId))
    .run();
  return c.json({ message: "Password berhasil diubah" }, 200);
});

// DELETE /api/settings/account
settings.delete("/account", (c) => {
  const userId = c.get("userId");
  const user = db.select().from(usersTable).where(eq(usersTable.id, userId)).get();
  if (!user) return c.json({ error: "NotFound", message: "User tidak ditemukan" }, 404);
  // Cascade deletes all related data (FK onDelete cascade).
  db.delete(usersTable).where(eq(usersTable.id, userId)).run();
  return c.json({ message: "Akun dan seluruh data dihapus" }, 200);
});

export default settings;