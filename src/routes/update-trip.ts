import { db } from "@/db";
import { trips } from "@/db/schema";
import { dayjs } from "@/lib/dayjs";
import { eq } from "drizzle-orm";
import { Request, Response } from "express";
import { z } from "zod";

export async function updateTrip(req: Request, res: Response) {
  try {
    const schema = z.object({
      tripId: z.string(),
    });
    const bodySchema = z.object({
      destination: z.string().optional(),
      starts_at: z.coerce.date().optional(),
      ends_at: z.coerce.date().optional(),
    });

    const { destination, starts_at, ends_at } = bodySchema.parse(req.body);
    const { tripId } = schema.parse(req.params);

    const trip = await db.query.trips.findFirst({
      where: eq(trips.id, tripId),
    });

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    if (dayjs(starts_at).isBefore(new Date())) {
      throw new Error("Start date cannot be in the past");
    }

    if (dayjs(ends_at).isBefore(starts_at)) {
      throw new Error("End date cannot be before start date");
    }

    await db
      .update(trips)
      .set({ destination, starts_at, ends_at })
      .where(eq(trips.id, tripId));

    return res
      .status(200)
      .json({ message: "Trip updated successfully", tripId });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
