import { Trip, trips } from "./../db/schema";
import { Request, Response } from "express";
import { db } from "@/db";
import { env } from "@/env";
import { eq } from "drizzle-orm";
import { z } from "zod";

export async function confirmTrip(req: Request, res: Response) {
  try {
    const schema = z.object({
      tripId: z.string(),
    });

    const { tripId } = schema.parse(req.params);

    const returnedTrip = await db.query.trips.findFirst({
      where: eq(trips.id, tripId),
      with: {
        participants: true,
      },
    });

    console.log(returnedTrip);

    if (!returnedTrip) {
      return res.status(403).json({ error: "Trip not found" });
    }

    if (returnedTrip.is_confirmed) {
      return res.redirect(`${env.FRONTEND_URL}/trips/${returnedTrip.id}`);
    }

    if (!returnedTrip.is_confirmed) {
      await db
        .update(trips)
        .set({ is_confirmed: true } as Partial<Trip>)
        .where(eq(trips.id, tripId));

      const updatedTrip = await db.query.trips.findFirst({
        where: eq(trips.id, tripId),
        with: {
          participants: true,
        },
      });

      console.log(updatedTrip);

      return res.status(200).json(updatedTrip);
    }
  } catch (error) {
    console.error("Error confirming trip:", error);
    res
      .status(500)
      .json({ error: "An error occurred while confirming the trip" });
  }
}
