import type { MiddlewareHandler } from "hono";
import { verifyAccessToken } from "../lib/jwt";

export const role = {
  user: "user",
} as const;

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const header = c.req.header("Authorization");
  if (!header?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized", message: "Missing access token" }, 401);
  }
  const token = header.slice("Bearer ".length).trim();
  const payload = await verifyAccessToken(token);
  if (!payload?.sub) {
    return c.json({ error: "Unauthorized", message: "Invalid or expired access token" }, 401);
  }
  c.set("userId", payload.sub);
  await next();
};