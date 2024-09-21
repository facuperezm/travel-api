import { drizzle } from "drizzle-orm/node-postgres";
import postgres from "postgres";
import { env } from "../env";

const seed = async () => {
  const db = drizzle(postgres(env.DATABASE_URL));
};

seed();
