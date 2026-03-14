-- Create species reference table (mirrors trip_types structure)
CREATE TABLE IF NOT EXISTS "species" (
  "id" serial PRIMARY KEY,
  "name" text NOT NULL,
  "slug" text NOT NULL UNIQUE,
  "sort_order" integer NOT NULL DEFAULT 0
);

-- Create boat_species join table (mirrors boat_trip_types structure)
CREATE TABLE IF NOT EXISTS "boat_species" (
  "id" serial PRIMARY KEY,
  "boat_id" integer NOT NULL REFERENCES "boats"("id") ON DELETE CASCADE,
  "species_id" integer NOT NULL REFERENCES "species"("id") ON DELETE CASCADE
);

-- Migrate existing target_species text array data into the new tables
-- 1. Insert unique species from all boats
INSERT INTO "species" ("name", "slug", "sort_order")
SELECT DISTINCT
  trim(unnest) AS name,
  lower(regexp_replace(trim(unnest), '[^a-zA-Z0-9]+', '-', 'g')) AS slug,
  0 AS sort_order
FROM (
  SELECT unnest(target_species) FROM boats WHERE array_length(target_species, 1) > 0
) sub
WHERE trim(unnest) != ''
ON CONFLICT (slug) DO NOTHING;

-- 2. Create boat_species associations from existing data
INSERT INTO "boat_species" ("boat_id", "species_id")
SELECT b.id, s.id
FROM boats b,
     unnest(b.target_species) AS species_name
JOIN species s ON s.slug = lower(regexp_replace(trim(species_name), '[^a-zA-Z0-9]+', '-', 'g'))
WHERE array_length(b.target_species, 1) > 0
  AND trim(species_name) != ''
ON CONFLICT DO NOTHING;
