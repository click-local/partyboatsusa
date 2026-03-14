require("dotenv").config({ path: ".env.local" });
const { Client } = require("pg");

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  const res = await client.query(
    "SELECT sc.name as category, sc.slug as cat_slug, s.name, s.slug, s.scientific_name, " +
    "(SELECT count(*) FROM boat_species bs WHERE bs.species_id = s.id) as boat_count " +
    "FROM species s LEFT JOIN species_categories sc ON s.category_id = sc.id " +
    "ORDER BY sc.sort_order, sc.name, s.name"
  );

  var lastCat = "";
  for (var i = 0; i < res.rows.length; i++) {
    var r = res.rows[i];
    if (r.category != lastCat) {
      console.log("");
      console.log("CAT: " + r.category + " (" + r.cat_slug + ")");
      lastCat = r.category;
    }
    console.log("  " + r.name + " | " + (r.scientific_name || "n/a") + " | " + r.boat_count + " boats");
  }

  await client.end();
}

main().catch(function(e) { console.error(e); process.exit(1); });
