#!/usr/bin/env node
/**
 * Data Migration Script
 * Pulls data from live partyboatsusa.com Replit API → inserts into Supabase
 *
 * Usage: node scripts/migrate.mjs
 * Requires: DATABASE_URL in .env.local
 */

import pg from "pg";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local
const envPath = resolve(__dirname, "../.env.local");
const envContent = readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

const BASE_URL = "https://partyboatsusa.com/api";
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function fetchJSON(path) {
  const url = `${BASE_URL}${path}`;
  console.log(`  Fetching ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.json();
}

async function query(text, params) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

// ============================================================
// Migration Steps
// ============================================================

async function migrateStates() {
  console.log("\n=== Migrating States ===");
  const states = await fetchJSON("/states");
  for (const s of states) {
    await query(
      `INSERT INTO states (id, name, code, slug) VALUES ($1, $2, $3, $4) ON CONFLICT (code) DO NOTHING`,
      [s.id, s.name, s.code, s.slug]
    );
  }
  // Reset sequence
  await query(`SELECT setval('states_id_seq', (SELECT COALESCE(MAX(id), 0) FROM states))`);
  console.log(`  ✓ ${states.length} states`);
}

async function migrateCities() {
  console.log("\n=== Migrating Cities ===");
  const cities = await fetchJSON("/cities");
  for (const c of cities) {
    await query(
      `INSERT INTO cities (id, name, slug, state_code) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
      [c.id, c.name, c.slug, c.stateCode]
    );
  }
  await query(`SELECT setval('cities_id_seq', (SELECT COALESCE(MAX(id), 0) FROM cities))`);
  console.log(`  ✓ ${cities.length} cities`);
}

async function migrateTripTypes() {
  console.log("\n=== Migrating Trip Types ===");
  const types = await fetchJSON("/trip-types");
  for (const t of types) {
    await query(
      `INSERT INTO trip_types (id, name, slug, sort_order) VALUES ($1, $2, $3, $4) ON CONFLICT (slug) DO NOTHING`,
      [t.id, t.name, t.slug, t.sortOrder ?? 0]
    );
  }
  await query(`SELECT setval('trip_types_id_seq', (SELECT COALESCE(MAX(id), 0) FROM trip_types))`);
  console.log(`  ✓ ${types.length} trip types`);
}

async function migrateAmenities() {
  console.log("\n=== Migrating Amenities ===");
  const amenities = await fetchJSON("/amenities");
  for (const a of amenities) {
    await query(
      `INSERT INTO amenities (id, name, slug, icon, sort_order) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (slug) DO NOTHING`,
      [a.id, a.name, a.slug, a.icon || "circle", a.sortOrder ?? 0]
    );
  }
  await query(`SELECT setval('amenities_id_seq', (SELECT COALESCE(MAX(id), 0) FROM amenities))`);
  console.log(`  ✓ ${amenities.length} amenities`);
}

async function migrateMembershipTiers() {
  console.log("\n=== Migrating Membership Tiers ===");
  const tiers = await fetchJSON("/membership-tiers");
  for (const t of tiers) {
    await query(
      `INSERT INTO membership_tiers (id, name, description, monthly_price, yearly_price, search_boost,
        show_phone, show_email, show_website, show_booking_url, show_social_media,
        display_badge, badge_color, sort_order, is_highest_tier, show_analytics)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       ON CONFLICT (name) DO NOTHING`,
      [
        t.id, t.name, t.description || "", t.monthlyPrice, t.yearlyPrice,
        t.searchBoost ?? 0, t.showPhone ?? true, t.showEmail ?? false,
        t.showWebsite ?? true, t.showBookingUrl ?? false, t.showSocialMedia ?? false,
        t.displayBadge ?? false, t.badgeColor, t.sortOrder ?? 0,
        t.isHighestTier ?? false, t.showAnalytics ?? false,
      ]
    );
  }
  await query(`SELECT setval('membership_tiers_id_seq', (SELECT COALESCE(MAX(id), 0) FROM membership_tiers))`);
  console.log(`  ✓ ${tiers.length} membership tiers`);
}

async function migrateBoats() {
  console.log("\n=== Migrating Boats ===");
  const data = await fetchJSON("/boats?limit=500");
  const boats = data.boats || data;

  // Build a map of trip type names → IDs
  const tripTypes = await fetchJSON("/trip-types");
  const ttMap = new Map(tripTypes.map((t) => [t.name, t.id]));

  // Build a map of amenity names → IDs
  const amenities = await fetchJSON("/amenities");
  const amMap = new Map(amenities.map((a) => [a.name, a.id]));

  for (const b of boats) {
    await query(
      `INSERT INTO boats (
        id, operator_id, name, operator_name, slug,
        description_short, description_long, state_code, city_name, port_name,
        street_address, zip_code, latitude, longitude,
        min_price_per_person, max_price_per_person, capacity,
        phone, email, website_url, booking_url,
        booking_link_target, booking_button_text,
        social_x, social_facebook, social_instagram, social_youtube,
        is_featured, is_featured_admin, is_published,
        rating, review_count,
        primary_image_url, image_focal_point_x, image_focal_point_y,
        header_crop_data, card_crop_data,
        gallery_image_urls, target_species, trip_types,
        whats_included, available_extras,
        seo_title, seo_description, seo_keywords
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13, $14,
        $15, $16, $17,
        $18, $19, $20, $21,
        $22, $23,
        $24, $25, $26, $27,
        $28, $29, $30,
        $31, $32,
        $33, $34, $35,
        $36, $37,
        $38, $39, $40,
        $41, $42,
        $43, $44, $45
      ) ON CONFLICT (slug) DO NOTHING`,
      [
        b.id, null, // operatorId will be null — no Supabase auth operators to link yet
        b.name, b.operatorName, b.slug,
        b.descriptionShort, b.descriptionLong, b.stateCode, b.cityName, b.portName,
        b.streetAddress, b.zipCode, b.latitude, b.longitude,
        b.minPricePerPerson, b.maxPricePerPerson, b.capacity,
        b.phone, b.email, b.websiteUrl, b.bookingUrl,
        b.bookingLinkTarget || "_modal", b.bookingButtonText || "Book Now",
        b.socialX, b.socialFacebook, b.socialInstagram, b.socialYoutube,
        b.isFeatured ?? false, b.isFeaturedAdmin ?? false, b.isPublished ?? true,
        b.rating ?? "0.0", b.reviewCount ?? 0,
        b.primaryImageUrl, b.imageFocalPointX ?? 50, b.imageFocalPointY ?? 50,
        b.headerCropData, b.cardCropData,
        b.galleryImageUrls || [], b.targetSpecies || [], b.tripTypes || [],
        b.whatsIncluded || [], b.availableExtras || [],
        b.seoTitle, b.seoDescription, b.seoKeywords,
      ]
    );

    // Insert boat_trip_types junction records
    if (b.amenities) {
      for (const am of b.amenities) {
        const amenityId = amMap.get(am.name) || am.id;
        if (amenityId) {
          await query(
            `INSERT INTO boat_amenities (boat_id, amenity_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [b.id, amenityId]
          );
        }
      }
    }

    // For trip types, match by name from the tripTypes array field
    if (b.tripTypes && Array.isArray(b.tripTypes)) {
      for (const ttName of b.tripTypes) {
        const ttId = ttMap.get(ttName);
        if (ttId) {
          await query(
            `INSERT INTO boat_trip_types (boat_id, trip_type_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [b.id, ttId]
          );
        }
      }
    }
  }

  await query(`SELECT setval('boats_id_seq', (SELECT COALESCE(MAX(id), 0) FROM boats))`);
  console.log(`  ✓ ${boats.length} boats`);
}

async function migrateReviews() {
  console.log("\n=== Migrating Reviews ===");
  // Need to fetch reviews per boat — get all boat IDs first
  const { rows: boats } = await query(`SELECT id FROM boats ORDER BY id`);
  let total = 0;

  for (const boat of boats) {
    try {
      const reviews = await fetchJSON(`/boats/${boat.id}/reviews`);
      if (!Array.isArray(reviews) || reviews.length === 0) continue;

      for (const r of reviews) {
        await query(
          `INSERT INTO reviews (id, boat_id, user_name, user_email, rating, title, comment, trip_date, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           ON CONFLICT DO NOTHING`,
          [
            r.id, r.boatId, r.userName, r.userEmail, r.rating,
            r.title, r.comment, r.tripDate, r.status || "approved",
            r.createdAt ? new Date(r.createdAt) : new Date(),
            r.updatedAt ? new Date(r.updatedAt) : new Date(),
          ]
        );
        total++;
      }
    } catch {
      // Some boats may not have reviews endpoint or may 404
    }
  }

  await query(`SELECT setval('reviews_id_seq', (SELECT COALESCE(MAX(id), 0) FROM reviews))`);
  console.log(`  ✓ ${total} reviews`);
}

async function migrateBragBoard() {
  console.log("\n=== Migrating Brag Board Photos ===");
  let page = 1;
  let total = 0;

  while (true) {
    try {
      const data = await fetchJSON(`/brag-board?limit=100&page=${page}`);
      const photos = data.photos || data;
      if (!Array.isArray(photos) || photos.length === 0) break;

      for (const p of photos) {
        await query(
          `INSERT INTO brag_board_photos (id, boat_id, submitter_name, submitter_email, submitter_type, photo_url, catch_description, status, submitted_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT DO NOTHING`,
          [
            p.id, p.boatId, p.submitterName, p.submitterEmail,
            p.submitterType || "customer", p.photoUrl, p.catchDescription,
            p.status || "approved",
            p.submittedAt ? new Date(p.submittedAt) : new Date(),
          ]
        );
        total++;
      }

      if (photos.length < 100) break;
      page++;
    } catch {
      break;
    }
  }

  if (total > 0) {
    await query(`SELECT setval('brag_board_photos_id_seq', (SELECT COALESCE(MAX(id), 0) FROM brag_board_photos))`);
  }
  console.log(`  ✓ ${total} brag board photos`);
}

async function migrateSiteSettings() {
  console.log("\n=== Migrating Site Settings ===");
  try {
    const s = await fetchJSON("/site-settings");
    if (s) {
      await query(
        `INSERT INTO site_settings (id, site_name, site_tagline, hero_image_url, hero_images, hero_video_url,
          hero_transition_duration, logo_url, hero_headline, hero_subheadline,
          featured_destinations, featured_column, featured_column_label, show_post_dates)
         VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (id) DO UPDATE SET
           site_name = $1, site_tagline = $2, hero_image_url = $3, hero_images = $4,
           hero_video_url = $5, hero_transition_duration = $6, logo_url = $7,
           hero_headline = $8, hero_subheadline = $9, featured_destinations = $10,
           featured_column = $11, featured_column_label = $12, show_post_dates = $13`,
        [
          s.siteName || "Party Boats USA",
          s.siteTagline || "Find the Best Party Boat Fishing Trips in the USA",
          s.heroImageUrl, s.heroImages || [],
          s.heroVideoUrl, s.heroTransitionDuration ?? 5000,
          s.logoUrl, s.heroHeadline, s.heroSubheadline,
          typeof s.featuredDestinations === "string" ? s.featuredDestinations : JSON.stringify(s.featuredDestinations || []),
          s.featuredColumn || "pro",
          s.featuredColumnLabel || "Best Value",
          s.showPostDates ?? true,
        ]
      );
      console.log(`  ✓ site settings migrated`);
    }
  } catch (err) {
    console.log(`  ⚠ Could not migrate site settings: ${err.message}`);
  }
}

async function migrateDestinationPages() {
  console.log("\n=== Migrating Destination Pages ===");
  try {
    const pages = await fetchJSON("/destination-pages");
    if (!Array.isArray(pages)) { console.log("  No destination pages found"); return; }

    for (const p of pages) {
      const { rows } = await query(
        `INSERT INTO destination_pages (id, type, reference_id, is_published, seo_title, seo_description, seo_keywords,
          hero_image_url, hero_headline, hero_subheadline, card_image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO NOTHING
         RETURNING id`,
        [
          p.id, p.type, p.referenceId, p.isPublished ?? false,
          p.seoTitle, p.seoDescription, p.seoKeywords,
          p.heroImageUrl, p.heroHeadline, p.heroSubheadline, p.cardImageUrl,
        ]
      );

      // Migrate content blocks if the page was inserted
      if (rows.length > 0 && p.contentBlocks && Array.isArray(p.contentBlocks)) {
        for (const block of p.contentBlocks) {
          await query(
            `INSERT INTO content_blocks (id, destination_page_id, block_type, block_order, content, is_visible)
             VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING`,
            [
              block.id, p.id, block.blockType, block.blockOrder ?? 0,
              JSON.stringify(block.content), block.isVisible ?? true,
            ]
          );
        }
      }
    }

    await query(`SELECT setval('destination_pages_id_seq', (SELECT COALESCE(MAX(id), 0) FROM destination_pages))`);
    await query(`SELECT setval('content_blocks_id_seq', (SELECT COALESCE(MAX(id), 0) FROM content_blocks))`);
    console.log(`  ✓ ${pages.length} destination pages`);
  } catch (err) {
    console.log(`  ⚠ Could not migrate destination pages: ${err.message}`);
  }
}

async function migratePageSeo() {
  console.log("\n=== Migrating Page SEO Settings ===");
  try {
    const seoSettings = await fetchJSON("/page-seo-settings");
    if (!Array.isArray(seoSettings)) { console.log("  No page SEO settings found"); return; }

    for (const s of seoSettings) {
      await query(
        `INSERT INTO page_seo_settings (page_key, seo_title, seo_description, seo_keywords)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (page_key) DO NOTHING`,
        [s.pageKey, s.seoTitle, s.seoDescription, s.seoKeywords]
      );
    }
    console.log(`  ✓ ${seoSettings.length} page SEO entries`);
  } catch (err) {
    console.log(`  ⚠ Could not migrate page SEO: ${err.message}`);
  }
}

async function migrateFeatureComparison() {
  console.log("\n=== Migrating Feature Comparison ===");
  try {
    const data = await fetchJSON("/feature-comparison-items");
    if (!data) { console.log("  No feature comparison data"); return; }

    const items = data.items || data;
    if (!Array.isArray(items)) { console.log("  No feature items found"); return; }

    for (const item of items) {
      await query(
        `INSERT INTO feature_comparison_items (id, feature_name, description, icon, sort_order, is_active)
         VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING`,
        [
          item.id, item.featureName || item.name, item.description,
          item.icon, item.sortOrder ?? 0, item.isActive ?? true,
        ]
      );

      // Migrate tier values
      if (item.tierValues && Array.isArray(item.tierValues)) {
        for (const tv of item.tierValues) {
          await query(
            `INSERT INTO feature_tier_values (feature_id, tier_id, included, custom_value)
             VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
            [item.id, tv.tierId, tv.included ?? false, tv.customValue]
          );
        }
      }
    }

    await query(`SELECT setval('feature_comparison_items_id_seq', (SELECT COALESCE(MAX(id), 0) FROM feature_comparison_items))`);
    console.log(`  ✓ ${items.length} feature comparison items`);
  } catch (err) {
    console.log(`  ⚠ Could not migrate feature comparison: ${err.message}`);
  }
}

// ============================================================
// Main
// ============================================================

async function main() {
  console.log("=== PartyBoatsUSA Data Migration ===");
  console.log(`Source: ${BASE_URL}`);
  console.log(`Target: Supabase (${process.env.DATABASE_URL?.split("@")[1]?.split("/")[0] || "unknown"})`);

  try {
    // Test connection
    const { rows } = await query("SELECT NOW() as now");
    console.log(`Connected at ${rows[0].now}`);

    // Run migrations in dependency order
    await migrateStates();
    await migrateCities();
    await migrateTripTypes();
    await migrateAmenities();
    await migrateMembershipTiers();
    await migrateBoats();
    await migrateReviews();
    await migrateBragBoard();
    await migrateSiteSettings();
    await migrateDestinationPages();
    await migratePageSeo();
    await migrateFeatureComparison();

    // Print summary
    console.log("\n=== Migration Summary ===");
    const tables = [
      "states", "cities", "trip_types", "amenities", "membership_tiers",
      "boats", "boat_trip_types", "boat_amenities", "reviews",
      "brag_board_photos", "site_settings", "destination_pages",
      "content_blocks", "page_seo_settings", "feature_comparison_items",
    ];
    for (const table of tables) {
      const { rows } = await query(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`  ${table}: ${rows[0].count} rows`);
    }

    console.log("\n✓ Migration complete!");
  } catch (err) {
    console.error("\n✗ Migration failed:", err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
