import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/db/schema";
import { env } from "@/env";

export const connection = postgres(env.DATABASE_URL, {
  max: env.DB_MIGRATE || env.DB_SEED ? 1 : undefined, // Only allow one connection when migrating or seeding
  onnotice: env.DB_SEED ? () => {} : undefined, // supress drizzle logs when seeding
});

export const db = drizzle(connection, {
  schema,
  logger: env.NODE_ENV === "development", // log queries in dev
});

export type db = typeof db;

export default db;
