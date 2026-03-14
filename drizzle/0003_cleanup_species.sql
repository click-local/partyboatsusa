-- Species data cleanup: fix misspellings, capitalization, and merge duplicates
-- Run after 0001_add_species_tables.sql

BEGIN;

-- ============================================================
-- 1. Fix capitalization and spelling
-- ============================================================

UPDATE species SET name = 'Cobia' WHERE slug = 'cobia';
UPDATE species SET name = 'Grouper' WHERE slug = 'grouper';
UPDATE species SET name = 'Mahi-Mahi' WHERE slug = 'mahi';
UPDATE species SET slug = 'mahi-mahi' WHERE slug = 'mahi';
UPDATE species SET name = 'Sea Bass' WHERE slug = 'sea-bass';
UPDATE species SET name = 'Snapper' WHERE slug = 'snapper';
UPDATE species SET name = 'King Mackerel' WHERE slug = 'king-mackeral';
UPDATE species SET slug = 'king-mackerel' WHERE slug = 'king-mackeral';
UPDATE species SET name = 'Vermilion Snapper' WHERE slug = 'vermillion-snapper';
UPDATE species SET slug = 'vermilion-snapper' WHERE slug = 'vermillion-snapper';
UPDATE species SET name = 'Bonito' WHERE slug = 'bonita';
UPDATE species SET slug = 'bonito' WHERE slug = 'bonita';
UPDATE species SET name = 'Black Grouper' WHERE slug = 'black-grouper';
UPDATE species SET name = 'Yellowtail Snapper' WHERE slug = 'yellowtail-snapper';
-- Fix trailing dash in slug
UPDATE species SET slug = 'grey-trout-weakfish' WHERE slug = 'grey-trout-weakfish-';

-- ============================================================
-- 2. Merge duplicates (reassign boats, then delete duplicate)
-- For each merge: move boat_species rows to canonical ID, skip conflicts, delete duplicate
-- ============================================================

-- "Blue Fish" (id by slug) → merge into "Bluefish"
INSERT INTO boat_species (boat_id, species_id)
SELECT bs.boat_id, canon.id
FROM boat_species bs
JOIN species dup ON dup.id = bs.species_id AND dup.slug = 'blue-fish'
CROSS JOIN (SELECT id FROM species WHERE slug = 'bluefish') canon
ON CONFLICT DO NOTHING;
DELETE FROM boat_species WHERE species_id = (SELECT id FROM species WHERE slug = 'blue-fish');
DELETE FROM species WHERE slug = 'blue-fish';

-- "Ling Cod" → merge into "Lingcod"
INSERT INTO boat_species (boat_id, species_id)
SELECT bs.boat_id, canon.id
FROM boat_species bs
JOIN species dup ON dup.id = bs.species_id AND dup.slug = 'ling-cod'
CROSS JOIN (SELECT id FROM species WHERE slug = 'lingcod') canon
ON CONFLICT DO NOTHING;
DELETE FROM boat_species WHERE species_id = (SELECT id FROM species WHERE slug = 'ling-cod');
DELETE FROM species WHERE slug = 'ling-cod';

-- "SeaBass" → merge into "Sea Bass"
INSERT INTO boat_species (boat_id, species_id)
SELECT bs.boat_id, canon.id
FROM boat_species bs
JOIN species dup ON dup.id = bs.species_id AND dup.slug = 'seabass'
CROSS JOIN (SELECT id FROM species WHERE slug = 'sea-bass') canon
ON CONFLICT DO NOTHING;
DELETE FROM boat_species WHERE species_id = (SELECT id FROM species WHERE slug = 'seabass');
DELETE FROM species WHERE slug = 'seabass';

-- "Trigger Fish" → merge into "Triggerfish"
INSERT INTO boat_species (boat_id, species_id)
SELECT bs.boat_id, canon.id
FROM boat_species bs
JOIN species dup ON dup.id = bs.species_id AND dup.slug = 'trigger-fish'
CROSS JOIN (SELECT id FROM species WHERE slug = 'triggerfish') canon
ON CONFLICT DO NOTHING;
DELETE FROM boat_species WHERE species_id = (SELECT id FROM species WHERE slug = 'trigger-fish');
DELETE FROM species WHERE slug = 'trigger-fish';

-- "porgies" → merge into "Porgy"
INSERT INTO boat_species (boat_id, species_id)
SELECT bs.boat_id, canon.id
FROM boat_species bs
JOIN species dup ON dup.id = bs.species_id AND dup.slug = 'porgies'
CROSS JOIN (SELECT id FROM species WHERE slug = 'porgy') canon
ON CONFLICT DO NOTHING;
DELETE FROM boat_species WHERE species_id = (SELECT id FROM species WHERE slug = 'porgies');
DELETE FROM species WHERE slug = 'porgies';

-- "Striper" → merge into "Striped Bass"
INSERT INTO boat_species (boat_id, species_id)
SELECT bs.boat_id, canon.id
FROM boat_species bs
JOIN species dup ON dup.id = bs.species_id AND dup.slug = 'striper'
CROSS JOIN (SELECT id FROM species WHERE slug = 'striped-bass') canon
ON CONFLICT DO NOTHING;
DELETE FROM boat_species WHERE species_id = (SELECT id FROM species WHERE slug = 'striper');
DELETE FROM species WHERE slug = 'striper';

-- "Stripers" → merge into "Striped Bass"
INSERT INTO boat_species (boat_id, species_id)
SELECT bs.boat_id, canon.id
FROM boat_species bs
JOIN species dup ON dup.id = bs.species_id AND dup.slug = 'stripers'
CROSS JOIN (SELECT id FROM species WHERE slug = 'striped-bass') canon
ON CONFLICT DO NOTHING;
DELETE FROM boat_species WHERE species_id = (SELECT id FROM species WHERE slug = 'stripers');
DELETE FROM species WHERE slug = 'stripers';

-- "Bas" → merge into "Striped Bass" (NY boat, almost certainly Striped Bass)
INSERT INTO boat_species (boat_id, species_id)
SELECT bs.boat_id, canon.id
FROM boat_species bs
JOIN species dup ON dup.id = bs.species_id AND dup.slug = 'bas'
CROSS JOIN (SELECT id FROM species WHERE slug = 'striped-bass') canon
ON CONFLICT DO NOTHING;
DELETE FROM boat_species WHERE species_id = (SELECT id FROM species WHERE slug = 'bas');
DELETE FROM species WHERE slug = 'bas';

COMMIT;
