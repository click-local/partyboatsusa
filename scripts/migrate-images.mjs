#!/usr/bin/env node
/**
 * Image Migration Script
 * Downloads all images from Replit object storage → uploads to Supabase Storage → updates DB URLs
 *
 * Usage: node scripts/migrate-images.mjs
 */

import pg from "pg";
import { createClient } from "@supabase/supabase-js";
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

const REPLIT_BASE = "https://partyboats.replit.app";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = "boat-images";

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function query(text, params) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

/**
 * Download image from Replit, upload to Supabase Storage, return new URL
 */
async function migrateImage(oldUrl) {
  if (!oldUrl || !oldUrl.includes("/objects/uploads/")) return null;

  // Extract the UUID from the URL
  const uuid = oldUrl.split("/objects/uploads/")[1];
  if (!uuid) return null;

  // Build Replit URL
  const replitUrl = `${REPLIT_BASE}/objects/uploads/${uuid}`;

  try {
    // Download from Replit
    const response = await fetch(replitUrl);
    if (!response.ok) {
      console.error(`  Failed to download ${uuid}: ${response.status}`);
      return null;
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const buffer = Buffer.from(await response.arrayBuffer());

    // Determine extension from content type
    const extMap = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };
    const ext = extMap[contentType] || "jpg";
    const fileName = `migrated/${uuid}.${ext}`;

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, buffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error(`  Upload failed for ${uuid}: ${error.message}`);
      return null;
    }

    // Get public URL
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
    return data.publicUrl;
  } catch (err) {
    console.error(`  Error migrating ${uuid}: ${err.message}`);
    return null;
  }
}

// ============================================================
// Migration Steps
// ============================================================

async function migrateBoatImages() {
  console.log("\n=== Migrating Boat Primary Images ===");
  const { rows } = await query(
    `SELECT id, primary_image_url FROM boats WHERE primary_image_url LIKE '%/objects/uploads/%'`
  );
  console.log(`  Found ${rows.length} boats with Replit images`);

  let success = 0, failed = 0;
  for (const row of rows) {
    const newUrl = await migrateImage(row.primary_image_url);
    if (newUrl) {
      await query(`UPDATE boats SET primary_image_url = $1 WHERE id = $2`, [newUrl, row.id]);
      console.log(`  ✓ Boat ${row.id}: migrated`);
      success++;
    } else {
      console.log(`  ✗ Boat ${row.id}: failed`);
      failed++;
    }
  }
  console.log(`  Done: ${success} success, ${failed} failed`);
}

async function migrateBoatGalleries() {
  console.log("\n=== Migrating Boat Gallery Images ===");
  const { rows } = await query(
    `SELECT id, gallery_image_urls FROM boats WHERE array_length(gallery_image_urls, 1) > 0`
  );
  console.log(`  Found ${rows.length} boats with gallery images`);

  let totalImages = 0, success = 0;
  for (const row of rows) {
    const urls = row.gallery_image_urls || [];
    const newUrls = [];
    let changed = false;

    for (const url of urls) {
      if (url && url.includes("/objects/uploads/")) {
        totalImages++;
        const newUrl = await migrateImage(url);
        if (newUrl) {
          newUrls.push(newUrl);
          changed = true;
          success++;
        } else {
          newUrls.push(url); // Keep old URL if migration fails
        }
      } else {
        newUrls.push(url);
      }
    }

    if (changed) {
      await query(`UPDATE boats SET gallery_image_urls = $1 WHERE id = $2`, [newUrls, row.id]);
      console.log(`  ✓ Boat ${row.id}: gallery updated`);
    }
  }
  console.log(`  Done: ${success}/${totalImages} gallery images migrated`);
}

async function migrateBragBoardPhotos() {
  console.log("\n=== Migrating Brag Board Photos ===");
  const { rows } = await query(
    `SELECT id, photo_url FROM brag_board_photos WHERE photo_url LIKE '%/objects/uploads/%'`
  );
  console.log(`  Found ${rows.length} brag board photos with Replit images`);

  let success = 0, failed = 0;
  for (const row of rows) {
    const newUrl = await migrateImage(row.photo_url);
    if (newUrl) {
      await query(`UPDATE brag_board_photos SET photo_url = $1 WHERE id = $2`, [newUrl, row.id]);
      console.log(`  ✓ Photo ${row.id}: migrated`);
      success++;
    } else {
      console.log(`  ✗ Photo ${row.id}: failed`);
      failed++;
    }
  }
  console.log(`  Done: ${success} success, ${failed} failed`);
}

async function migrateSiteSettings() {
  console.log("\n=== Migrating Site Settings Images ===");
  const { rows } = await query(`SELECT id, logo_url, hero_image_url, hero_images FROM site_settings LIMIT 1`);
  if (rows.length === 0) { console.log("  No site settings found"); return; }

  const settings = rows[0];

  // Logo
  if (settings.logo_url && settings.logo_url.includes("/objects/uploads/")) {
    const newUrl = await migrateImage(settings.logo_url);
    if (newUrl) {
      await query(`UPDATE site_settings SET logo_url = $1 WHERE id = $2`, [newUrl, settings.id]);
      console.log(`  ✓ Logo migrated`);
    }
  }

  // Hero image
  if (settings.hero_image_url && settings.hero_image_url.includes("/objects/uploads/")) {
    const newUrl = await migrateImage(settings.hero_image_url);
    if (newUrl) {
      await query(`UPDATE site_settings SET hero_image_url = $1 WHERE id = $2`, [newUrl, settings.id]);
      console.log(`  ✓ Hero image migrated`);
    }
  }

  // Hero images array
  if (settings.hero_images && settings.hero_images.length > 0) {
    const newUrls = [];
    let changed = false;
    for (const url of settings.hero_images) {
      if (url && url.includes("/objects/uploads/")) {
        const newUrl = await migrateImage(url);
        if (newUrl) { newUrls.push(newUrl); changed = true; }
        else { newUrls.push(url); }
      } else {
        newUrls.push(url);
      }
    }
    if (changed) {
      await query(`UPDATE site_settings SET hero_images = $1 WHERE id = $2`, [newUrls, settings.id]);
      console.log(`  ✓ Hero images array migrated`);
    }
  }
}

async function migrateDestinationPages() {
  console.log("\n=== Migrating Destination Page Images ===");
  const { rows } = await query(
    `SELECT id, hero_image_url, card_image_url FROM destination_pages
     WHERE hero_image_url LIKE '%/objects/uploads/%' OR card_image_url LIKE '%/objects/uploads/%'`
  );
  console.log(`  Found ${rows.length} destination pages with Replit images`);

  for (const row of rows) {
    if (row.hero_image_url && row.hero_image_url.includes("/objects/uploads/")) {
      const newUrl = await migrateImage(row.hero_image_url);
      if (newUrl) {
        await query(`UPDATE destination_pages SET hero_image_url = $1 WHERE id = $2`, [newUrl, row.id]);
        console.log(`  ✓ Page ${row.id} hero migrated`);
      }
    }
    if (row.card_image_url && row.card_image_url.includes("/objects/uploads/")) {
      const newUrl = await migrateImage(row.card_image_url);
      if (newUrl) {
        await query(`UPDATE destination_pages SET card_image_url = $1 WHERE id = $2`, [newUrl, row.id]);
        console.log(`  ✓ Page ${row.id} card migrated`);
      }
    }
  }
}

// ============================================================
// Main
// ============================================================

async function main() {
  console.log("=== Image Migration: Replit → Supabase Storage ===");
  console.log(`Source: ${REPLIT_BASE}`);
  console.log(`Target: ${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`);

  try {
    // Test DB connection
    const { rows } = await query("SELECT NOW() as now");
    console.log(`DB connected at ${rows[0].now}`);

    // Ensure bucket exists (will error if already exists, that's fine)
    const { error: bucketError } = await supabase.storage.createBucket(BUCKET, { public: true });
    if (bucketError && !bucketError.message.includes("already exists")) {
      console.error("Bucket error:", bucketError.message);
    }

    await migrateBoatImages();
    await migrateBoatGalleries();
    await migrateBragBoardPhotos();
    await migrateSiteSettings();
    await migrateDestinationPages();

    // Verify — count remaining Replit URLs
    const { rows: remaining } = await query(`
      SELECT
        (SELECT COUNT(*) FROM boats WHERE primary_image_url LIKE '%/objects/uploads/%') as boats,
        (SELECT COUNT(*) FROM brag_board_photos WHERE photo_url LIKE '%/objects/uploads/%') as photos,
        (SELECT COUNT(*) FROM destination_pages WHERE hero_image_url LIKE '%/objects/uploads/%' OR card_image_url LIKE '%/objects/uploads/%') as dest_pages
    `);
    console.log("\n=== Remaining Replit URLs ===");
    console.log(`  Boats: ${remaining[0].boats}`);
    console.log(`  Brag Board: ${remaining[0].photos}`);
    console.log(`  Destination Pages: ${remaining[0].dest_pages}`);

    console.log("\n✓ Image migration complete!");
  } catch (err) {
    console.error("\n✗ Migration failed:", err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
