import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  varchar,
  PrimaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { primaryKey } from "drizzle-orm/pg-core";

export const trips = pgTable("trips", {
  id: uuid("id").primaryKey().defaultRandom(),
  destination: text("destination").notNull(),
  starts_at: timestamp("starts_at").notNull(),
  ends_at: timestamp("ends_at").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  is_confirmed: boolean("is_confirmed").default(false),
  owner_id: uuid("owner_id").references(() => participants.id),
});

export const participants = pgTable("participants", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  is_confirmed: boolean("is_confirmed").default(false),
  access_token: text("access_token"),
  refresh_token: text("refresh_token"),
});

export const participantsTrips = pgTable(
  "participants_trips",
  {
    participant_id: uuid("participant_id").references(() => participants.id),
    trip_id: uuid("trip_id").references(() => trips.id),
    is_owner: boolean("is_owner").default(false),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.participant_id, table.trip_id] }),
  })
);

export const activities = pgTable("activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  occurs_at: timestamp("occurs_at").notNull(),
  trip_id: uuid("trip_id")
    .notNull()
    .references(() => trips.id),
});

export const links = pgTable("links", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  trip_id: uuid("trip_id")
    .notNull()
    .references(() => trips.id),
});

export const tripsRelations = relations(trips, ({ many, one }) => ({
  participants: many(participantsTrips),
  activities: many(activities),
  links: many(links),
  owner: one(participants, {
    fields: [trips.owner_id],
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
      fields: [participantsTrips.participant_id],
      references: [participants.id],
    }),
    trip: one(trips, {
      fields: [participantsTrips.trip_id],
      references: [trips.id],
    }),
  })
);

export const activitiesRelations = relations(activities, ({ one }) => ({
  trip: one(trips, {
    fields: [activities.trip_id],
    references: [trips.id],
  }),
}));

export const linksRelations = relations(links, ({ one }) => ({
  trip: one(trips, {
    fields: [links.trip_id],
    references: [trips.id],
  }),
}));

export type Trip = typeof trips.$inferSelect;
export type Participant = typeof participants.$inferSelect;
export type ParticipantSelect = typeof participants.$inferSelect;
export type ParticipantInsert = typeof participants.$inferInsert;
