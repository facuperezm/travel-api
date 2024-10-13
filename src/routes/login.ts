import { Request, Response } from "express";
import { z } from "zod";
import { db } from "@/db";
import { participants } from "@/db/schema";
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

    if (!participant || participant.access_token !== access_token) {
      return res.status(401).json({ error: "Invalid email or access token" });
    }

    const accessToken = generateAccessToken(participant.id);
    const refreshToken = generateRefreshToken(participant.id);

    // Optionally, store the refresh token in the database
    await db
      .update(participants)
      .set({ refresh_token: refreshToken })
      .where(eq(participants.id, participant.id));

    res.json({ accessToken, refreshToken });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
