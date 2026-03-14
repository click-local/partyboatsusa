-- Performance indexes for frequently queried columns
-- PostgreSQL does NOT auto-create indexes on foreign key columns

-- Boats: most queried table
CREATE INDEX IF NOT EXISTS idx_boats_state_code ON boats(state_code);
CREATE INDEX IF NOT EXISTS idx_boats_city_name ON boats(city_name);
CREATE INDEX IF NOT EXISTS idx_boats_is_published ON boats(is_published);
CREATE INDEX IF NOT EXISTS idx_boats_is_featured ON boats(is_featured);
CREATE INDEX IF NOT EXISTS idx_boats_operator_id ON boats(operator_id);
CREATE INDEX IF NOT EXISTS idx_boats_is_featured_admin ON boats(is_featured_admin);

-- Composite index for common public queries (published + state)
CREATE INDEX IF NOT EXISTS idx_boats_published_state ON boats(is_published, state_code);

-- Junction tables: foreign keys used in JOINs
CREATE INDEX IF NOT EXISTS idx_boat_trip_types_boat_id ON boat_trip_types(boat_id);
CREATE INDEX IF NOT EXISTS idx_boat_trip_types_trip_type_id ON boat_trip_types(trip_type_id);
CREATE INDEX IF NOT EXISTS idx_boat_amenities_boat_id ON boat_amenities(boat_id);
CREATE INDEX IF NOT EXISTS idx_boat_amenities_amenity_id ON boat_amenities(amenity_id);
CREATE INDEX IF NOT EXISTS idx_boat_species_boat_id ON boat_species(boat_id);
CREATE INDEX IF NOT EXISTS idx_boat_species_species_id ON boat_species(species_id);

-- Cities
CREATE INDEX IF NOT EXISTS idx_cities_slug ON cities(slug);
CREATE INDEX IF NOT EXISTS idx_cities_state_code ON cities(state_code);

-- Reviews & moderation
CREATE INDEX IF NOT EXISTS idx_reviews_boat_id ON reviews(boat_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);

-- Brag board
CREATE INDEX IF NOT EXISTS idx_brag_board_photos_boat_id ON brag_board_photos(boat_id);
CREATE INDEX IF NOT EXISTS idx_brag_board_photos_status ON brag_board_photos(status);

-- Claim requests
CREATE INDEX IF NOT EXISTS idx_claim_requests_boat_id ON claim_requests(boat_id);
CREATE INDEX IF NOT EXISTS idx_claim_requests_operator_id ON claim_requests(operator_id);
CREATE INDEX IF NOT EXISTS idx_claim_requests_status ON claim_requests(status);

-- Boat submissions
CREATE INDEX IF NOT EXISTS idx_boat_submissions_operator_id ON boat_submissions(operator_id);
CREATE INDEX IF NOT EXISTS idx_boat_submissions_status ON boat_submissions(status);

-- Destination pages
CREATE INDEX IF NOT EXISTS idx_destination_pages_type_ref ON destination_pages(type, reference_id);

-- Content blocks
CREATE INDEX IF NOT EXISTS idx_content_blocks_destination_page_id ON content_blocks(destination_page_id);

-- Operator contact logs
CREATE INDEX IF NOT EXISTS idx_operator_contact_logs_operator_id ON operator_contact_logs(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_contact_logs_created_at ON operator_contact_logs(created_at);
