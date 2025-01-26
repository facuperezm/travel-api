import { Request, Response } from "express";
import { z } from "zod";
import { db } from "@/db";
import { participants, type ParticipantModel } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateAccessToken, generateRefreshToken } from "@/lib/auth";

export async function login(req: Request, res: Response) {
  const schema = z.object({
    email: z.string().email(),
    access_token: z.string(),
  });

  try {
    const { email, access_token } = schema.parse(req.body);

    const participant = await db.query.participants.findFirst({
      where: eq(participants.email, email),
    });

    if (!participant || participant.accessToken !== access_token) {
      return res.status(401).json({ error: "Invalid email or access token" });
    }

    const accessToken = generateAccessToken(participant.id);
    const refreshToken = generateRefreshToken(participant.id);

    // Store refresh token in database
    const updateData: Partial<ParticipantModel> = {
      refreshToken,
    };

    await db
      .update(participants)
      .set(updateData)
      .where(eq(participants.id, participant.id));

    // Set refresh token as HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/api/refresh-token", // Only sent to refresh token endpoint
    });

    res.json({ accessToken });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
