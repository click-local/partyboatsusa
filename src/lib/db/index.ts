import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "";

// Pool and db are lazy — queries will fail at runtime if DATABASE_URL is missing,
// but this allows the build to succeed without a connection string.
export const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});
export const db = drizzle({ client: pool, schema });
