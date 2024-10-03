import { db } from "@/db";
import { participants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { Response, Request } from "express";

export async function getParticipant(req: Request, res: Response) {
  const paramsSchema = z.object({
    participantId: z.string().uuid(),
  });

  const { participantId } = paramsSchema.parse(req.params);

  const participant = await db.query.participants.findFirst({
    where: eq(participants.id, participantId),
  });

  if (!participant) {
    return res.status(404).json({ error: "Participant not found" });
  }

  return res.json(participant);
}
