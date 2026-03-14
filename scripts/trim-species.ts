/**
 * Remove non-party-boat species from the database.
 * Deletes boat_species associations, aliases, then the species records.
 * Also removes empty categories afterward.
 *
 * Run with: npx tsx scripts/trim-species.ts
 */

import "dotenv/config";
import { Client } from "pg";

const REMOVE_SLUGS = [
  // Parasites / Bycatch / Nuisance / Bait
  "remora", "searobin", "toadfish", "needlefish", "pinfish", "mullet", "scad", "ladyfish",
  // Protected species (illegal to keep)
  "nassau-grouper", "goliath-grouper", "speckled-hind", "warsaw-grouper", "dusky-shark",
  // Inshore / Flats only (not party boat fishery)
  "bonefish", "tarpon", "snook", "permit", "corbina", "spotted-bay-bass",
  // Not realistic party boat targets
  "opah", "ocean-sunfish", "lookdown", "pompano-dolphinfish", "northern-puffer",
  "seatrout", "snowy-cod", "jewfish-snapper", "american-shad", "banded-rudderfish", "yellowfin-croaker",
  // Rare / obscure groupers & snappers
  "tiger-grouper", "coney-grouper", "rock-hind", "dog-snapper",
  "schoolmaster-snapper", "wenchman-snapper", "mahogany-snapper",
  // Questionable - approved for removal
  "bonnethead-shark", "nurse-shark", "stingray", "cownose-ray", "eagle-ray", "spadefish",
  // Borderline - approved for removal
  "windowpane-flounder", "cunner",
];

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  console.log(`Removing ${REMOVE_SLUGS.length} non-party-boat species...\n`);

  // Find species to remove
  const { rows: toRemove } = await client.query(
    `SELECT id, name, slug FROM species WHERE slug = ANY($1)`,
    [REMOVE_SLUGS]
  );

  const foundSlugs = new Set(toRemove.map((s: any) => s.slug));
  const notFound = REMOVE_SLUGS.filter((s) => !foundSlugs.has(s));
  if (notFound.length > 0) {
    console.log(`Not found in DB (already removed or never existed):`);
    for (const s of notFound) console.log(`  - ${s}`);
    console.log();
  }

  if (toRemove.length === 0) {
    console.log("Nothing to remove.");
    await client.end();
    process.exit(0);
  }

  const removeIds = toRemove.map((s: any) => s.id);

  // 1. Delete boat_species associations
  const bs = await client.query(
    `DELETE FROM boat_species WHERE species_id = ANY($1)`,
    [removeIds]
  );
  console.log(`Deleted ${bs.rowCount} boat-species associations`);

  // 2. Delete aliases
  const al = await client.query(
    `DELETE FROM species_aliases WHERE species_id = ANY($1)`,
    [removeIds]
  );
  console.log(`Deleted ${al.rowCount} aliases`);

  // 3. Delete species records
  const del = await client.query(
    `DELETE FROM species WHERE id = ANY($1) RETURNING name`,
    [removeIds]
  );
  console.log(`\nDeleted ${del.rowCount} species:`);
  for (const d of del.rows.sort((a: any, b: any) => a.name.localeCompare(b.name))) {
    console.log(`  - ${d.name}`);
  }

  // 4. Remove empty categories
  console.log("\nChecking for empty categories...");
  const emptyCats = await client.query(`
    SELECT sc.id, sc.name FROM species_categories sc
    WHERE NOT EXISTS (SELECT 1 FROM species s WHERE s.category_id = sc.id)
  `);

  if (emptyCats.rows.length > 0) {
    for (const cat of emptyCats.rows) {
      await client.query(`DELETE FROM species_categories WHERE id = $1`, [cat.id]);
      console.log(`  Removed empty category: ${cat.name}`);
    }
  } else {
    console.log("  No empty categories.");
  }

  // 5. Final count
  const remaining = await client.query(`SELECT count(*) as cnt FROM species`);
  const catCount = await client.query(`SELECT count(*) as cnt FROM species_categories`);
  console.log(`\nFinal: ${remaining.rows[0].cnt} species in ${catCount.rows[0].cnt} categories`);

  await client.end();
  process.exit(0);
}

main().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});
