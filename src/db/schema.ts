import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const trips = pgTable("trips", {
  id: uuid("id").primaryKey().defaultRandom(),
  destination: text("destination").notNull(),
  starts_at: timestamp("starts_at").notNull(),
  ends_at: timestamp("ends_at").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  is_confirmed: boolean("is_confirmed").default(false),
});

export const participants = pgTable("participants", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  is_confirmed: boolean("is_confirmed").default(false),
  is_owner: boolean("is_owner").default(false),
  trip_id: uuid("trip_id")
    .notNull()
    .references(() => trips.id),
  access_token: text("access_token"),
  refresh_token: text("refresh_token"),
});

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

export const tripsRelations = relations(trips, ({ many }) => ({
  participants: many(participants),
  activities: many(activities),
  links: many(links),
}));

export const participantsRelations = relations(participants, ({ one }) => ({
  trip: one(trips, {
    fields: [participants.trip_id],
    references: [trips.id],
  }),
}));

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
