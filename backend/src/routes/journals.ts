import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../db";
import { journals as journalsTable } from "../db/schema";
import { authMiddleware } from "../middleware/auth";
import type { AppEnv } from "../types";

const journalRoutes = new Hono<AppEnv>().use("*", authMiddleware);

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD");
const moodSchema = z.enum(["great", "good", "okay", "low", "bad"]);
const promptsSchema = z.object({
  gratitude: z.string().optional(),
  intention: z.string().optional(),
  affirmation: z.string().optional(),
});

const createSchema = z.object({
  date: dateSchema,
  mood: moodSchema.optional(),
  energy: z.number().int().min(1).max(5).optional(),
  prompts: promptsSchema.optional(),
});

const updateSchema = z.object({
  mood: moodSchema.optional(),
  energy: z.number().int().min(1).max(5).optional(),
  prompts: promptsSchema.optional(),
});

type JournalRow = (typeof journalsTable)["$inferSelect"];
type Prompts = { gratitude?: string; intention?: string; affirmation?: string };

function parsePrompts(raw: string | null): Prompts {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Prompts;
  } catch {
    return {};
  }
}

function serialize(j: JournalRow) {
  return {
    id: j.id,
    date: j.date,
    mood: j.mood,
    energy: j.energy,
    prompts: parsePrompts(j.prompts),
    createdAt: j.createdAt,
    updatedAt: j.updatedAt,
  };
}

// GET /api/journals?from=&to=&date=
journalRoutes.get("/", (c) => {
  const userId = c.get("userId");
  const from = c.req.query("from");
  const to = c.req.query("to");
  const date = c.req.query("date");

  const rows = db.select().from(journalsTable).where(eq(journalsTable.userId, userId)).all();
  let filtered = rows;
  if (date) filtered = rows.filter((r) => r.date === date);
  else {
    if (from) filtered = filtered.filter((r) => r.date >= from);
    if (to) filtered = filtered.filter((r) => r.date <= to);
  }
  filtered.sort((a, b) => b.date.localeCompare(a.date));
  return c.json({ journals: filtered.map(serialize) }, 200);
});

// GET /api/journals/streaks
journalRoutes.get("/streaks", (c) => {
  const userId = c.get("userId");
  const rows = db.select().from(journalsTable).where(eq(journalsTable.userId, userId)).all();
  const dates = new Set(rows.map((r) => r.date));

  if (dates.size === 0) {
    return c.json({ current: 0, longest: 0 }, 200);
  }

  const dayMs = 24 * 60 * 60 * 1000;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  let current = 0;
  let cursor = dates.has(fmt(today)) ? today : new Date(today.getTime() - dayMs);
  while (dates.has(fmt(cursor))) {
    current++;
    cursor = new Date(cursor.getTime() - dayMs);
  }

  let longest = 0;
  const sorted = [...dates].sort();
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + "T00:00:00Z");
    const curr = new Date(sorted[i] + "T00:00:00Z");
    if (curr.getTime() - prev.getTime() === dayMs) {
      run++;
    } else {
      longest = Math.max(longest, run);
      run = 1;
    }
  }
  longest = Math.max(longest, run);

  return c.json({ current, longest }, 200);
});

// POST /api/journals
journalRoutes.post(
  "/",
  zValidator("json", createSchema),
  (c) => {
    const userId = c.get("userId");
    const { date, mood, energy, prompts } = c.req.valid("json");

    const existing = db
      .select()
      .from(journalsTable)
      .where(and(eq(journalsTable.userId, userId), eq(journalsTable.date, date)))
      .get();
    if (existing) {
      return c.json(
        { error: "Conflict", message: "Journal untuk tanggal ini sudah ada. Gunakan edit." },
        409,
      );
    }

    const now = Date.now();
    const id = nanoid();
    db.insert(journalsTable)
      .values({
        id,
        userId,
        date,
        mood: mood ?? null,
        energy: energy ?? null,
        prompts: prompts ? JSON.stringify(prompts) : null,
        createdAt: now,
        updatedAt: now,
      })
      .run();
    const row = db.select().from(journalsTable).where(eq(journalsTable.id, id)).get()!;
    return c.json({ journal: serialize(row) }, 201);
  },
);

// GET /api/journals/:id
journalRoutes.get("/:id", (c) => {
  const userId = c.get("userId");
  const row = db
    .select()
    .from(journalsTable)
    .where(and(eq(journalsTable.id, c.req.param("id")), eq(journalsTable.userId, userId)))
    .get();
  if (!row) return c.json({ error: "NotFound", message: "Journal tidak ditemukan" }, 404);
  return c.json({ journal: serialize(row) }, 200);
});

// PUT /api/journals/:id
journalRoutes.put(
  "/:id",
  zValidator("json", updateSchema),
  (c) => {
    const userId = c.get("userId");
    const id = c.req.param("id");
    const body = c.req.valid("json");

    const existing = db
      .select()
      .from(journalsTable)
      .where(and(eq(journalsTable.id, id), eq(journalsTable.userId, userId)))
      .get();
    if (!existing) return c.json({ error: "NotFound", message: "Journal tidak ditemukan" }, 404);

    db.update(journalsTable)
      .set({
        mood: body.mood !== undefined ? body.mood : existing.mood,
        energy: body.energy !== undefined ? body.energy : existing.energy,
        prompts: body.prompts ? JSON.stringify(body.prompts) : existing.prompts,
        updatedAt: Date.now(),
      })
      .where(and(eq(journalsTable.id, id), eq(journalsTable.userId, userId)))
      .run();
    const row = db.select().from(journalsTable).where(eq(journalsTable.id, id)).get()!;
    return c.json({ journal: serialize(row) }, 200);
  },
);

// DELETE /api/journals/:id
journalRoutes.delete("/:id", (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");
  const existing = db
    .select()
    .from(journalsTable)
    .where(and(eq(journalsTable.id, id), eq(journalsTable.userId, userId)))
    .get();
  if (!existing) return c.json({ error: "NotFound", message: "Journal tidak ditemukan" }, 404);
  db.delete(journalsTable).where(and(eq(journalsTable.id, id), eq(journalsTable.userId, userId))).run();
  return c.json({ message: "Journal dihapus" }, 200);
});

export default journalRoutes;