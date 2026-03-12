CREATE TABLE "amenities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"icon" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "amenities_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "boat_amenities" (
	"id" serial PRIMARY KEY NOT NULL,
	"boat_id" integer NOT NULL,
	"amenity_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "boat_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"operator_id" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"name" text NOT NULL,
	"operator_name" text NOT NULL,
	"description_short" text,
	"description_long" text NOT NULL,
	"state_code" text NOT NULL,
	"city_name" text NOT NULL,
	"port_name" text,
	"street_address" text,
	"zip_code" text,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"min_price_per_person" numeric(10, 2) NOT NULL,
	"max_price_per_person" numeric(10, 2) NOT NULL,
	"capacity" integer NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"website_url" text NOT NULL,
	"booking_url" text,
	"booking_link_target" text DEFAULT '_modal',
	"booking_button_text" text DEFAULT 'Book Now',
	"social_x" text,
	"social_facebook" text,
	"social_instagram" text,
	"social_youtube" text,
	"primary_image_url" text,
	"image_focal_point_x" integer DEFAULT 50 NOT NULL,
	"image_focal_point_y" integer DEFAULT 50 NOT NULL,
	"header_crop_data" text,
	"card_crop_data" text,
	"gallery_image_urls" text[] DEFAULT '{}' NOT NULL,
	"target_species" text[] DEFAULT '{}' NOT NULL,
	"trip_type_ids" integer[] DEFAULT '{}' NOT NULL,
	"amenity_ids" integer[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "boat_trip_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"boat_id" integer NOT NULL,
	"trip_type_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "boats" (
	"id" serial PRIMARY KEY NOT NULL,
	"operator_id" integer,
	"name" text NOT NULL,
	"operator_name" text NOT NULL,
	"slug" text NOT NULL,
	"description_short" text,
	"description_long" text NOT NULL,
	"state_code" text NOT NULL,
	"city_name" text NOT NULL,
	"port_name" text,
	"street_address" text,
	"zip_code" text,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"min_price_per_person" numeric(10, 2) NOT NULL,
	"max_price_per_person" numeric(10, 2) NOT NULL,
	"capacity" integer NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"website_url" text NOT NULL,
	"booking_url" text,
	"booking_link_target" text DEFAULT '_modal',
	"booking_button_text" text DEFAULT 'Book Now',
	"social_x" text,
	"social_facebook" text,
	"social_instagram" text,
	"social_youtube" text,
	"is_featured" boolean DEFAULT false NOT NULL,
	"is_featured_admin" boolean DEFAULT false NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"rating" numeric(2, 1) DEFAULT '0.0' NOT NULL,
	"review_count" integer DEFAULT 0 NOT NULL,
	"primary_image_url" text,
	"image_focal_point_x" integer DEFAULT 50 NOT NULL,
	"image_focal_point_y" integer DEFAULT 50 NOT NULL,
	"header_crop_data" text,
	"card_crop_data" text,
	"gallery_image_urls" text[] DEFAULT '{}' NOT NULL,
	"target_species" text[] DEFAULT '{}' NOT NULL,
	"trip_types" text[] DEFAULT '{}' NOT NULL,
	"whats_included" text[] DEFAULT '{}' NOT NULL,
	"available_extras" text[] DEFAULT '{}' NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"seo_keywords" text,
	CONSTRAINT "boats_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "brag_board_photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"boat_id" integer NOT NULL,
	"submitter_name" text NOT NULL,
	"submitter_email" text,
	"submitter_type" text NOT NULL,
	"photo_url" text NOT NULL,
	"catch_description" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"state_code" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "claim_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"boat_id" integer NOT NULL,
	"operator_id" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_blocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"destination_page_id" integer NOT NULL,
	"block_type" text NOT NULL,
	"block_order" integer DEFAULT 0 NOT NULL,
	"content" json NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "destination_pages" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"reference_id" integer NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"seo_keywords" text,
	"hero_image_url" text,
	"hero_headline" text,
	"hero_subheadline" text,
	"card_image_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"trigger" text NOT NULL,
	"recipients" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "email_templates_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "feature_comparison_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"feature_name" text NOT NULL,
	"description" text,
	"icon" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feature_tier_values" (
	"id" serial PRIMARY KEY NOT NULL,
	"feature_id" integer NOT NULL,
	"tier_id" integer NOT NULL,
	"included" boolean DEFAULT false NOT NULL,
	"custom_value" text
);
--> statement-breakpoint
CREATE TABLE "membership_tiers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"monthly_price" integer,
	"yearly_price" integer,
	"search_boost" integer DEFAULT 0 NOT NULL,
	"show_phone" boolean DEFAULT true NOT NULL,
	"show_email" boolean DEFAULT false NOT NULL,
	"show_website" boolean DEFAULT true NOT NULL,
	"show_booking_url" boolean DEFAULT false NOT NULL,
	"show_social_media" boolean DEFAULT false NOT NULL,
	"display_badge" boolean DEFAULT false NOT NULL,
	"badge_color" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_highest_tier" boolean DEFAULT false NOT NULL,
	"show_analytics" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "membership_tiers_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "operator_contact_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"operator_id" integer,
	"event_type" text NOT NULL,
	"context" json,
	"source_ip" text,
	"user_agent" text,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "operators" (
	"id" serial PRIMARY KEY NOT NULL,
	"auth_user_id" uuid NOT NULL,
	"email" text NOT NULL,
	"company_name" text NOT NULL,
	"contact_name" text NOT NULL,
	"phone" text,
	"membership_tier_id" integer,
	CONSTRAINT "operators_auth_user_id_unique" UNIQUE("auth_user_id"),
	CONSTRAINT "operators_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "page_seo_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"page_key" text NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"seo_keywords" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "page_seo_settings_page_key_unique" UNIQUE("page_key")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"boat_id" integer NOT NULL,
	"user_name" text NOT NULL,
	"user_email" text NOT NULL,
	"rating" integer NOT NULL,
	"title" text NOT NULL,
	"comment" text NOT NULL,
	"trip_date" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"site_name" text DEFAULT 'Party Boats USA' NOT NULL,
	"site_tagline" text DEFAULT 'Find the Best Party Boat Fishing Trips in the USA' NOT NULL,
	"hero_image_url" text,
	"hero_images" text[] DEFAULT '{}' NOT NULL,
	"hero_video_url" text,
	"hero_transition_duration" integer DEFAULT 5000 NOT NULL,
	"logo_url" text,
	"hero_headline" text,
	"hero_subheadline" text,
	"featured_destinations" text DEFAULT '[]' NOT NULL,
	"featured_column" text DEFAULT 'pro' NOT NULL,
	"featured_column_label" text DEFAULT 'Best Value' NOT NULL,
	"show_post_dates" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "states" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"slug" text NOT NULL,
	CONSTRAINT "states_code_unique" UNIQUE("code"),
	CONSTRAINT "states_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "trip_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "trip_types_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "boat_amenities" ADD CONSTRAINT "boat_amenities_boat_id_boats_id_fk" FOREIGN KEY ("boat_id") REFERENCES "public"."boats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boat_amenities" ADD CONSTRAINT "boat_amenities_amenity_id_amenities_id_fk" FOREIGN KEY ("amenity_id") REFERENCES "public"."amenities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boat_submissions" ADD CONSTRAINT "boat_submissions_operator_id_operators_id_fk" FOREIGN KEY ("operator_id") REFERENCES "public"."operators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boat_trip_types" ADD CONSTRAINT "boat_trip_types_boat_id_boats_id_fk" FOREIGN KEY ("boat_id") REFERENCES "public"."boats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boat_trip_types" ADD CONSTRAINT "boat_trip_types_trip_type_id_trip_types_id_fk" FOREIGN KEY ("trip_type_id") REFERENCES "public"."trip_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boats" ADD CONSTRAINT "boats_operator_id_operators_id_fk" FOREIGN KEY ("operator_id") REFERENCES "public"."operators"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boats" ADD CONSTRAINT "boats_state_code_states_code_fk" FOREIGN KEY ("state_code") REFERENCES "public"."states"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brag_board_photos" ADD CONSTRAINT "brag_board_photos_boat_id_boats_id_fk" FOREIGN KEY ("boat_id") REFERENCES "public"."boats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cities" ADD CONSTRAINT "cities_state_code_states_code_fk" FOREIGN KEY ("state_code") REFERENCES "public"."states"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claim_requests" ADD CONSTRAINT "claim_requests_boat_id_boats_id_fk" FOREIGN KEY ("boat_id") REFERENCES "public"."boats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claim_requests" ADD CONSTRAINT "claim_requests_operator_id_operators_id_fk" FOREIGN KEY ("operator_id") REFERENCES "public"."operators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_blocks" ADD CONSTRAINT "content_blocks_destination_page_id_destination_pages_id_fk" FOREIGN KEY ("destination_page_id") REFERENCES "public"."destination_pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_tier_values" ADD CONSTRAINT "feature_tier_values_feature_id_feature_comparison_items_id_fk" FOREIGN KEY ("feature_id") REFERENCES "public"."feature_comparison_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_tier_values" ADD CONSTRAINT "feature_tier_values_tier_id_membership_tiers_id_fk" FOREIGN KEY ("tier_id") REFERENCES "public"."membership_tiers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operator_contact_logs" ADD CONSTRAINT "operator_contact_logs_operator_id_operators_id_fk" FOREIGN KEY ("operator_id") REFERENCES "public"."operators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operators" ADD CONSTRAINT "operators_membership_tier_id_membership_tiers_id_fk" FOREIGN KEY ("membership_tier_id") REFERENCES "public"."membership_tiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_boat_id_boats_id_fk" FOREIGN KEY ("boat_id") REFERENCES "public"."boats"("id") ON DELETE cascade ON UPDATE no action;