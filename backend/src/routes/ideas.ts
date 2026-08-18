import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { and, desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../db";
import { ideas as ideasTable, notes as notesTable, tasks as tasksTable } from "../db/schema";
import { authMiddleware } from "../middleware/auth";
import type { AppEnv } from "../types";

const ideaRoutes = new Hono<AppEnv>().use("*", authMiddleware);

const contentSchema = z.object({ content: z.string().min(1, "Konten wajib diisi").max(2000) });

type IdeaRow = (typeof ideasTable)["$inferSelect"];

function serialize(i: IdeaRow) {
  return { id: i.id, content: i.content, status: i.status, createdAt: i.createdAt };
}

// GET /api/ideas?status=inbox
ideaRoutes.get("/", (c) => {
  const userId = c.get("userId");
  const status = c.req.query("status") ?? "inbox";
  const rows = db
    .select()
    .from(ideasTable)
    .where(and(eq(ideasTable.userId, userId), eq(ideasTable.status, status)))
    .orderBy(desc(ideasTable.createdAt))
    .all();
  return c.json({ ideas: rows.map(serialize) }, 200);
});

// POST /api/ideas
ideaRoutes.post("/", zValidator("json", contentSchema), (c) => {
  const userId = c.get("userId");
  const { content } = c.req.valid("json");
  const id = nanoid();
  const now = Date.now();
  db.insert(ideasTable).values({ id, userId, content: content.trim(), status: "inbox", createdAt: now }).run();
  const row = db.select().from(ideasTable).where(eq(ideasTable.id, id)).get()!;
  return c.json({ idea: serialize(row) }, 201);
});

// PUT /api/ideas/:id
ideaRoutes.put("/:id", zValidator("json", contentSchema), (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");
  const { content } = c.req.valid("json");
  const existing = db
    .select()
    .from(ideasTable)
    .where(and(eq(ideasTable.id, id), eq(ideasTable.userId, userId)))
    .get();
  if (!existing) return c.json({ error: "NotFound", message: "Idea tidak ditemukan" }, 404);
  db.update(ideasTable).set({ content: content.trim() }).where(and(eq(ideasTable.id, id), eq(ideasTable.userId, userId))).run();
  const row = db.select().from(ideasTable).where(eq(ideasTable.id, id)).get()!;
  return c.json({ idea: serialize(row) }, 200);
});

// DELETE /api/ideas/:id
ideaRoutes.delete("/:id", (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");
  const existing = db
    .select()
    .from(ideasTable)
    .where(and(eq(ideasTable.id, id), eq(ideasTable.userId, userId)))
    .get();
  if (!existing) return c.json({ error: "NotFound", message: "Idea tidak ditemukan" }, 404);
  db.delete(ideasTable).where(and(eq(ideasTable.id, id), eq(ideasTable.userId, userId))).run();
  return c.json({ message: "Idea dihapus" }, 200);
});

function markConverted(id: string, userId: string) {
  db.update(ideasTable)
    .set({ status: "converted" })
    .where(and(eq(ideasTable.id, id), eq(ideasTable.userId, userId)))
    .run();
}

// POST /api/ideas/:id/convert-to-task
ideaRoutes.post("/:id/convert-to-task", (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");
  const idea = db
    .select()
    .from(ideasTable)
    .where(and(eq(ideasTable.id, id), eq(ideasTable.userId, userId)))
    .get();
  if (!idea) return c.json({ error: "NotFound", message: "Idea tidak ditemukan" }, 404);

  const taskId = nanoid();
  const now = Date.now();
  const title = idea.content.slice(0, 200);
  db.insert(tasksTable)
    .values({ id: taskId, userId, title, status: "todo", priority: "P2", createdAt: now, updatedAt: now })
    .run();
  markConverted(id, userId);
  const task = db.select().from(tasksTable).where(eq(tasksTable.id, taskId)).get()!;
  return c.json({ task: { id: task.id, title: task.title, priority: task.priority, status: task.status, dueDate: task.dueDate, tags: [], createdAt: task.createdAt, updatedAt: task.updatedAt } }, 201);
});

// POST /api/ideas/:id/convert-to-note
ideaRoutes.post("/:id/convert-to-note", (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");
  const idea = db
    .select()
    .from(ideasTable)
    .where(and(eq(ideasTable.id, id), eq(ideasTable.userId, userId)))
    .get();
  if (!idea) return c.json({ error: "NotFound", message: "Idea tidak ditemukan" }, 404);

  const noteId = nanoid();
  const now = Date.now();
  db.insert(notesTable)
    .values({
      id: noteId,
      userId,
      title: idea.content.slice(0, 200),
      content: idea.content,
      tags: "[]",
      createdAt: now,
      updatedAt: now,
    })
    .run();
  markConverted(id, userId);
  const note = db.select().from(notesTable).where(eq(notesTable.id, noteId)).get()!;
  return c.json(
    {
      note: { id: note.id, title: note.title, content: note.content, source: note.source, tags: [], createdAt: note.createdAt, updatedAt: note.updatedAt },
    },
    201,
  );
});

export default ideaRoutes;