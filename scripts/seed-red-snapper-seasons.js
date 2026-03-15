// Seed fishing season data for Red Snapper in NC and AL
require("dotenv").config({ path: ".env.local" });
const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  // Look up Red Snapper ID
  const { rows } = await pool.query("SELECT id FROM species WHERE slug = 'red-snapper'");
  if (rows.length === 0) {
    console.error("Red Snapper not found in species table");
    process.exit(1);
  }
  const speciesId = rows[0].id;
  console.log(`Found Red Snapper with id=${speciesId}`);

  const seasons = [
    // North Carolina (Atlantic)
    { state: "NC", month: 1, rating: "off", notes: "Federal waters closed" },
    { state: "NC", month: 2, rating: "off", notes: "Federal waters closed" },
    { state: "NC", month: 3, rating: "off", notes: "Federal waters closed" },
    { state: "NC", month: 4, rating: "fair", notes: "Some early action in state waters" },
    { state: "NC", month: 5, rating: "good", notes: "Season building" },
    { state: "NC", month: 6, rating: "peak", notes: "Federal season open, best fishing" },
    { state: "NC", month: 7, rating: "peak", notes: "Federal season open, best fishing" },
    { state: "NC", month: 8, rating: "good", notes: "Season winding down" },
    { state: "NC", month: 9, rating: "fair", notes: "Limited openings" },
    { state: "NC", month: 10, rating: "off", notes: "Season closed" },
    { state: "NC", month: 11, rating: "off", notes: "Season closed" },
    { state: "NC", month: 12, rating: "off", notes: "Season closed" },

    // Alabama (Gulf of Mexico)
    { state: "AL", month: 1, rating: "off", notes: "Season closed" },
    { state: "AL", month: 2, rating: "off", notes: "Season closed" },
    { state: "AL", month: 3, rating: "off", notes: "Season closed" },
    { state: "AL", month: 4, rating: "fair", notes: "Season approaching" },
    { state: "AL", month: 5, rating: "good", notes: "State waters opening, weekend fishing" },
    { state: "AL", month: 6, rating: "peak", notes: "Full season, best catches" },
    { state: "AL", month: 7, rating: "peak", notes: "Full season, best catches" },
    { state: "AL", month: 8, rating: "peak", notes: "Full season, best catches" },
    { state: "AL", month: 9, rating: "good", notes: "Continued weekend openings" },
    { state: "AL", month: 10, rating: "fair", notes: "Season ending" },
    { state: "AL", month: 11, rating: "off", notes: "Season closed" },
    { state: "AL", month: 12, rating: "off", notes: "Season closed" },
  ];

  console.log(`Inserting ${seasons.length} season rows...`);

  for (const s of seasons) {
    await pool.query(
      `INSERT INTO species_state_seasons (species_id, state_code, month, rating, notes)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (species_id, state_code, month) DO UPDATE SET rating = $4, notes = $5`,
      [speciesId, s.state, s.month, s.rating, s.notes]
    );
  }

  console.log("Seed complete!");
  await pool.end();
}

run().catch((e) => { console.error(e); process.exit(1); });
