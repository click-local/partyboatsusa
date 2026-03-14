/**
 * Cleanup orphaned species from pre-overhaul free-text entries.
 * Merges boat associations from generic names into the correct specific species,
 * adds missing species, and removes junk entries.
 *
 * Run with: DATABASE_URL="..." npx tsx scripts/cleanup-orphan-species.ts
 */

import { db } from "../src/lib/db";
import { species, speciesAliases, speciesCategories, boatSpecies } from "../src/lib/db/schema";
import { eq, sql, and } from "drizzle-orm";

// Map orphan slug → target slug (merge boat associations, then delete orphan)
const MERGE_MAP: Record<string, string> = {
  "calico-bass": "kelp-bass",             // Calico Bass = Kelp Bass (SoCal name)
  "flounder": "summer-flounder",           // Generic flounder → Summer Flounder
  "triggerfish": "gray-triggerfish",       // Generic → Gray Triggerfish
  "amberjack": "greater-amberjack",        // Generic → Greater Amberjack
  "blackfish": "tautog",                   // Blackfish = Tautog (Northeast name)
  "fluke": "summer-flounder",             // Fluke = Summer Flounder
  "kingfish": "king-mackerel",            // East Coast kingfish = King Mackerel
  "false-albacore": "little-tunny",       // False Albacore = Little Tunny
  "scup": "porgy",                         // Scup = Porgy (same fish)
  "cod": "atlantic-cod",                   // Generic → Atlantic Cod
  "bonito": "atlantic-bonito",             // Generic → Atlantic Bonito
  "pompano": "florida-pompano",            // Generic → Florida Pompano
  "grey-trout-weakfish": "weakfish",       // Grey Trout = Weakfish
  "sea-bass": "black-sea-bass",            // Generic → Black Sea Bass
  "snapper": "red-snapper",               // Generic → Red Snapper (most targeted)
  "grouper": "red-grouper",               // Generic → Red Grouper (most common)
  "tuna": "yellowfin-tuna",               // Generic → Yellowfin (most targeted)
  "yellowtail": "california-yellowtail",   // Generic → California Yellowtail
  "sheephead": "sheepshead",              // Typo variant → Sheepshead
  "sand-bass": "barred-sand-bass",        // Generic → Barred Sand Bass
  "croaker": "atlantic-croaker",          // Generic → Atlantic Croaker
  "trout": "spotted-seatrout",            // Generic → Spotted Seatrout
  "halibut": "california-halibut",         // Generic → California Halibut
  "rockfish": "blue-rockfish",            // Generic → Blue Rockfish (most common party boat)
  "shark": "blacktip-shark",              // Generic → Blacktip (most common party boat shark)
};

// Delete these - not real species or not relevant
const DELETE_SLUGS = [
  "crab-combos",       // Not a fish species
  "sport-fish",        // Generic term
  "snapper-blues",     // Slang for baby bluefish
  "whitefish",         // Not a standard saltwater species
];

// Add these missing species
const ADD_SPECIES = [
  {
    name: "Chinook Salmon", slug: "chinook-salmon", category: "pacific-game-fish",
    scientificName: "Oncorhynchus tshawytscha",
    aliases: ["King Salmon", "Spring Salmon", "Tyee"],
    description: "The largest Pacific salmon species, prized by anglers for their powerful runs and excellent eating quality. Found from Alaska to California.",
  },
  {
    name: "Coho Salmon", slug: "coho-salmon", category: "pacific-game-fish",
    scientificName: "Oncorhynchus kisutch",
    aliases: ["Silver Salmon", "Silvers"],
    description: "An acrobatic Pacific salmon known for leaping fights and bright silver coloring. Popular with party boats from Alaska to Oregon.",
  },
  {
    name: "White Grunt", slug: "white-grunt", category: "other-species",
    scientificName: "Haemulon plumierii",
    aliases: ["Key West Grunt", "Grunt"],
    description: "A common reef fish found throughout the South Atlantic and Gulf of Mexico, popular on party boats for their reliable bite and good table fare.",
  },
  {
    name: "Pink Salmon", slug: "pink-salmon", category: "pacific-game-fish",
    scientificName: "Oncorhynchus gorbuscha",
    aliases: ["Humpy", "Humpback Salmon"],
    description: "The most abundant Pacific salmon species, running in huge numbers on odd years. A fun party boat target in the Pacific Northwest and Alaska.",
  },
];

async function main() {
  console.log("Starting orphan cleanup...\n");

  // 1. Add missing species
  console.log("Adding missing species...");
  for (const sp of ADD_SPECIES) {
    const catRow = await db.select({ id: speciesCategories.id }).from(speciesCategories).where(eq(speciesCategories.slug, sp.category)).limit(1);
    const categoryId = catRow[0]?.id || null;

    // Check if already exists (from orphan list or previous run)
    const existing = await db.select({ id: species.id }).from(species).where(eq(species.slug, sp.slug)).limit(1);

    if (existing.length > 0) {
      // Update it with the new data
      await db.update(species).set({
        name: sp.name,
        categoryId,
        scientificName: sp.scientificName,
        description: sp.description,
      }).where(eq(species.id, existing[0].id));
      console.log(`  Updated existing: ${sp.name}`);

      // Set aliases
      await db.delete(speciesAliases).where(eq(speciesAliases.speciesId, existing[0].id));
      if (sp.aliases.length > 0) {
        await db.insert(speciesAliases).values(
          sp.aliases.map(a => ({ speciesId: existing[0].id, name: a, nameLower: a.toLowerCase() }))
        );
      }
    } else {
      const [created] = await db.insert(species).values({
        name: sp.name,
        slug: sp.slug,
        categoryId,
        scientificName: sp.scientificName,
        description: sp.description,
      }).returning();
      if (sp.aliases.length > 0) {
        await db.insert(speciesAliases).values(
          sp.aliases.map(a => ({ speciesId: created.id, name: a, nameLower: a.toLowerCase() }))
        );
      }
      console.log(`  Created: ${sp.name}`);
    }
  }

  // 2. Merge orphans into target species
  console.log("\nMerging orphaned species...");
  for (const [orphanSlug, targetSlug] of Object.entries(MERGE_MAP)) {
    const orphan = await db.select({ id: species.id, name: species.name })
      .from(species).where(eq(species.slug, orphanSlug)).limit(1);
    const target = await db.select({ id: species.id, name: species.name })
      .from(species).where(eq(species.slug, targetSlug)).limit(1);

    if (!orphan[0]) {
      console.log(`  Skip: "${orphanSlug}" not found in DB`);
      continue;
    }
    if (!target[0]) {
      console.log(`  ERROR: target "${targetSlug}" not found!`);
      continue;
    }

    // Get boats linked to orphan
    const orphanBoats = await db.select({ boatId: boatSpecies.boatId })
      .from(boatSpecies).where(eq(boatSpecies.speciesId, orphan[0].id));

    let moved = 0;
    for (const { boatId } of orphanBoats) {
      // Check if boat already has the target species
      const existing = await db.select({ boatId: boatSpecies.boatId })
        .from(boatSpecies)
        .where(and(eq(boatSpecies.boatId, boatId), eq(boatSpecies.speciesId, target[0].id)))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(boatSpecies).values({ boatId, speciesId: target[0].id });
        moved++;
      }
    }

    // Delete orphan's boat associations
    await db.delete(boatSpecies).where(eq(boatSpecies.speciesId, orphan[0].id));
    // Delete orphan's aliases
    await db.delete(speciesAliases).where(eq(speciesAliases.speciesId, orphan[0].id));
    // Delete the orphan species
    await db.delete(species).where(eq(species.id, orphan[0].id));

    console.log(`  ${orphan[0].name} → ${target[0].name} (${moved} boats moved, ${orphanBoats.length - moved} already had target)`);
  }

  // 3. Delete junk entries
  console.log("\nDeleting non-species entries...");
  for (const slug of DELETE_SLUGS) {
    const row = await db.select({ id: species.id, name: species.name })
      .from(species).where(eq(species.slug, slug)).limit(1);
    if (!row[0]) {
      console.log(`  Skip: "${slug}" not found`);
      continue;
    }
    await db.delete(boatSpecies).where(eq(boatSpecies.speciesId, row[0].id));
    await db.delete(speciesAliases).where(eq(speciesAliases.speciesId, row[0].id));
    await db.delete(species).where(eq(species.id, row[0].id));
    console.log(`  Deleted: ${row[0].name}`);
  }

  // 4. Also handle "Salmon" - map to Chinook Salmon
  const salmonOrphan = await db.select({ id: species.id }).from(species).where(eq(species.slug, "salmon")).limit(1);
  const chinook = await db.select({ id: species.id }).from(species).where(eq(species.slug, "chinook-salmon")).limit(1);
  if (salmonOrphan[0] && chinook[0]) {
    const salmonBoats = await db.select({ boatId: boatSpecies.boatId }).from(boatSpecies).where(eq(boatSpecies.speciesId, salmonOrphan[0].id));
    let moved = 0;
    for (const { boatId } of salmonBoats) {
      const existing = await db.select({ boatId: boatSpecies.boatId }).from(boatSpecies)
        .where(and(eq(boatSpecies.boatId, boatId), eq(boatSpecies.speciesId, chinook[0].id))).limit(1);
      if (existing.length === 0) { await db.insert(boatSpecies).values({ boatId, speciesId: chinook[0].id }); moved++; }
    }
    await db.delete(boatSpecies).where(eq(boatSpecies.speciesId, salmonOrphan[0].id));
    await db.delete(speciesAliases).where(eq(speciesAliases.speciesId, salmonOrphan[0].id));
    await db.delete(species).where(eq(species.id, salmonOrphan[0].id));
    console.log(`\n  Salmon → Chinook Salmon (${moved} boats moved)`);
  }

  // Also map "White Grunts" → "White Grunt"
  const whiteGruntsOrphan = await db.select({ id: species.id }).from(species).where(eq(species.slug, "white-grunts")).limit(1);
  const whiteGrunt = await db.select({ id: species.id }).from(species).where(eq(species.slug, "white-grunt")).limit(1);
  if (whiteGruntsOrphan[0] && whiteGrunt[0]) {
    const gBoats = await db.select({ boatId: boatSpecies.boatId }).from(boatSpecies).where(eq(boatSpecies.speciesId, whiteGruntsOrphan[0].id));
    for (const { boatId } of gBoats) {
      const existing = await db.select({ boatId: boatSpecies.boatId }).from(boatSpecies)
        .where(and(eq(boatSpecies.boatId, boatId), eq(boatSpecies.speciesId, whiteGrunt[0].id))).limit(1);
      if (existing.length === 0) { await db.insert(boatSpecies).values({ boatId, speciesId: whiteGrunt[0].id }); }
    }
    await db.delete(boatSpecies).where(eq(boatSpecies.speciesId, whiteGruntsOrphan[0].id));
    await db.delete(speciesAliases).where(eq(speciesAliases.speciesId, whiteGruntsOrphan[0].id));
    await db.delete(species).where(eq(species.id, whiteGruntsOrphan[0].id));
    console.log(`  White Grunts → White Grunt (merged)`);
  }

  // Check remaining orphans
  const remaining = await db.execute(sql`
    SELECT s.name, s.slug, s.category_id,
      (SELECT count(*) FROM boat_species bs WHERE bs.species_id = s.id) as boat_count
    FROM species s
    WHERE s.category_id IS NULL
    ORDER BY s.name
  `);
  if (remaining.rows.length > 0) {
    console.log(`\nRemaining uncategorized species:`);
    for (const r of remaining.rows) {
      console.log(`  - ${r.name} (${r.slug}) - ${r.boat_count} boats`);
    }
  } else {
    console.log("\nAll species now have categories!");
  }

  console.log("\nCleanup complete!");
  process.exit(0);
}

main().catch((e) => { console.error("Error:", e); process.exit(1); });
