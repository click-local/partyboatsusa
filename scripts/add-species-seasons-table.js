// Create species_state_seasons table for month-by-month fishing season data
require("dotenv").config({ path: ".env.local" });
const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  console.log("Creating species_state_seasons table...");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS species_state_seasons (
      id SERIAL PRIMARY KEY,
      species_id INTEGER NOT NULL REFERENCES species(id) ON DELETE CASCADE,
      state_code TEXT NOT NULL,
      month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
      rating TEXT NOT NULL CHECK (rating IN ('peak', 'good', 'fair', 'off')),
      notes TEXT
    );
  `);
  console.log("Table created.");

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_sss_unique
    ON species_state_seasons(species_id, state_code, month);
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_sss_lookup
    ON species_state_seasons(species_id, state_code);
  `);
  console.log("Indexes created.");

  await pool.end();
  console.log("Done!");
}

run().catch((e) => { console.error(e); process.exit(1); });
