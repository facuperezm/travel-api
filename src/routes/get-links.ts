import { db } from "@/db";
import { links, trips } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { Response, Request } from "express";

export async function getLinks(req: Request, res: Response) {
  try {
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

    const linksUrls = await db.query.links.findMany({
      where: eq(links.trip_id, tripId),
    });

    return res.json(linksUrls);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
