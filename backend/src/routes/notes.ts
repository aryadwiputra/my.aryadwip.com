import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { and, desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../db";
import { notes as notesTable } from "../db/schema";
import { authMiddleware } from "../middleware/auth";
import type { AppEnv } from "../types";

const noteRoutes = new Hono<AppEnv>().use("*", authMiddleware);

const noteSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi").max(200),
  content: z.string().default(""),
  source: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

const updateSchema = noteSchema.partial();

type NoteRow = (typeof notesTable)["$inferSelect"];

function parseTags(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

function serialize(n: NoteRow) {
  return {
    id: n.id,
    title: n.title,
    content: n.content,
    source: n.source,
    tags: parseTags(n.tags),
    createdAt: n.createdAt,
    updatedAt: n.updatedAt,
  };
}

// GET /api/notes?tag=&q=
noteRoutes.get("/", (c) => {
  const userId = c.get("userId");
  const tag = c.req.query("tag");
  const q = (c.req.query("q") ?? "").toLowerCase();

  const rows = db
    .select()
    .from(notesTable)
    .where(eq(notesTable.userId, userId))
    .orderBy(desc(notesTable.createdAt))
    .all();
  let filtered = rows;
  if (q) filtered = filtered.filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
  if (tag) filtered = filtered.filter((n) => parseTags(n.tags).includes(tag));
  return c.json({ notes: filtered.map(serialize) }, 200);
});

// GET /api/notes/search?q=
noteRoutes.get("/search", (c) => {
  const userId = c.get("userId");
  const q = (c.req.query("q") ?? "").toLowerCase();
  const rows = db.select().from(notesTable).where(eq(notesTable.userId, userId)).all();
  const filtered = q
    ? rows.filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
    : rows;
  return c.json({ notes: filtered.map(serialize) }, 200);
});

// POST /api/notes
noteRoutes.post("/", zValidator("json", noteSchema), (c) => {
  const userId = c.get("userId");
  const { title, content, source, tags } = c.req.valid("json");
  const id = nanoid();
  const now = Date.now();
  db.insert(notesTable)
    .values({
      id,
      userId,
      title: title.trim(),
      content,
      source: source ?? null,
      tags: JSON.stringify(tags),
      createdAt: now,
      updatedAt: now,
    })
    .run();
  const row = db.select().from(notesTable).where(eq(notesTable.id, id)).get()!;
  return c.json({ note: serialize(row) }, 201);
});

// GET /api/notes/:id
noteRoutes.get("/:id", (c) => {
  const userId = c.get("userId");
  const row = db
    .select()
    .from(notesTable)
    .where(and(eq(notesTable.id, c.req.param("id")), eq(notesTable.userId, userId)))
    .get();
  if (!row) return c.json({ error: "NotFound", message: "Note tidak ditemukan" }, 404);
  return c.json({ note: serialize(row) }, 200);
});

// PUT /api/notes/:id
noteRoutes.put("/:id", zValidator("json", updateSchema), (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");
  const body = c.req.valid("json");
  const existing = db
    .select()
    .from(notesTable)
    .where(and(eq(notesTable.id, id), eq(notesTable.userId, userId)))
    .get();
  if (!existing) return c.json({ error: "NotFound", message: "Note tidak ditemukan" }, 404);

  db.update(notesTable)
    .set({
      title: body.title !== undefined ? body.title.trim() : existing.title,
      content: body.content !== undefined ? body.content : existing.content,
      source: body.source !== undefined ? body.source : existing.source,
      tags: body.tags ? JSON.stringify(body.tags) : existing.tags,
      updatedAt: Date.now(),
    })
    .where(and(eq(notesTable.id, id), eq(notesTable.userId, userId)))
    .run();
  const row = db.select().from(notesTable).where(eq(notesTable.id, id)).get()!;
  return c.json({ note: serialize(row) }, 200);
});

// DELETE /api/notes/:id
noteRoutes.delete("/:id", (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");
  const existing = db
    .select()
    .from(notesTable)
    .where(and(eq(notesTable.id, id), eq(notesTable.userId, userId)))
    .get();
  if (!existing) return c.json({ error: "NotFound", message: "Note tidak ditemukan" }, 404);
  db.delete(notesTable).where(and(eq(notesTable.id, id), eq(notesTable.userId, userId))).run();
  return c.json({ message: "Note dihapus" }, 200);
});

export default noteRoutes;