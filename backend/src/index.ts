import { serve } from "@hono/node-server";
import { app } from "./app";
import { ensureSchema } from "./db";
import { env } from "./lib/env";

ensureSchema();

const server = serve(
  {
    fetch: app.fetch,
    port: env.port,
  },
  (info) => {
    console.log(`ClarityFlow API running on http://localhost:${info.port}`);
  },
);

function shutdown() {
  server.close(() => process.exit(0));
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);