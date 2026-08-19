import { Hono } from "hono";
import { or, like, isNotNull } from "drizzle-orm";
import { db } from "../db";
import { journals, tasks, ideas, notes, habits } from "../db/schema";
import { authMiddleware } from "../middleware/auth";
import type { AppEnv } from "../types";

const search = new Hono<AppEnv>().use("*", authMiddleware);

search.get("/", (c) => {
  const userId = c.get("userId");
  const q = c.req.query("q") ?? "";

  if (!q || q.length < 2) {
    return c.json({ tasks: [], journals: [], ideas: [], notes: [], habits: [] }, 200);
  }

  const pattern = `%${q}%`;

  // Search tasks
  const taskRows = db
    .select()
    .from(tasks)
    .where(or(like(tasks.title, pattern), like(tasks.description ?? "", pattern)))
    .limit(10)
    .all();

  // Search journals
  const journalRows = db
    .select()
    .from(journals)
    .where(or(like(journals.date, pattern), isNotNull(journals.mood)))
    .limit(10)
    .all();

  // Search ideas
  const ideaRows = db
    .select()
    .from(ideas)
    .where(like(ideas.content, pattern))
    .limit(10)
    .all();

  // Search notes
  const noteRows = db
    .select()
    .from(notes)
    .where(or(like(notes.title, pattern), like(notes.content, pattern)))
    .limit(10)
    .all();

  // Search habits
  const habitRows = db
    .select()
    .from(habits)
    .where(like(habits.name, pattern))
    .limit(10)
    .all();

  return c.json({
    tasks: taskRows.map((t) => ({ id: t.id, title: t.title, status: t.status, type: "task" })),
    journals: journalRows.map((j) => ({ id: j.id, date: j.date, mood: j.mood, type: "journal" })),
    ideas: ideaRows.map((i) => ({ id: i.id, content: i.content, type: "idea" })),
    notes: noteRows.map((n) => ({ id: n.id, title: n.title, type: "note" })),
    habits: habitRows.map((h) => ({ id: h.id, name: h.name, type: "habit" })),
  }, 200);
});

export default search;
