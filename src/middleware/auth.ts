// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import { verifyJWT } from "@/lib/auth";
import { db } from "@/db";
import { participants } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface AuthenticatedRequest extends Request {
  participantId?: string;
}

export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1]; // Expecting 'Bearer <token>'

  const payload = verifyJWT(token);

  if (!payload) {
    return res.status(401).json({ error: "Invalid token" });
  }

  const participant = await db.query.participants.findFirst({
    where: eq(participants.id, payload.participantId),
  });

  if (!participant) {
    return res.status(401).json({ error: "Participant not found" });
  }

  req.participantId = participant.id;
  next();
}
