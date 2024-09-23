import { db } from "@/db";
import { trips } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Request, Response } from "express";
import { z } from "zod";

export async function getTripDetails(req: Request, res: Response) {
  try {
    const schema = z.object({
      tripId: z.string(),
    });

    const { tripId } = schema.parse(req.params);

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
