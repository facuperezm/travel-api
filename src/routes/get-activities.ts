import { db } from "@/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { Response, Request } from "express";
import { activities, trips } from "@/db/schema";
import dayjs from "dayjs";

export async function getActivities(req: Request, res: Response) {
  const paramsSchema = z.object({
    tripId: z.string().uuid(),
  });

  const { tripId } = paramsSchema.parse(req.params);

  const activitiesQuery = await db.query.activities.findMany({
    where: eq(activities.trip_id, tripId),
  });

  const trip = await db.query.trips.findFirst({
    where: eq(trips.id, tripId),
  });

  if (!trip) {
    return res.status(404).json({ error: "Trip not found" });
  }

  const differenceInDaysBetweenTripStartAndEnd = dayjs(trip.ends_at).diff(
    trip.starts_at,
    "days"
  );

  const activitiesArray = Array.from({
    length: differenceInDaysBetweenTripStartAndEnd + 1,
  }).map((_, index) => {
    const date = dayjs(trip.starts_at).add(index, "days").toISOString();

    return {
      date: date,
      activities: activitiesQuery.filter((activity) => {
        return dayjs(activity.occurs_at).isSame(date, "day");
      }),
    };
  });

  return res.json(activitiesArray);
}
