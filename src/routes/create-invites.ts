import { z } from "zod";
import { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { Participant, participants, trips } from "@/db/schema";
import nodemailer from "nodemailer";

import { getMailClient } from "@/lib/mail";
import dayjs from "dayjs";
import { env } from "@/env";
export async function createInvites(req: Request, res: Response) {
  const schema = z.object({
    tripId: z.string(),
  });
  const bodySchema = z.object({
    email: z.string().email(),
    name: z.string(),
  });

  const { tripId } = schema.parse(req.url);
  const { email, name } = bodySchema.parse(req.body);

  const trip = await db.query.trips.findFirst({
    where: eq(trips.id, tripId),
  });

  if (!trip) {
    return res.status(404).json({ message: "Trip not found" });
  }

  //create participant
  const participant = (await db
    .insert(participants)
    .values({
      email,
      name,
    })
    .returning()) as unknown as Participant;

  const formattedStartDate = dayjs(trip.starts_at).format("LL");
  const formattedEndDate = dayjs(trip.ends_at).format("LL");

  const mail = await getMailClient();

  const confirmationLink = `${env.BACKEND_URL}/participants/${participant.id}/confirm`;

  const message = await mail.sendMail({
    from: {
      name: "Marc from Travel",
      address: "hi@travel.com",
    },
    to: participant.email,
    subject: `Confirm your presence on ${trip.destination} on ${formattedStartDate}`,
    html: `
        <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
          <p>You have been invited to participate in a trip to <strong>${trip.destination}</strong> from <strong>${formattedStartDate}</strong> to <strong>${formattedEndDate}</strong>.</p>
          <p></p>
          <p>To confirm your presence on the trip, click the link below:</p>
          <p></p>
          <p>
            <a href="${confirmationLink}">Confirm trip</a>
          </p>
          <p></p>
          <p>If you don't know what this email is about, just ignore it.</p>
        </div>
      `.trim(),
  });

  console.log(nodemailer.getTestMessageUrl(message));

  return { participantId: participant.id };
}
