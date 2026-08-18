import { SignJWT, jwtVerify } from "jose";
import { createSecretKey } from "node:crypto";
import { env } from "./env";

const secretKey = createSecretKey(new TextEncoder().encode(env.jwtSecret));

const ALG = "HS256";

export const ACCESS_TOKEN_CLAIM = "clf.access";

export interface AccessPayload {
  sub: string; // userId
  [ACCESS_TOKEN_CLAIM]: true;
}

export async function signAccessToken(userId: string): Promise<string> {
  return new SignJWT({ [ACCESS_TOKEN_CLAIM]: true })
    .setProtectedHeader({ alg: ALG })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + env.accessTokenTtlMs / 1000)
    .sign(secretKey);
}

export async function verifyAccessToken(token: string): Promise<AccessPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: [ALG],
    });
    if (!payload.sub || payload[ACCESS_TOKEN_CLAIM] !== true) return null;
    return { sub: payload.sub, [ACCESS_TOKEN_CLAIM]: true } as AccessPayload;
  } catch {
    return null;
  }
}