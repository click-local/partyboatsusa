/**
 * Upload all species images from the Dropbox folder to Supabase storage
 * and update the species.image_url in the database.
 *
 * Run with: node scripts/upload-species-images.js
 */

require("dotenv").config({ path: ".env.local" });
var fs = require("fs");
var path = require("path");
var pg = require("pg");

var SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
var SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
var BUCKET = "species-images";
var IMAGES_DIR = path.resolve(__dirname, "../../Species Images");

async function main() {
  // 1. Connect to DB
  var client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  // 2. Get all species slugs from DB
  var res = await client.query("SELECT id, slug, name, image_url FROM species ORDER BY name");
  var speciesMap = {};
  for (var i = 0; i < res.rows.length; i++) {
    speciesMap[res.rows[i].slug] = res.rows[i];
  }

  // 3. Get all PNG files in the images directory
  var files = fs.readdirSync(IMAGES_DIR).filter(function (f) {
    return f.endsWith(".png");
  });

  console.log("Found " + files.length + " images, " + res.rows.length + " species in DB\n");

  // 4. Create bucket if it doesn't exist
  var createBucketRes = await fetch(SUPABASE_URL + "/storage/v1/bucket", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + SERVICE_KEY,
      "Content-Type": "application/json",
      apikey: SERVICE_KEY,
    },
    body: JSON.stringify({
      id: BUCKET,
      name: BUCKET,
      public: true,
    }),
  });
  var bucketBody = await createBucketRes.json();
  if (createBucketRes.ok) {
    console.log("Created bucket: " + BUCKET);
  } else if (bucketBody.message && bucketBody.message.includes("already exists")) {
    console.log("Bucket exists: " + BUCKET);
  } else {
    console.log("Bucket response:", bucketBody);
  }
  console.log("");

  // 5. Upload each image and update DB
  var uploaded = 0;
  var skipped = 0;
  var notFound = 0;
  var errors = 0;

  for (var j = 0; j < files.length; j++) {
    var filename = files[j];
    var slug = filename.replace(".png", "");
    var sp = speciesMap[slug];

    if (!sp) {
      console.log("  NO MATCH: " + filename + " (no species with slug '" + slug + "')");
      notFound++;
      continue;
    }

    // Read file
    var filePath = path.join(IMAGES_DIR, filename);
    var fileBuffer = fs.readFileSync(filePath);
    var storagePath = slug + ".png";

    // Upload to Supabase storage (upsert)
    var uploadRes = await fetch(
      SUPABASE_URL + "/storage/v1/object/" + BUCKET + "/" + storagePath,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + SERVICE_KEY,
          "Content-Type": "image/png",
          apikey: SERVICE_KEY,
          "x-upsert": "true",
        },
        body: fileBuffer,
      }
    );

    if (!uploadRes.ok) {
      var errBody = await uploadRes.text();
      console.log("  UPLOAD ERROR: " + filename + " - " + errBody);
      errors++;
      continue;
    }

    // Build public URL
    var publicUrl =
      SUPABASE_URL + "/storage/v1/object/public/" + BUCKET + "/" + storagePath;

    // Update DB
    await client.query("UPDATE species SET image_url = $1 WHERE id = $2", [
      publicUrl,
      sp.id,
    ]);

    uploaded++;
    process.stdout.write("\r  Uploaded " + uploaded + "/" + files.length + ": " + sp.name + "                    ");
  }

  console.log("\n\n=== Summary ===");
  console.log("Uploaded: " + uploaded);
  console.log("Skipped:  " + skipped);
  console.log("No match: " + notFound);
  console.log("Errors:   " + errors);

  // Verify
  var verify = await client.query(
    "SELECT count(*) as total, count(image_url) as with_image FROM species"
  );
  console.log(
    "\nDB: " +
      verify.rows[0].with_image +
      " of " +
      verify.rows[0].total +
      " species have images"
  );

  // Show any without images
  var missing = await client.query(
    "SELECT name, slug FROM species WHERE image_url IS NULL ORDER BY name"
  );
  if (missing.rows.length > 0) {
    console.log("\nMissing images:");
    for (var k = 0; k < missing.rows.length; k++) {
      console.log("  - " + missing.rows[k].name + " (" + missing.rows[k].slug + ")");
    }
  }

  await client.end();
  console.log("\nDone!");
}

main().catch(function (e) {
  console.error("Error:", e);
  process.exit(1);
});
