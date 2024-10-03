import { db } from "@/db";
import { participants, participantsTrips, trips } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { Response, Request } from "express";

export async function getTripsParticipants(req: Request, res: Response) {
  const paramsSchema = z.object({
    tripId: z.string().uuid(),
  });

  const { tripId } = paramsSchema.parse(req.params);

  const trip = await db.query.trips.findFirst({
    where: eq(trips.id, tripId),
  });

  if (!trip) {
    return res.status(404).json({ error: "Trip not found" });
  }

  const tripParticipants = await db
    .select({
      id: participants.id,
      name: participants.name,
      email: participants.email,
      is_confirmed: participants.is_confirmed,
      is_owner: participantsTrips.is_owner,
    })
    .from(participants)
    .innerJoin(
      participantsTrips,
      and(
        eq(participantsTrips.participant_id, participants.id),
        eq(participantsTrips.trip_id, tripId)
      )
    );

  return res.json(tripParticipants);
}
