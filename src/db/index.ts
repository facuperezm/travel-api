import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/db/schema";
import { env } from "@/env";

export const connection = postgres(env.DATABASE_URL, {
  max: env.DB_MIGRATE || env.DB_SEED ? 1 : undefined,
  onnotice: env.DB_SEED ? () => {} : undefined,
});

export const db = drizzle(connection, {
  schema,
  logger: env.NODE_ENV === "development",
});

export type db = typeof db;

export default db;
