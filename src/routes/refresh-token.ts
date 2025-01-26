import { Request, Response } from "express";
import { db } from "@/db";
import { participants, type ParticipantModel } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
  blacklistToken,
} from "@/lib/auth";

export async function refreshToken(req: Request, res: Response) {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token missing" });
  }

  try {
    const payload = await verifyRefreshToken(refreshToken);

    if (!payload) {
      res.clearCookie("refreshToken");
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const participant = await db.query.participants.findFirst({
      where: eq(participants.id, payload.participantId),
    });

    if (!participant || participant.refreshToken !== refreshToken) {
      res.clearCookie("refreshToken");
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    // Blacklist the old refresh token
    await blacklistToken(refreshToken, participant.id);

    // Generate new tokens
    const newAccessToken = generateAccessToken(participant.id);
    const newRefreshToken = generateRefreshToken(participant.id);

    // Update refresh token in database
    const updateData: Partial<ParticipantModel> = {
      refreshToken: newRefreshToken,
    };

    await db
      .update(participants)
      .set(updateData)
      .where(eq(participants.id, participant.id));

    // Set new refresh token cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/api/refresh-token",
    });

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
