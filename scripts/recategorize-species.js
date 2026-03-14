/**
 * Recategorize species into proper family-based categories.
 * - Dissolve "Pacific Game Fish" (redistribute all species)
 * - Split "Triggerfish & Tilefish" into two categories
 * - Rename "Pacific Rockfish" to "Rockfish & Lingcod"
 * - Create "Salmon" category
 * - Move Sheepshead from Drums & Croakers to Porgies & Wrasses
 * - Merge Great Barracuda into Barracuda
 *
 * Run with: node scripts/recategorize-species.js
 */

require("dotenv").config({ path: ".env.local" });
var pg = require("pg");

async function main() {
  var client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  // Helper: get category id by slug
  async function getCatId(slug) {
    var res = await client.query("SELECT id FROM species_categories WHERE slug = $1", [slug]);
    return res.rows[0] ? res.rows[0].id : null;
  }

  // Helper: get species id by slug
  async function getSpeciesId(slug) {
    var res = await client.query("SELECT id FROM species WHERE slug = $1", [slug]);
    return res.rows[0] ? res.rows[0].id : null;
  }

  // Helper: create category if not exists
  async function ensureCategory(name, slug, sortOrder, description) {
    var existing = await getCatId(slug);
    if (existing) {
      console.log("  Category exists: " + name);
      return existing;
    }
    var res = await client.query(
      "INSERT INTO species_categories (name, slug, sort_order, description) VALUES ($1, $2, $3, $4) RETURNING id",
      [name, slug, sortOrder, description || null]
    );
    console.log("  Created category: " + name);
    return res.rows[0].id;
  }

  // Helper: move species to category
  async function moveSpecies(speciesSlug, catId, catName) {
    var spId = await getSpeciesId(speciesSlug);
    if (!spId) {
      console.log("  SKIP: species '" + speciesSlug + "' not found");
      return;
    }
    await client.query("UPDATE species SET category_id = $1 WHERE id = $2", [catId, spId]);
    var nameRes = await client.query("SELECT name FROM species WHERE id = $1", [spId]);
    console.log("  Moved: " + nameRes.rows[0].name + " -> " + catName);
  }

  console.log("=== Step 1: Create new categories ===\n");

  var salmonId = await ensureCategory("Salmon", "salmon", 16, "Pacific salmon species targeted on party boats from Alaska to California.");
  var triggerfishId = await ensureCategory("Triggerfish", "triggerfish", 17, "Reef-dwelling triggerfish species popular on party boats in the South Atlantic and Gulf of Mexico.");
  var tilefishId = await ensureCategory("Tilefish", "tilefish", 18, "Deep-drop tilefish species prized for their excellent eating quality.");

  console.log("\n=== Step 2: Rename Pacific Rockfish -> Rockfish & Lingcod ===\n");

  var prId = await getCatId("pacific-rockfish");
  if (prId) {
    await client.query(
      "UPDATE species_categories SET name = $1, slug = $2, description = $3 WHERE id = $4",
      ["Rockfish & Lingcod", "rockfish-lingcod", "West Coast rockfish, lingcod, and cabezon caught on bottom fishing trips.", prId]
    );
    console.log("  Renamed: Pacific Rockfish -> Rockfish & Lingcod");
  }
  var rockfishCatId = prId;

  console.log("\n=== Step 3: Split Triggerfish & Tilefish ===\n");

  // Move triggerfish species to new Triggerfish category
  await moveSpecies("gray-triggerfish", triggerfishId, "Triggerfish");
  await moveSpecies("ocean-triggerfish", triggerfishId, "Triggerfish");
  await moveSpecies("queen-triggerfish", triggerfishId, "Triggerfish");

  // Move tilefish species to new Tilefish category
  await moveSpecies("golden-tilefish", tilefishId, "Tilefish");
  await moveSpecies("blueline-tilefish", tilefishId, "Tilefish");

  // Delete old combined category
  var oldTTId = await getCatId("triggerfish-tilefish");
  if (oldTTId) {
    // Verify no species still reference it
    var remaining = await client.query("SELECT count(*) as cnt FROM species WHERE category_id = $1", [oldTTId]);
    if (parseInt(remaining.rows[0].cnt) === 0) {
      await client.query("DELETE FROM species_categories WHERE id = $1", [oldTTId]);
      console.log("  Deleted old category: Triggerfish & Tilefish");
    } else {
      console.log("  WARNING: Triggerfish & Tilefish still has " + remaining.rows[0].cnt + " species!");
    }
  }

  console.log("\n=== Step 4: Dissolve Pacific Game Fish ===\n");

  var jacksId = await getCatId("jacks-pompanos");
  var drumsId = await getCatId("drums-croakers");
  var mackerelsId = await getCatId("mackerels");
  var bassId = await getCatId("bass-bluefish");
  var otherId = await getCatId("other-species");

  // California Yellowtail -> Jacks & Pompanos
  await moveSpecies("california-yellowtail", jacksId, "Jacks & Pompanos");

  // White Seabass -> Drums & Croakers
  await moveSpecies("white-seabass", drumsId, "Drums & Croakers");

  // Pacific Bonito -> Mackerels
  await moveSpecies("pacific-bonito", mackerelsId, "Mackerels");

  // Pacific Mackerel -> Mackerels
  await moveSpecies("pacific-mackerel", mackerelsId, "Mackerels");

  // Salmon -> Salmon category
  await moveSpecies("chinook-salmon", salmonId, "Salmon");
  await moveSpecies("coho-salmon", salmonId, "Salmon");
  await moveSpecies("pink-salmon", salmonId, "Salmon");

  // Kelp Bass, Barred Sand Bass -> Bass & Bluefish
  await moveSpecies("kelp-bass", bassId, "Bass & Bluefish");
  await moveSpecies("barred-sand-bass", bassId, "Bass & Bluefish");

  // Lingcod, Cabezon -> Rockfish & Lingcod
  await moveSpecies("lingcod", rockfishCatId, "Rockfish & Lingcod");
  await moveSpecies("cabezon", rockfishCatId, "Rockfish & Lingcod");

  // Barracuda (CA) -> Other Species (will merge with Great Barracuda next)
  await moveSpecies("barracuda", otherId, "Other Species");

  // Delete Pacific Game Fish category
  var pgfId = await getCatId("pacific-game-fish");
  if (pgfId) {
    var pgfRemaining = await client.query("SELECT count(*) as cnt FROM species WHERE category_id = $1", [pgfId]);
    if (parseInt(pgfRemaining.rows[0].cnt) === 0) {
      await client.query("DELETE FROM species_categories WHERE id = $1", [pgfId]);
      console.log("  Deleted category: Pacific Game Fish");
    } else {
      console.log("  WARNING: Pacific Game Fish still has " + pgfRemaining.rows[0].cnt + " species!");
    }
  }

  console.log("\n=== Step 5: Move Sheepshead to Porgies & Wrasses ===\n");

  var porgiesId = await getCatId("porgies-wrasses");
  await moveSpecies("sheepshead", porgiesId, "Porgies & Wrasses");

  console.log("\n=== Step 6: Merge Great Barracuda into Barracuda ===\n");

  var barracudaId = await getSpeciesId("barracuda");
  var greatBarracudaId = await getSpeciesId("great-barracuda");

  if (barracudaId && greatBarracudaId) {
    // Transfer any boat associations from Great Barracuda to Barracuda
    var gbBoats = await client.query("SELECT boat_id FROM boat_species WHERE species_id = $1", [greatBarracudaId]);
    var moved = 0;
    for (var i = 0; i < gbBoats.rows.length; i++) {
      var boatId = gbBoats.rows[i].boat_id;
      var existing = await client.query(
        "SELECT boat_id FROM boat_species WHERE boat_id = $1 AND species_id = $2",
        [boatId, barracudaId]
      );
      if (existing.rows.length === 0) {
        await client.query("INSERT INTO boat_species (boat_id, species_id) VALUES ($1, $2)", [boatId, barracudaId]);
        moved++;
      }
    }

    // Delete Great Barracuda associations, aliases, and record
    await client.query("DELETE FROM boat_species WHERE species_id = $1", [greatBarracudaId]);
    await client.query("DELETE FROM species_aliases WHERE species_id = $1", [greatBarracudaId]);
    await client.query("DELETE FROM species WHERE id = $1", [greatBarracudaId]);
    console.log("  Merged Great Barracuda into Barracuda (" + moved + " boats transferred)");

    // Update Barracuda description to cover both species
    await client.query(
      "UPDATE species SET name = $1, scientific_name = $2, description = $3 WHERE id = $4",
      [
        "Barracuda",
        "Sphyraena spp.",
        "Fast, aggressive predators found in both the Pacific (California Barracuda) and Atlantic (Great Barracuda). A common catch on party boats, known for explosive strikes and razor-sharp teeth.",
        barracudaId,
      ]
    );
    console.log("  Updated Barracuda entry to cover both species");

    // Add aliases for both common names
    await client.query("DELETE FROM species_aliases WHERE species_id = $1", [barracudaId]);
    var aliases = [
      ["California Barracuda", "california barracuda"],
      ["Great Barracuda", "great barracuda"],
      ["Pacific Barracuda", "pacific barracuda"],
    ];
    for (var j = 0; j < aliases.length; j++) {
      await client.query(
        "INSERT INTO species_aliases (species_id, name, name_lower) VALUES ($1, $2, $3)",
        [barracudaId, aliases[j][0], aliases[j][1]]
      );
    }
    console.log("  Added aliases: California Barracuda, Great Barracuda, Pacific Barracuda");
  } else {
    if (!barracudaId) console.log("  SKIP: barracuda not found");
    if (!greatBarracudaId) console.log("  SKIP: great-barracuda not found");
  }

  console.log("\n=== Step 7: Verify final state ===\n");

  var cats = await client.query(
    "SELECT sc.name, sc.slug, count(s.id) as species_count, " +
    "sum(CASE WHEN EXISTS (SELECT 1 FROM boat_species bs WHERE bs.species_id = s.id) THEN 1 ELSE 0 END) as with_boats " +
    "FROM species_categories sc " +
    "LEFT JOIN species s ON s.category_id = sc.id " +
    "GROUP BY sc.id, sc.name, sc.slug, sc.sort_order " +
    "ORDER BY sc.sort_order"
  );

  var totalSp = 0;
  var totalLinked = 0;
  console.log("Category | Species | With Boats");
  console.log("---------|---------|----------");
  for (var k = 0; k < cats.rows.length; k++) {
    var c = cats.rows[k];
    console.log(c.name + " | " + c.species_count + " | " + c.with_boats);
    totalSp += parseInt(c.species_count);
    totalLinked += parseInt(c.with_boats);
  }
  console.log("---------|---------|----------");
  console.log("TOTAL | " + totalSp + " | " + totalLinked);

  var uncat = await client.query("SELECT count(*) as cnt FROM species WHERE category_id IS NULL");
  console.log("\nUncategorized: " + uncat.rows[0].cnt);

  console.log("\nDone!");
  await client.end();
  process.exit(0);
}

main().catch(function (e) {
  console.error("Error:", e);
  process.exit(1);
});
