import { env } from "@/env";
import { Participant, participants, participantsTrips } from "./../db/schema";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { Request, Response } from "express";

import { z } from "zod";

export async function confirmParticipant(req: Request, res: Response) {
  const schema = z.object({
    participantId: z.string().uuid(),
  });

  const { participantId } = schema.parse(req.url);

  const participant = await db.query.participants.findFirst({
    where: eq(participants.id, participantId),
  });

  if (!participant) {
    return res.status(404).json({ message: "Participant not found" });
  }

  const participantTrip = await db.query.participantsTrips.findMany({
    where: eq(participantsTrips.participant_id, participantId),
  });

  if (participant.is_confirmed) {
    return res.redirect(
      302,
      `${env.FRONTEND_URL}/trips/${participantTrip[0].trip_id}`
    );
  }

  await db
    .update(participants)
    .set({ is_confirmed: true } as Partial<Participant>)
    .where(eq(participants.id, participantId));

  return res.redirect(
    302,
    `${env.FRONTEND_URL}/trips/${participantTrip[0].trip_id}`
  );
}
