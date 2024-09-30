import { z } from "zod";
import { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "@/db";

export async function createInvites(req: Request, res: Response) {
  const schema = z.object({
    tripId: z.string(),
  });
  const { tripId } = schema.parse(req.url);

  const trip = await db.query.trips.findFirst({
    where: eq(trips.id, tripId),
  });

  if (!trip) {
    return res.status(404).json({ message: "Trip not found" });
  }

  const participants = await db.query.participants.findMany({
    where: eq(participants.trip_id, tripId),
  });

  const invites = await db.insert(invites).values(
    participants.map((participant) => ({
      trip_id: tripId,
      participant_id: participant.id,
    }))
  );

  return res.status(201).json(invites);
}
