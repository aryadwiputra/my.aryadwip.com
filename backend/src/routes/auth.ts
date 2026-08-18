import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { createHash, randomBytes } from "node:crypto";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, refreshTokens, type User } from "../db/schema";
import { hashPassword, verifyPassword } from "../lib/password";
import { signAccessToken } from "../lib/jwt";
import { env } from "../lib/env";
import { authMiddleware } from "../middleware/auth";
import type { AppEnv } from "../types";

const auth = new Hono<AppEnv>();

const registerSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  name: z.string().min(1, "Nama wajib diisi"),
});

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token wajib diisi"),
});

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function issueRefreshTokenPair() {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashToken(token) };
}

function publicUser(u: User) {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    createdAt: u.createdAt,
  };
}

async function issueTokens(user: User) {
  const accessToken = await signAccessToken(user.id);
  const { token, hash } = issueRefreshTokenPair();
  await db.insert(refreshTokens).values({
    id: nanoid(),
    userId: user.id,
    tokenHash: hash,
    expiresAt: Date.now() + env.refreshTokenTtlMs,
    createdAt: Date.now(),
  });
  return { accessToken, refreshToken: token };
}

auth.post(
  "/register",
  zValidator("json", registerSchema),
  async (c) => {
    const { email, password, name } = c.req.valid("json");
    const normalizedEmail = email.trim().toLowerCase();

    const existing = db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .get();
    if (existing) {
      return c.json({ error: "Conflict", message: "Email sudah terdaftar" }, 409);
    }

    const id = nanoid();
    const now = Date.now();
    const passwordHash = await hashPassword(password);
    const user = {
      id,
      email: normalizedEmail,
      passwordHash,
      name: name.trim(),
      createdAt: now,
      updatedAt: now,
    };
    db.insert(users).values(user).run();

    const tokens = await issueTokens(user);
    return c.json({ user: publicUser(user), ...tokens }, 201);
  },
);

auth.post(
  "/login",
  zValidator("json", loginSchema),
  async (c) => {
    const { email, password } = c.req.valid("json");
    const normalizedEmail = email.trim().toLowerCase();

    const user = db.select().from(users).where(eq(users.email, normalizedEmail)).get();
    if (!user) {
      return c.json({ error: "Unauthorized", message: "Email atau password salah" }, 401);
    }
    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return c.json({ error: "Unauthorized", message: "Email atau password salah" }, 401);
    }

    const tokens = await issueTokens(user);
    return c.json({ user: publicUser(user), ...tokens }, 200);
  },
);

auth.post(
  "/refresh",
  zValidator("json", refreshSchema),
  async (c) => {
    const { refreshToken } = c.req.valid("json");
    const hash = hashToken(refreshToken);
    const stored = db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.tokenHash, hash))
      .get();
    if (!stored || stored.expiresAt < Date.now()) {
      return c.json({ error: "Unauthorized", message: "Refresh token tidak valid atau kedaluwarsa" }, 401);
    }
    const user = db.select().from(users).where(eq(users.id, stored.userId)).get();
    if (!user) {
      return c.json({ error: "Unauthorized", message: "User tidak ditemukan" }, 401);
    }

    // Rotate: revoke the old refresh token, issue a fresh pair.
    db.delete(refreshTokens).where(eq(refreshTokens.id, stored.id)).run();
    const tokens = await issueTokens(user);
    return c.json({ user: publicUser(user), ...tokens }, 200);
  },
);

auth.post("/logout", async (c) => {
  const body = await c.req.json().catch(() => null);
  const refreshToken = body?.refreshToken;
  if (refreshToken) {
    db.delete(refreshTokens).where(eq(refreshTokens.tokenHash, hashToken(refreshToken))).run();
  }
  return c.json({ message: "Logged out" }, 200);
});

auth.get("/me", authMiddleware, async (c) => {
  const userId = c.get("userId");
  const user = db.select().from(users).where(eq(users.id, userId)).get();
  if (!user) {
    return c.json({ error: "NotFound", message: "User tidak ditemukan" }, 404);
  }
  return c.json({ user: publicUser(user) }, 200);
});

export default auth;