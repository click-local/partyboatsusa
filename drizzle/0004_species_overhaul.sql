-- Species System Overhaul: categories, aliases, descriptions, suggestions
-- Run after 0003_cleanup_species.sql

BEGIN;

-- ============================================================
-- 1. Create species_categories table
-- ============================================================

CREATE TABLE IF NOT EXISTS "species_categories" (
  "id" serial PRIMARY KEY,
  "name" text NOT NULL,
  "slug" text NOT NULL UNIQUE,
  "sort_order" integer NOT NULL DEFAULT 0,
  "description" text
);

-- ============================================================
-- 2. Add new columns to species table
-- ============================================================

ALTER TABLE "species" ADD COLUMN IF NOT EXISTS "category_id" integer REFERENCES "species_categories"("id");
ALTER TABLE "species" ADD COLUMN IF NOT EXISTS "scientific_name" text;
ALTER TABLE "species" ADD COLUMN IF NOT EXISTS "description" text;
ALTER TABLE "species" ADD COLUMN IF NOT EXISTS "image_url" text;

-- ============================================================
-- 3. Create species_aliases table
-- ============================================================

CREATE TABLE IF NOT EXISTS "species_aliases" (
  "id" serial PRIMARY KEY,
  "species_id" integer NOT NULL REFERENCES "species"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "name_lower" text NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_species_aliases_species_id" ON "species_aliases" ("species_id");
CREATE INDEX IF NOT EXISTS "idx_species_aliases_name_lower" ON "species_aliases" ("name_lower");

-- ============================================================
-- 4. Create species_suggestions table (operator-submitted)
-- ============================================================

CREATE TABLE IF NOT EXISTS "species_suggestions" (
  "id" serial PRIMARY KEY,
  "operator_id" integer NOT NULL REFERENCES "operators"("id") ON DELETE CASCADE,
  "species_name" text NOT NULL,
  "common_names" text,
  "notes" text,
  "status" text NOT NULL DEFAULT 'pending',
  "created_at" timestamp NOT NULL DEFAULT now()
);

-- ============================================================
-- 5. Add indexes for performance
-- ============================================================

CREATE INDEX IF NOT EXISTS "idx_species_category_id" ON "species" ("category_id");
CREATE INDEX IF NOT EXISTS "idx_species_slug" ON "species" ("slug");
CREATE INDEX IF NOT EXISTS "idx_species_suggestions_status" ON "species_suggestions" ("status");

COMMIT;
