import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../env";
import {
  trips,
  participants,
  participantsTrips,
  activities,
  links,
} from "./schema";

const seed = async () => {
  const queryClient = postgres(env.DATABASE_URL, { max: 1 });
  const db = drizzle(queryClient);

  try {
    // Clear existing data in reverse order of dependencies
    console.log("🗑️  Clearing existing data...");
    await db.delete(links);
    await db.delete(activities);
    await db.delete(participantsTrips);
    await db.delete(trips);
    await db.delete(participants);

    // Seed Participants
    console.log("👥 Seeding participants...");
    const seedParticipants = await db
      .insert(participants)
      .values([
        {
          name: "John Smith",
          email: "john@example.com",
          is_confirmed: true,
          access_token: "access_token_john",
        },
        {
          name: "Jane Doe",
          email: "jane@example.com",
          is_confirmed: true,
          access_token: "access_token_jane",
        },
        {
          name: "Bob Wilson",
          email: "bob@example.com",
          is_confirmed: false,
          access_token: "access_token_bob",
        },
      ])
      .returning();

    // Seed Trips
    console.log("✈️  Seeding trips...");
    const seedTrips = await db
      .insert(trips)
      .values([
        {
          destination: "Paris, France",
          starts_at: new Date("2024-07-01"),
          ends_at: new Date("2024-07-15"),
          is_confirmed: true,
          owner_id: seedParticipants[0].id,
        },
        {
          destination: "Tokyo, Japan",
          starts_at: new Date("2024-08-10"),
          ends_at: new Date("2024-08-25"),
          is_confirmed: false,
          owner_id: seedParticipants[1].id,
        },
        {
          destination: "New York, USA",
          starts_at: new Date("2024-09-05"),
          ends_at: new Date("2024-09-12"),
          is_confirmed: false,
          owner_id: seedParticipants[2].id,
        },
      ])
      .returning();

    // Seed ParticipantsTrips
    console.log("🤝 Seeding participant-trip relationships...");
    await db.insert(participantsTrips).values([
      {
        participant_id: seedParticipants[0].id,
        trip_id: seedTrips[0].id,
        is_owner: true,
      },
      {
        participant_id: seedParticipants[1].id,
        trip_id: seedTrips[0].id,
        is_owner: false,
      },
      {
        participant_id: seedParticipants[1].id,
        trip_id: seedTrips[1].id,
        is_owner: true,
      },
      {
        participant_id: seedParticipants[2].id,
        trip_id: seedTrips[1].id,
        is_owner: false,
      },
      {
        participant_id: seedParticipants[2].id,
        trip_id: seedTrips[2].id,
        is_owner: true,
      },
    ]);

    // Seed Activities
    console.log("📅 Seeding activities...");
    await db.insert(activities).values([
      {
        title: "Eiffel Tower Visit",
        occurs_at: new Date("2024-07-02T10:00:00Z"),
        trip_id: seedTrips[0].id,
      },
      {
        title: "Louvre Museum Tour",
        occurs_at: new Date("2024-07-03T14:00:00Z"),
        trip_id: seedTrips[0].id,
      },
      {
        title: "Sensoji Temple Visit",
        occurs_at: new Date("2024-08-11T09:00:00Z"),
        trip_id: seedTrips[1].id,
      },
      {
        title: "Tokyo Skytree",
        occurs_at: new Date("2024-08-12T15:00:00Z"),
        trip_id: seedTrips[1].id,
      },
      {
        title: "Times Square Tour",
        occurs_at: new Date("2024-09-06T11:00:00Z"),
        trip_id: seedTrips[2].id,
      },
    ]);

    // Seed Links
    console.log("🔗 Seeding links...");
    await db.insert(links).values([
      {
        title: "Hotel Booking - Paris",
        url: "https://booking.com/hotel-paris",
        trip_id: seedTrips[0].id,
      },
      {
        title: "Flight Tickets - Paris",
        url: "https://airline.com/flight-paris",
        trip_id: seedTrips[0].id,
      },
      {
        title: "Hotel Booking - Tokyo",
        url: "https://booking.com/hotel-tokyo",
        trip_id: seedTrips[1].id,
      },
      {
        title: "Tokyo Travel Guide",
        url: "https://guide.com/tokyo",
        trip_id: seedTrips[1].id,
      },
      {
        title: "NYC Hotel Reservation",
        url: "https://booking.com/nyc-hotel",
        trip_id: seedTrips[2].id,
      },
    ]);

    console.log("✅ Seed data inserted successfully");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await queryClient.end();
  }
};

seed().catch((err) => {
  console.error("❌ Error seeding database:", err);
  process.exit(1);
});
