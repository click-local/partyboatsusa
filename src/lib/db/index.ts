import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "./schema";

// Required for Neon serverless driver (used by Supabase connection pooler)
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL || "";

// Pool and db are lazy — queries will fail at runtime if DATABASE_URL is missing,
// but this allows the build to succeed without a connection string.
export const pool = new Pool({ connectionString });
export const db = drizzle({ client: pool, schema });
