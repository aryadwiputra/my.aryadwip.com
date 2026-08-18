# JWT Authentication

Authentication via access token (15 min expiry) and refresh token (7 days). Passwords hashed with bcrypt (cost factor 12).

Chosen over simple session-based auth for future-proofing against stateless API deployments and mobile clients.
