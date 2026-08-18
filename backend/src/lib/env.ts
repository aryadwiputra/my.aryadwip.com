export const env = {
  port: Number(process.env.PORT ?? 3000),
  // In-memory when DEBUG_DB=memory, otherwise a persistent local SQLite file.
  databaseUrl: process.env.DATABASE_URL ?? "data/clarityflow.db",
  // Dev-only fallback secret. Override in production via JWT_SECRET.
  jwtSecret: process.env.JWT_SECRET ?? "clarityflow-dev-secret-change-me",
  accessTokenTtlMs: 15 * 60 * 1000, // 15 minutes
  refreshTokenTtlMs: 7 * 24 * 60 * 60 * 1000, // 7 days
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
};