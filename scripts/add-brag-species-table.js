// Create brag_board_photo_species junction table
require("dotenv").config({ path: ".env.local" });
const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  console.log("Creating brag_board_photo_species table...");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS brag_board_photo_species (
      id SERIAL PRIMARY KEY,
      photo_id INTEGER NOT NULL REFERENCES brag_board_photos(id) ON DELETE CASCADE,
      species_id INTEGER NOT NULL REFERENCES species(id) ON DELETE CASCADE
    );
  `);
  console.log("Table created.");

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_bbps_photo_id ON brag_board_photo_species(photo_id);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_bbps_species_id ON brag_board_photo_species(species_id);`);
  console.log("Indexes created.");

  await pool.end();
  console.log("Done!");
}

run().catch((e) => { console.error(e); process.exit(1); });
