import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { and, asc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../db";
import { tasks as tasksTable } from "../db/schema";
import { authMiddleware } from "../middleware/auth";
import type { AppEnv } from "../types";

const taskRoutes = new Hono<AppEnv>().use("*", authMiddleware);

const prioritySchema = z.enum(["P1", "P2", "P3", "P4"]);
const statusSchema = z.enum(["todo", "in_progress", "completed"]);
const dateField = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD");

const createSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi").max(200),
  description: z.string().optional(),
  dueDate: dateField.optional(),
  priority: prioritySchema.default("P2"),
  tags: z.array(z.string()).default([]),
});

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().nullable().optional(),
  dueDate: dateField.nullable().optional(),
  priority: prioritySchema.optional(),
  tags: z.array(z.string()).optional(),
});

type TaskRow = (typeof tasksTable)["$inferSelect"];

function parseTags(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

function serialize(t: TaskRow) {
  return {
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
  };
}

// GET /api/tasks?status=&priority=&view=
taskRoutes.get("/", (c) => {
  const userId = c.get("userId");
  const status = c.req.query("status");
  const priority = c.req.query("priority");

  let q = db.select().from(tasksTable).where(eq(tasksTable.userId, userId));
  const rows = q.all();
  let filtered = rows;
  if (status && status !== "all") filtered = filtered.filter((t) => t.status === status);
  if (priority) filtered = filtered.filter((t) => t.priority === priority);
  filtered.sort((a, b) => {
    if (a.status === "completed" && b.status !== "completed") return 1;
    if (b.status === "completed" && a.status !== "completed") return -1;
    if ((a.dueDate ?? "") < (b.dueDate ?? "")) return -1;
    if ((a.dueDate ?? "") > (b.dueDate ?? "")) return 1;
    return a.priority.localeCompare(b.priority);
  });
  return c.json({ tasks: filtered.map(serialize) }, 200);
});

// GET /api/tasks/stats
taskRoutes.get("/stats", (c) => {
  const userId = c.get("userId");
  const rows = db.select().from(tasksTable).where(eq(tasksTable.userId, userId)).all();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const completedToday = rows.filter(
    (t) => t.status === "completed" && t.completedAt !== null && t.completedAt >= startOfToday.getTime(),
  ).length;
  const pending = rows.filter((t) => t.status !== "completed").length;
  const total = rows.length;
  return c.json({ total, pending, completed: rows.filter((t) => t.status === "completed").length, completedToday }, 200);
});

// POST /api/tasks
taskRoutes.post(
  "/",
  zValidator("json", createSchema),
  (c) => {
    const userId = c.get("userId");
    const { title, description, dueDate, priority, tags } = c.req.valid("json");
    const now = Date.now();
    const id = nanoid();
    db.insert(tasksTable)
      .values({
        id,
        userId,
        title,
        description: description ?? null,
        dueDate: dueDate ?? null,
        priority,
        status: "todo",
        tags: JSON.stringify(tags),
        createdAt: now,
        updatedAt: now,
      })
      .run();
    const row = db.select().from(tasksTable).where(eq(tasksTable.id, id)).get()!;
    return c.json({ task: serialize(row) }, 201);
  },
);

// GET /api/tasks/:id
taskRoutes.get("/:id", (c) => {
  const userId = c.get("userId");
  const row = db
    .select()
    .from(tasksTable)
    .where(and(eq(tasksTable.id, c.req.param("id")), eq(tasksTable.userId, userId)))
    .get();
  if (!row) return c.json({ error: "NotFound", message: "Task tidak ditemukan" }, 404);
  return c.json({ task: serialize(row) }, 200);
});

// PUT /api/tasks/:id
taskRoutes.put(
  "/:id",
  zValidator("json", updateSchema),
  (c) => {
    const userId = c.get("userId");
    const id = c.req.param("id");
    const body = c.req.valid("json");
    const existing = db
      .select()
      .from(tasksTable)
      .where(and(eq(tasksTable.id, id), eq(tasksTable.userId, userId)))
      .get();
    if (!existing) return c.json({ error: "NotFound", message: "Task tidak ditemukan" }, 404);

    db.update(tasksTable)
      .set({
        title: body.title !== undefined ? body.title : existing.title,
        description: body.description !== undefined ? body.description : existing.description,
        dueDate:
          body.dueDate !== undefined ? body.dueDate : existing.dueDate,
        priority: body.priority !== undefined ? body.priority : existing.priority,
        tags: body.tags ? JSON.stringify(body.tags) : existing.tags,
        updatedAt: Date.now(),
      })
      .where(and(eq(tasksTable.id, id), eq(tasksTable.userId, userId)))
      .run();
    const row = db.select().from(tasksTable).where(eq(tasksTable.id, id)).get()!;
    return c.json({ task: serialize(row) }, 200);
  },
);

// DELETE /api/tasks/:id
taskRoutes.delete("/:id", (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");
  const existing = db
    .select()
    .from(tasksTable)
    .where(and(eq(tasksTable.id, id), eq(tasksTable.userId, userId)))
    .get();
  if (!existing) return c.json({ error: "NotFound", message: "Task tidak ditemukan" }, 404);
  db.delete(tasksTable).where(and(eq(tasksTable.id, id), eq(tasksTable.userId, userId))).run();
  return c.json({ message: "Task dihapus" }, 200);
});

// PATCH /api/tasks/:id/complete
taskRoutes.patch("/:id/complete", (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");
  const existing = db
    .select()
    .from(tasksTable)
    .where(and(eq(tasksTable.id, id), eq(tasksTable.userId, userId)))
    .get();
  if (!existing) return c.json({ error: "NotFound", message: "Task tidak ditemukan" }, 404);
  const now = Date.now();
  db.update(tasksTable)
    .set({ status: "completed", completedAt: now, updatedAt: now })
    .where(and(eq(tasksTable.id, id), eq(tasksTable.userId, userId)))
    .run();
  const row = db.select().from(tasksTable).where(eq(tasksTable.id, id)).get()!;
  return c.json({ task: serialize(row) }, 200);
});

// PATCH /api/tasks/:id/uncomplete
taskRoutes.patch("/:id/uncomplete", (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");
  const existing = db
    .select()
    .from(tasksTable)
    .where(and(eq(tasksTable.id, id), eq(tasksTable.userId, userId)))
    .get();
  if (!existing) return c.json({ error: "NotFound", message: "Task tidak ditemukan" }, 404);
  db.update(tasksTable)
    .set({ status: "todo", completedAt: null, updatedAt: Date.now() })
    .where(and(eq(tasksTable.id, id), eq(tasksTable.userId, userId)))
    .run();
  const row = db.select().from(tasksTable).where(eq(tasksTable.id, id)).get()!;
  return c.json({ task: serialize(row) }, 200);
});

export default taskRoutes;