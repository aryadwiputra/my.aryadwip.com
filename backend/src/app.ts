import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { env } from "./lib/env";
import auth from "./routes/auth";
import journals from "./routes/journals";
import tasks from "./routes/tasks";
import type { AppEnv } from "./types";

export function createApp() {
  const app = new Hono<AppEnv>()
    .use("*", cors({ origin: env.corsOrigin, credentials: true }))
    .use("*", logger());

  app.get("/", (c) => c.json({ name: "ClarityFlow API", version: "0.1.0" }));

  app.route("/api/auth", auth);
  app.route("/api/journals", journals);
  app.route("/api/tasks", tasks);

  app.notFound((c) => c.json({ error: "NotFound", message: "Route tidak ditemukan" }, 404));

  app.onError((err, c) => {
    console.error(err);
    return c.json({ error: "InternalServerError", message: "Terjadi kesalahan server" }, 500);
  });

  return app;
}

export const app = createApp();