// Create boat_faqs table for operator-managed FAQs (Pro tier)
require("dotenv").config({ path: ".env.local" });
const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  console.log("Creating boat_faqs table...");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS boat_faqs (
      id SERIAL PRIMARY KEY,
      boat_id INTEGER NOT NULL REFERENCES boats(id) ON DELETE CASCADE,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
  console.log("Table created.");

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_boat_faqs_boat_id ON boat_faqs(boat_id);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_boat_faqs_boat_sort ON boat_faqs(boat_id, sort_order);`);
  console.log("Indexes created.");

  await pool.end();
  console.log("Done!");
}

run().catch((e) => { console.error(e); process.exit(1); });
