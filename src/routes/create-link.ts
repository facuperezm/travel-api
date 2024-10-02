import { db } from "@/db";
import { links, trips } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { Request, Response } from "express";

export async function createLink(req: Request, res: Response) {
  try {
    const paramsSchema = z.object({
      tripId: z.string(),
    });

    const bodySchema = z.object({
      title: z.string(),
      url: z.string().url(),
    });

    const { tripId } = paramsSchema.parse(req.params);
    const { title, url } = bodySchema.parse(req.body);

    const trip = await db.query.trips.findFirst({
      where: eq(trips.id, tripId),
    });

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const link = await db.insert(links).values({
      title,
      url,
      trip_id: trip.id,
    });

    return res.status(201).json(link);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}
