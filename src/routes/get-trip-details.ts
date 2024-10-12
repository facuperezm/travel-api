// src/routes/get-trip-details.ts
import { AuthenticatedRequest } from "@/middleware/auth";
import { Request, Response } from "express";
import { db } from "@/db";
import { trips, participantsTrips } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export async function getTripDetails(req: AuthenticatedRequest, res: Response) {
  try {
    const schema = z.object({
      tripId: z.string(),
    });

    const { tripId } = schema.parse(req.params);
    const participantId = req.participantId;

    // Check if participant is part of the trip
    const participation = await db.query.participantsTrips.findFirst({
      where: eq(participantsTrips.trip_id, tripId),
      and: eq(participantsTrips.participant_id, participantId),
    });

    if (!participation) {
      return res.status(403).json({ error: "Access denied" });
    }

    const trip = await db.query.trips.findFirst({
      where: eq(trips.id, tripId),
    });

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    return res.status(200).json({ trip });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
