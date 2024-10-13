import jwt from "jsonwebtoken";
import { env } from "@/env";

export function generateAccessToken(participantId: string) {
  return jwt.sign({ participantId }, env.JWT_SECRET, { expiresIn: "15m" });
}

export function generateRefreshToken(participantId: string) {
  return jwt.sign({ participantId }, env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyAccessToken(token: string) {
  try {
    return jwt.verify(token, env.JWT_SECRET) as { participantId: string };
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string) {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as {
      participantId: string;
    };
  } catch {
    return null;
  }
}
