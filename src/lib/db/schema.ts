import { pgTable, text, integer, boolean, decimal, serial, timestamp, json, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================================
// Reference Tables
// ============================================================

export const states = pgTable("states", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  slug: text("slug").notNull().unique(),
});

export const insertStateSchema = createInsertSchema(states).omit({ id: true });
export type InsertState = z.infer<typeof insertStateSchema>;
export type SelectState = typeof states.$inferSelect;

export const cities = pgTable("cities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  stateCode: text("state_code").notNull().references(() => states.code),
});

export const insertCitySchema = createInsertSchema(cities).omit({ id: true });
export type InsertCity = z.infer<typeof insertCitySchema>;
export type SelectCity = typeof cities.$inferSelect;

export const tripTypes = pgTable("trip_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const insertTripTypeSchema = createInsertSchema(tripTypes).omit({ id: true });
export type InsertTripType = z.infer<typeof insertTripTypeSchema>;
export type SelectTripType = typeof tripTypes.$inferSelect;

export const speciesCategories = pgTable("species_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
  description: text("description"),
});

export const insertSpeciesCategorySchema = createInsertSchema(speciesCategories).omit({ id: true });
export type InsertSpeciesCategory = z.infer<typeof insertSpeciesCategorySchema>;
export type SelectSpeciesCategory = typeof speciesCategories.$inferSelect;

export const species = pgTable("species", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
  categoryId: integer("category_id").references(() => speciesCategories.id),
  scientificName: text("scientific_name"),
  description: text("description"),
  descriptionLong: text("description_long"),
  seasonInfo: text("season_info"),
  sizeRange: text("size_range"),
  habitat: text("habitat"),
  fightRating: text("fight_rating"),
  edibility: text("edibility"),
  imageUrl: text("image_url"),
});

export const insertSpeciesSchema = createInsertSchema(species).omit({ id: true });
export type InsertSpecies = z.infer<typeof insertSpeciesSchema>;
export type SelectSpecies = typeof species.$inferSelect;

export const speciesStateContent = pgTable("species_state_content", {
  id: serial("id").primaryKey(),
  speciesId: integer("species_id").notNull().references(() => species.id, { onDelete: "cascade" }),
  stateCode: text("state_code").notNull(),
  content: text("content").notNull(),
  bestSeason: text("best_season"),
  popularPorts: text("popular_ports"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type SelectSpeciesStateContent = typeof speciesStateContent.$inferSelect;

export const speciesStateSeasons = pgTable("species_state_seasons", {
  id: serial("id").primaryKey(),
  speciesId: integer("species_id").notNull().references(() => species.id, { onDelete: "cascade" }),
  stateCode: text("state_code").notNull(),
  region: text("region"),           // e.g. "Gulf Coast", "Atlantic Coast" (null = statewide)
  month: integer("month").notNull(),
  rating: text("rating").notNull(), // peak, good, fair, off, closed
  notes: text("notes"),
  seasonYear: integer("season_year"), // tracks which year's regulations apply
});

export type SelectSpeciesStateSeason = typeof speciesStateSeasons.$inferSelect;

export const speciesAliases = pgTable("species_aliases", {
  id: serial("id").primaryKey(),
  speciesId: integer("species_id").notNull().references(() => species.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  nameLower: text("name_lower").notNull(),
});

export const insertSpeciesAliasSchema = createInsertSchema(speciesAliases).omit({ id: true });
export type InsertSpeciesAlias = z.infer<typeof insertSpeciesAliasSchema>;
export type SelectSpeciesAlias = typeof speciesAliases.$inferSelect;

export const amenities = pgTable("amenities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  icon: text("icon").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const insertAmenitySchema = createInsertSchema(amenities).omit({ id: true });
export type InsertAmenity = z.infer<typeof insertAmenitySchema>;
export type SelectAmenity = typeof amenities.$inferSelect;

// ============================================================
// Auth & Permissions (admin metadata stored in Supabase Auth)
// ============================================================

export const ADMIN_PERMISSIONS = [
  "boats",
  "crm",
  "options",
  "membership-tiers",
  "operator-tiers",
  "destination-pages",
  "system-emails",
  "site-settings",
  "feature-comparison",
  "analytics",
  "admin-users",
] as const;

export type AdminPermission = typeof ADMIN_PERMISSIONS[number];

// ============================================================
// Membership & Operators
// ============================================================

export const membershipTiers = pgTable("membership_tiers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  monthlyPrice: integer("monthly_price"),
  yearlyPrice: integer("yearly_price"),
  searchBoost: integer("search_boost").notNull().default(0),
  showPhone: boolean("show_phone").notNull().default(true),
  showEmail: boolean("show_email").notNull().default(false),
  showWebsite: boolean("show_website").notNull().default(true),
  showBookingUrl: boolean("show_booking_url").notNull().default(false),
  showSocialMedia: boolean("show_social_media").notNull().default(false),
  displayBadge: boolean("display_badge").notNull().default(false),
  badgeColor: text("badge_color"),
  sortOrder: integer("sort_order").notNull().default(0),
  isHighestTier: boolean("is_highest_tier").notNull().default(false),
  showAnalytics: boolean("show_analytics").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMembershipTierSchema = createInsertSchema(membershipTiers).omit({ id: true, createdAt: true });
export type InsertMembershipTier = z.infer<typeof insertMembershipTierSchema>;
export type SelectMembershipTier = typeof membershipTiers.$inferSelect;

// Operators table - auth handled by Supabase Auth, this stores business data only
export const operators = pgTable("operators", {
  id: serial("id").primaryKey(),
  authUserId: uuid("auth_user_id").notNull().unique(), // References Supabase auth.users.id
  email: text("email").notNull().unique(),
  companyName: text("company_name").notNull(),
  contactName: text("contact_name").notNull(),
  phone: text("phone"),
  membershipTierId: integer("membership_tier_id").references(() => membershipTiers.id),
});

export const insertOperatorSchema = createInsertSchema(operators).omit({ id: true });
export type InsertOperator = z.infer<typeof insertOperatorSchema>;
export type SelectOperator = typeof operators.$inferSelect;

// ============================================================
// Boats (primary listing)
// ============================================================

export const boats = pgTable("boats", {
  id: serial("id").primaryKey(),
  operatorId: integer("operator_id").references(() => operators.id),
  name: text("name").notNull(),
  operatorName: text("operator_name").notNull(),
  slug: text("slug").notNull().unique(),
  descriptionShort: text("description_short"),
  descriptionLong: text("description_long").notNull(),
  stateCode: text("state_code").notNull().references(() => states.code),
  cityName: text("city_name").notNull(),
  portName: text("port_name"),
  streetAddress: text("street_address"),
  zipCode: text("zip_code"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  minPricePerPerson: decimal("min_price_per_person", { precision: 10, scale: 2 }).notNull(),
  maxPricePerPerson: decimal("max_price_per_person", { precision: 10, scale: 2 }).notNull(),
  capacity: integer("capacity").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  websiteUrl: text("website_url").notNull(),
  bookingUrl: text("booking_url"),
  bookingLinkTarget: text("booking_link_target").default("_modal"),
  bookingButtonText: text("booking_button_text").default("Book Now"),
  socialX: text("social_x"),
  socialFacebook: text("social_facebook"),
  socialInstagram: text("social_instagram"),
  socialYoutube: text("social_youtube"),
  isFeatured: boolean("is_featured").notNull().default(false),
  isFeaturedAdmin: boolean("is_featured_admin").notNull().default(false),
  isPublished: boolean("is_published").notNull().default(true),
  rating: decimal("rating", { precision: 2, scale: 1 }).notNull().default("0.0"),
  reviewCount: integer("review_count").notNull().default(0),
  primaryImageUrl: text("primary_image_url"),
  imageFocalPointX: integer("image_focal_point_x").notNull().default(50),
  imageFocalPointY: integer("image_focal_point_y").notNull().default(50),
  headerCropData: text("header_crop_data"),
  cardCropData: text("card_crop_data"),
  galleryImageUrls: text("gallery_image_urls").array().notNull().default([]),
  targetSpecies: text("target_species").array().notNull().default([]),
  tripTypes: text("trip_types").array().notNull().default([]),
  whatsIncluded: text("whats_included").array().notNull().default([]),
  availableExtras: text("available_extras").array().notNull().default([]),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  seoKeywords: text("seo_keywords"),
});

export const insertBoatSchema = createInsertSchema(boats).omit({ id: true });
export type InsertBoat = z.infer<typeof insertBoatSchema>;
export type SelectBoat = typeof boats.$inferSelect;

// ============================================================
// Junction Tables
// ============================================================

export const boatTripTypes = pgTable("boat_trip_types", {
  id: serial("id").primaryKey(),
  boatId: integer("boat_id").notNull().references(() => boats.id, { onDelete: "cascade" }),
  tripTypeId: integer("trip_type_id").notNull().references(() => tripTypes.id, { onDelete: "cascade" }),
});

export const insertBoatTripTypeSchema = createInsertSchema(boatTripTypes).omit({ id: true });
export type InsertBoatTripType = z.infer<typeof insertBoatTripTypeSchema>;
export type SelectBoatTripType = typeof boatTripTypes.$inferSelect;

export const boatAmenities = pgTable("boat_amenities", {
  id: serial("id").primaryKey(),
  boatId: integer("boat_id").notNull().references(() => boats.id, { onDelete: "cascade" }),
  amenityId: integer("amenity_id").notNull().references(() => amenities.id, { onDelete: "cascade" }),
});

export const insertBoatAmenitySchema = createInsertSchema(boatAmenities).omit({ id: true });
export type InsertBoatAmenity = z.infer<typeof insertBoatAmenitySchema>;
export type SelectBoatAmenity = typeof boatAmenities.$inferSelect;

export const boatSpecies = pgTable("boat_species", {
  id: serial("id").primaryKey(),
  boatId: integer("boat_id").notNull().references(() => boats.id, { onDelete: "cascade" }),
  speciesId: integer("species_id").notNull().references(() => species.id, { onDelete: "cascade" }),
});

export const insertBoatSpeciesSchema = createInsertSchema(boatSpecies).omit({ id: true });
export type InsertBoatSpecies = z.infer<typeof insertBoatSpeciesSchema>;
export type SelectBoatSpecies = typeof boatSpecies.$inferSelect;

// ============================================================
// User-Generated Content
// ============================================================

export const bragBoardPhotos = pgTable("brag_board_photos", {
  id: serial("id").primaryKey(),
  boatId: integer("boat_id").notNull().references(() => boats.id, { onDelete: "cascade" }),
  submitterName: text("submitter_name").notNull(),
  submitterEmail: text("submitter_email"),
  submitterType: text("submitter_type").notNull(),
  photoUrl: text("photo_url").notNull(),
  catchDescription: text("catch_description").notNull(),
  status: text("status").notNull().default("pending"),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
});

export const insertBragBoardPhotoSchema = createInsertSchema(bragBoardPhotos).omit({ id: true, submittedAt: true, status: true });
export type InsertBragBoardPhoto = z.infer<typeof insertBragBoardPhotoSchema>;
export type SelectBragBoardPhoto = typeof bragBoardPhotos.$inferSelect;

export const bragBoardPhotoSpecies = pgTable("brag_board_photo_species", {
  id: serial("id").primaryKey(),
  photoId: integer("photo_id").notNull().references(() => bragBoardPhotos.id, { onDelete: "cascade" }),
  speciesId: integer("species_id").notNull().references(() => species.id, { onDelete: "cascade" }),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  boatId: integer("boat_id").notNull().references(() => boats.id, { onDelete: "cascade" }),
  userName: text("user_name").notNull(),
  userEmail: text("user_email").notNull(),
  rating: integer("rating").notNull(),
  title: text("title").notNull(),
  comment: text("comment").notNull(),
  tripDate: text("trip_date"),
  status: text("status").notNull().default("pending"),
  operatorReply: text("operator_reply"),
  operatorReplyAt: timestamp("operator_reply_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true, updatedAt: true, status: true, operatorReply: true, operatorReplyAt: true });
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type SelectReview = typeof reviews.$inferSelect;

// ============================================================
// Approval Workflows
// ============================================================

export const claimRequests = pgTable("claim_requests", {
  id: serial("id").primaryKey(),
  boatId: integer("boat_id").notNull().references(() => boats.id, { onDelete: "cascade" }),
  operatorId: integer("operator_id").notNull().references(() => operators.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("pending"),
  message: text("message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertClaimRequestSchema = createInsertSchema(claimRequests).omit({ id: true, createdAt: true, updatedAt: true, status: true });
export type InsertClaimRequest = z.infer<typeof insertClaimRequestSchema>;
export type SelectClaimRequest = typeof claimRequests.$inferSelect;

export const boatSubmissions = pgTable("boat_submissions", {
  id: serial("id").primaryKey(),
  operatorId: integer("operator_id").notNull().references(() => operators.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("pending"),
  name: text("name").notNull(),
  operatorName: text("operator_name").notNull(),
  descriptionShort: text("description_short"),
  descriptionLong: text("description_long").notNull(),
  stateCode: text("state_code").notNull(),
  cityName: text("city_name").notNull(),
  portName: text("port_name"),
  streetAddress: text("street_address"),
  zipCode: text("zip_code"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  minPricePerPerson: decimal("min_price_per_person", { precision: 10, scale: 2 }).notNull(),
  maxPricePerPerson: decimal("max_price_per_person", { precision: 10, scale: 2 }).notNull(),
  capacity: integer("capacity").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  websiteUrl: text("website_url").notNull(),
  bookingUrl: text("booking_url"),
  bookingLinkTarget: text("booking_link_target").default("_modal"),
  bookingButtonText: text("booking_button_text").default("Book Now"),
  socialX: text("social_x"),
  socialFacebook: text("social_facebook"),
  socialInstagram: text("social_instagram"),
  socialYoutube: text("social_youtube"),
  primaryImageUrl: text("primary_image_url"),
  imageFocalPointX: integer("image_focal_point_x").notNull().default(50),
  imageFocalPointY: integer("image_focal_point_y").notNull().default(50),
  headerCropData: text("header_crop_data"),
  cardCropData: text("card_crop_data"),
  galleryImageUrls: text("gallery_image_urls").array().notNull().default([]),
  targetSpecies: text("target_species").array().notNull().default([]),
  tripTypeIds: integer("trip_type_ids").array().notNull().default([]),
  amenityIds: integer("amenity_ids").array().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertBoatSubmissionSchema = createInsertSchema(boatSubmissions).omit({ id: true, createdAt: true, updatedAt: true, status: true });
export type InsertBoatSubmission = z.infer<typeof insertBoatSubmissionSchema>;
export type SelectBoatSubmission = typeof boatSubmissions.$inferSelect;

// ============================================================
// Species Suggestions (operator-submitted)
// ============================================================

export const speciesSuggestions = pgTable("species_suggestions", {
  id: serial("id").primaryKey(),
  operatorId: integer("operator_id").notNull().references(() => operators.id, { onDelete: "cascade" }),
  speciesName: text("species_name").notNull(),
  commonNames: text("common_names"),
  notes: text("notes"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSpeciesSuggestionSchema = createInsertSchema(speciesSuggestions).omit({ id: true, createdAt: true, status: true });
export type InsertSpeciesSuggestion = z.infer<typeof insertSpeciesSuggestionSchema>;
export type SelectSpeciesSuggestion = typeof speciesSuggestions.$inferSelect;

// ============================================================
// CMS & Configuration
// ============================================================

export const emailTemplates = pgTable("email_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  trigger: text("trigger").notNull(),
  recipients: text("recipients").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).omit({ id: true });
export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;
export type SelectEmailTemplate = typeof emailTemplates.$inferSelect;

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  siteName: text("site_name").notNull().default("Party Boats USA"),
  siteTagline: text("site_tagline").notNull().default("Find the Best Party Boat Fishing Trips in the USA"),
  heroImageUrl: text("hero_image_url"),
  heroImages: text("hero_images").array().notNull().default([]),
  heroVideoUrl: text("hero_video_url"),
  heroTransitionDuration: integer("hero_transition_duration").notNull().default(5000),
  logoUrl: text("logo_url"),
  heroHeadline: text("hero_headline"),
  heroSubheadline: text("hero_subheadline"),
  featuredDestinations: text("featured_destinations").notNull().default("[]"),
  featuredColumn: text("featured_column").notNull().default("pro"),
  featuredColumnLabel: text("featured_column_label").notNull().default("Best Value"),
  showPostDates: boolean("show_post_dates").notNull().default(true),
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettings).omit({ id: true });
export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;
export type SelectSiteSettings = typeof siteSettings.$inferSelect;

export const destinationPages = pgTable("destination_pages", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  referenceId: integer("reference_id").notNull(),
  isPublished: boolean("is_published").notNull().default(false),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  seoKeywords: text("seo_keywords"),
  heroImageUrl: text("hero_image_url"),
  heroHeadline: text("hero_headline"),
  heroSubheadline: text("hero_subheadline"),
  cardImageUrl: text("card_image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertDestinationPageSchema = createInsertSchema(destinationPages).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertDestinationPage = z.infer<typeof insertDestinationPageSchema>;
export type SelectDestinationPage = typeof destinationPages.$inferSelect;

export const contentBlocks = pgTable("content_blocks", {
  id: serial("id").primaryKey(),
  destinationPageId: integer("destination_page_id").notNull().references(() => destinationPages.id, { onDelete: "cascade" }),
  blockType: text("block_type").notNull(),
  blockOrder: integer("block_order").notNull().default(0),
  content: json("content").notNull(),
  isVisible: boolean("is_visible").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertContentBlockSchema = createInsertSchema(contentBlocks).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertContentBlock = z.infer<typeof insertContentBlockSchema>;
export type SelectContentBlock = typeof contentBlocks.$inferSelect;

// ============================================================
// Feature Comparison (pricing page)
// ============================================================

export const featureComparisonItems = pgTable("feature_comparison_items", {
  id: serial("id").primaryKey(),
  featureName: text("feature_name").notNull(),
  description: text("description"),
  icon: text("icon"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertFeatureComparisonItemSchema = createInsertSchema(featureComparisonItems).omit({ id: true });
export type InsertFeatureComparisonItem = z.infer<typeof insertFeatureComparisonItemSchema>;
export type SelectFeatureComparisonItem = typeof featureComparisonItems.$inferSelect;

export const featureTierValues = pgTable("feature_tier_values", {
  id: serial("id").primaryKey(),
  featureId: integer("feature_id").notNull().references(() => featureComparisonItems.id, { onDelete: "cascade" }),
  tierId: integer("tier_id").notNull().references(() => membershipTiers.id, { onDelete: "cascade" }),
  included: boolean("included").notNull().default(false),
  customValue: text("custom_value"),
});

export const insertFeatureTierValueSchema = createInsertSchema(featureTierValues).omit({ id: true });
export type InsertFeatureTierValue = z.infer<typeof insertFeatureTierValueSchema>;
export type SelectFeatureTierValue = typeof featureTierValues.$inferSelect;

// ============================================================
// CRM
// ============================================================

export const operatorContactLogs = pgTable("operator_contact_logs", {
  id: serial("id").primaryKey(),
  operatorId: integer("operator_id").references(() => operators.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(),
  context: json("context"),
  sourceIp: text("source_ip"),
  userAgent: text("user_agent"),
  note: text("note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertOperatorContactLogSchema = createInsertSchema(operatorContactLogs).omit({ id: true, createdAt: true });
export type InsertOperatorContactLog = z.infer<typeof insertOperatorContactLogSchema>;
export type SelectOperatorContactLog = typeof operatorContactLogs.$inferSelect;

// ============================================================
// SEO
// ============================================================

export const pageSeoSettings = pgTable("page_seo_settings", {
  id: serial("id").primaryKey(),
  pageKey: text("page_key").notNull().unique(),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  seoKeywords: text("seo_keywords"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertPageSeoSettingsSchema = createInsertSchema(pageSeoSettings).omit({ id: true, updatedAt: true });
export type InsertPageSeoSettings = z.infer<typeof insertPageSeoSettingsSchema>;
export type SelectPageSeoSettings = typeof pageSeoSettings.$inferSelect;
