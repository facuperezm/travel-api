import { db } from "@/db";
import { activities, trips } from "@/db/schema";
import { eq } from "drizzle-orm";
import z from "zod";
import { Request, Response } from "express";

export async function createActivity(req: Request, res: Response) {
  try {
    const paramsSchema = z.object({
      tripId: z.string(),
    });

    const bodySchema = z.object({
      title: z.string(),
      occurs_at: z.coerce.date(),
    });

    const { tripId } = paramsSchema.parse(req.url);
    const { title, occurs_at } = bodySchema.parse(req.body);

    const trip = await db.query.trips.findFirst({
      where: eq(trips.id, tripId),
    });

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const activity = await db
      .insert(activities)
      .values({
        trip_id: trip.id,
        title,
        occurs_at,
      })
      .returning();

    return res.status(201).json(activity);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}
