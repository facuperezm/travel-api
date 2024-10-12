import jwt from "jsonwebtoken";
import { env } from "@/env";

export function generateJWT(participantId: string) {
  return jwt.sign({ participantId }, env.JWT_SECRET, { expiresIn: "1h" });
}

export function verifyJWT(token: string) {
  try {
    return jwt.verify(token, env.JWT_SECRET) as { participantId: string };
  } catch (error) {
    return null;
  }
}
export function generateAccessToken() {
  return crypto.randomUUID().toString();
}
