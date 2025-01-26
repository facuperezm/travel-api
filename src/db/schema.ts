import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  varchar,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const participants = pgTable("participants", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  isConfirmed: boolean("is_confirmed").default(false),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
});

export const trips = pgTable("trips", {
  id: uuid("id").primaryKey().defaultRandom(),
  destination: text("destination").notNull(),
  startsAt: timestamp("starts_at").notNull(),
  endsAt: timestamp("ends_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  isConfirmed: boolean("is_confirmed").default(false),
  ownerId: uuid("owner_id").references(() => participants.id),
});

export const participantsTrips = pgTable(
  "participants_trips",
  {
    participantId: uuid("participant_id")
      .notNull()
      .references(() => participants.id),
    tripId: uuid("trip_id")
      .notNull()
      .references(() => trips.id),
    isOwner: boolean("is_owner").default(false),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.participantId, table.tripId] }),
  })
);

export const activities = pgTable("activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  occursAt: timestamp("occurs_at").notNull(),
  tripId: uuid("trip_id")
    .notNull()
    .references(() => trips.id),
});

export const links = pgTable("links", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  tripId: uuid("trip_id")
    .notNull()
    .references(() => trips.id),
});

export const blacklistedTokens = pgTable("blacklisted_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  token: text("token").notNull().unique(),
  participantId: uuid("participant_id")
    .notNull()
    .references(() => participants.id),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const tripsRelations = relations(trips, ({ many, one }) => ({
  participants: many(participantsTrips),
  activities: many(activities),
  links: many(links),
  owner: one(participants, {
    fields: [trips.ownerId],
    references: [participants.id],
  }),
}));

export const participantsRelations = relations(participants, ({ many }) => ({
  trips: many(participantsTrips),
}));

export const participantsTripsRelations = relations(
  participantsTrips,
  ({ one }) => ({
    participant: one(participants, {
      fields: [participantsTrips.participantId],
      references: [participants.id],
    }),
    trip: one(trips, {
      fields: [participantsTrips.tripId],
      references: [trips.id],
    }),
  })
);

export const activitiesRelations = relations(activities, ({ one }) => ({
  trip: one(trips, {
    fields: [activities.tripId],
    references: [trips.id],
  }),
}));

export const linksRelations = relations(links, ({ one }) => ({
  trip: one(trips, {
    fields: [links.tripId],
    references: [trips.id],
  }),
}));

export const blacklistedTokensRelations = relations(
  blacklistedTokens,
  ({ one }) => ({
    participant: one(participants, {
      fields: [blacklistedTokens.participantId],
      references: [participants.id],
    }),
  })
);

// Type definitions
export interface ParticipantModel {
  id: string;
  name: string;
  email: string;
  isConfirmed: boolean;
  accessToken: string | null;
  refreshToken: string | null;
}

export type ParticipantSelect = ParticipantModel;
export type ParticipantInsert = Omit<ParticipantModel, "id">;

export interface BlacklistedTokenModel {
  id: string;
  token: string;
  participantId: string;
  expiresAt: Date;
  createdAt: Date;
}

export type BlacklistedTokenSelect = BlacklistedTokenModel;
export type BlacklistedTokenInsert = Omit<
  BlacklistedTokenModel,
  "id" | "createdAt"
>;

export type Trip = typeof trips.$inferSelect;
export type TripInsert = typeof trips.$inferInsert;
