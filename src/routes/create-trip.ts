import { Request, Response } from "express";
import { z } from "zod";
import { dayjs } from "../lib/dayjs";
import { getMailClient } from "../lib/mail";
import { env } from "../env";
import { randomBytes } from "crypto";
import { db } from "@/db";
import nodemailer from "nodemailer";
import {
  trips,
  participants,
  participantsTrips,
  Participant,
  Trip,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { scheduler } from "timers/promises";
function generateAccessToken(): string {
  return randomBytes(32).toString("hex");
}

export async function createTrip(req: Request, res: Response) {
  try {
    const schema = z.object({
      destination: z.string(),
      starts_at: z.coerce.date(),
      ends_at: z.coerce.date(),
      owner_name: z.string(),
      owner_email: z.string().email(),
      emails_to_invite: z.array(z.string().email()),
    });

    const {
      destination,
      starts_at,
      ends_at,
      owner_email,
      owner_name,
      emails_to_invite,
    } = schema.parse(req.body);

    if (dayjs(starts_at).isBefore(new Date())) {
      return res
        .status(400)
        .json({ error: "Start date can't be today or in the past" });
    }

    if (dayjs(ends_at).isBefore(starts_at)) {
      return res
        .status(400)
        .json({ error: "End date can't be before start date" });
    }

    const trip = await db.transaction(async (tx) => {
      // Check if the trip creator already exists
      let owner = await tx.query.participants.findFirst({
        where: eq(participants.email, owner_email),
      });

      // If the creator doesnt exist, create a new participant
      if (!owner) {
        const [newOwner] = await tx
          .insert(participants)
          .values({
            name: owner_name,
            email: owner_email,
            is_confirmed: true,
            access_token: generateAccessToken(),
          } as Participant)
          .returning();

        owner = newOwner;
      }

      // Insert the trip
      const [newTrip] = await tx
        .insert(trips)
        .values({
          destination,
          starts_at,
          ends_at,
          owner_id: owner.id,
        } as Trip)
        .returning({
          id: trips.id,
        });

      // Add the owner to the trip
      await tx.insert(participantsTrips).values({
        participant_id: owner.id,
        trip_id: newTrip.id,
        is_owner: true,
      });

      for (const email of emails_to_invite) {
        let participant = await tx.query.participants.findFirst({
          where: eq(participants.email, email),
        });

        if (!participant) {
          const [newParticipant] = await tx
            .insert(participants)
            .values({
              name: "", // TODO: Add name to the participant
              email,
            })
            .returning();
          participant = newParticipant;
        }

        await tx.insert(participantsTrips).values({
          participant_id: participant.id,
          trip_id: newTrip.id,
          is_owner: false,
        });
      }

      // Fetch and return the trip with participants
      const tripWithParticipants = await tx.query.trips.findFirst({
        where: eq(trips.id, newTrip.id),
        with: {
          participants: true,
        },
      });

      return tripWithParticipants;
    });

    const confirmationLink = `${env.BACKEND_URL}/trips/${trip.id}/confirm`;
    const formattedDate = dayjs(starts_at).format("LL");
    const formattedEndDate = dayjs(ends_at).format("LL");

    const mail = await getMailClient();

    const message = await mail.sendMail({
      from: {
        name: "Marc from Travel Manager",
        address: "hello@travelmanager.com",
      },
      to: {
        name: owner_name,
        address: owner_email,
      },
      subject: "Your trip has been created",
      html: `<p>Your trip to ${destination} has been created. Enjoy your trip!</p>
      <p>Starts at: ${formattedDate}</p>
      <p>Ends at: ${formattedEndDate}</p>
      <p>Please confirm this trip by visiting this <a href=${confirmationLink}>link</a></p>`,
    });

    console.log("Preview URL: " + nodemailer.getTestMessageUrl(message));

    res.status(201).json({ tripId: trip.id });
  } catch (error) {
    console.error("Error creating trip:", error);
    res
      .status(500)
      .json({ error: "An error occurred while creating the trip" });
  }
}
