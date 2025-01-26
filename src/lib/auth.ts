import jwt from "jsonwebtoken";
import { env } from "@/env";
import { db } from "@/db";
import {
  blacklistedTokens,
  type BlacklistedTokenInsert,
  type ParticipantInsert,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

interface JWTPayload {
  participantId: string;
  jti: string; // JWT ID
  iss: string; // Issuer
  iat?: number; // Issued at
  exp?: number; // Expiration
}

export function generateAccessToken(participantId: string) {
  const payload: JWTPayload = {
    participantId,
    jti: randomUUID(),
    iss: "travel-manager",
  };

  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "15m" });
}

export function generateRefreshToken(participantId: string) {
  const payload: JWTPayload = {
    participantId,
    jti: randomUUID(),
    iss: "travel-manager",
  };

  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
}

export async function verifyAccessToken(token: string) {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string) {
  try {
    const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as JWTPayload;

    // Check if token is blacklisted
    const isBlacklisted = await db.query.blacklistedTokens.findFirst({
      where: eq(blacklistedTokens.token, token),
    });

    if (isBlacklisted) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function blacklistToken(token: string, participantId: string) {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    if (!decoded || !decoded.exp) return false;

    const tokenData = {
      token,
      participantId,
      expiresAt: new Date(decoded.exp * 1000),
    } satisfies BlacklistedTokenInsert;

    await db.insert(blacklistedTokens).values(tokenData);
    return true;
  } catch {
    return false;
  }
}

// Cleanup expired blacklisted tokens
export async function cleanupBlacklistedTokens() {
  await db
    .delete(blacklistedTokens)
    .where(eq(blacklistedTokens.expiresAt, new Date()));
}
