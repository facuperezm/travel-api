import { Request, Response } from "express";
import { z } from "zod";
import { db } from "@/db";
import { participants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyRefreshToken, generateAccessToken } from "@/lib/auth";

export async function refreshToken(req: Request, res: Response) {
  const schema = z.object({
    refreshToken: z.string(),
  });

  try {
    const { refreshToken } = schema.parse(req.body);
    const payload = verifyRefreshToken(refreshToken);

    if (!payload) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const participant = await db.query.participants.findFirst({
      where: eq(participants.id, payload.participantId),
    });

    if (!participant || participant.refresh_token !== refreshToken) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const newAccessToken = generateAccessToken(participant.id);

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Refresh token error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
