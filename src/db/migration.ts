import { migrate } from "drizzle-orm/postgres-js/migrator";
import config from "$/drizzle.config";
import { db, connection } from "@/db";
import { env } from "@/env";

if (!env.DB_MIGRATE) {
  throw new Error('You must set DB_MIGRATE to "true" when running migrations');
}

migrate(db, { migrationsFolder: config.out! }).then(() => {
  console.log("Migrations complete");
  connection.end();
});
