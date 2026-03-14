import { z } from "zod";

// ============================================================
// Public submission schemas
// ============================================================

export const reviewSubmissionSchema = z.object({
  boatId: z.number().int().positive(),
  userName: z.string().min(1).max(100),
  userEmail: z.string().email().max(255),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(1).max(200),
  comment: z.string().min(1).max(5000),
  tripDate: z.string().max(50).optional().nullable(),
});

export const bragBoardSubmissionSchema = z.object({
  boatId: z.coerce.number().int().positive(),
  submitterName: z.string().min(1).max(100),
  submitterEmail: z.string().email().max(255).optional().nullable().default(null),
  catchDescription: z.string().min(1).max(2000),
  photoUrl: z.string().url().max(2000),
  honeypot: z.string().optional(),
  formLoadedAt: z.union([z.string(), z.number()]).optional(),
});

export const contactFormSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(10000),
});

// ============================================================
// Operator schemas
// ============================================================

export const operatorBoatUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  operatorName: z.string().min(1).max(200).optional(),
  descriptionShort: z.string().max(500).optional().nullable(),
  descriptionLong: z.string().max(10000).optional(),
  cityName: z.string().max(100).optional(),
  portName: z.string().max(100).optional().nullable(),
  streetAddress: z.string().max(200).optional().nullable(),
  zipCode: z.string().max(20).optional().nullable(),
  latitude: z.string().max(20).optional().nullable(),
  longitude: z.string().max(20).optional().nullable(),
  minPricePerPerson: z.string().max(20).optional(),
  maxPricePerPerson: z.string().max(20).optional(),
  capacity: z.coerce.number().int().min(1).max(10000).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().email().max(255).optional().nullable(),
  websiteUrl: z.string().url().max(500).optional(),
  socialX: z.string().max(500).optional().nullable(),
  socialFacebook: z.string().max(500).optional().nullable(),
  socialInstagram: z.string().max(500).optional().nullable(),
  socialYoutube: z.string().max(500).optional().nullable(),
  primaryImageUrl: z.string().max(2000).optional().nullable(),
  imageFocalPointX: z.number().int().min(0).max(100).optional(),
  imageFocalPointY: z.number().int().min(0).max(100).optional(),
  galleryImageUrls: z.array(z.string().url().max(2000)).max(20).optional(),
  targetSpecies: z.array(z.string().max(100)).max(50).optional(),
  whatsIncluded: z.array(z.string().max(200)).max(50).optional(),
  availableExtras: z.array(z.string().max(200)).max(50).optional(),
  tripTypeIds: z.array(z.number().int().positive()).max(50).optional(),
  amenityIds: z.array(z.number().int().positive()).max(50).optional(),
  speciesIds: z.array(z.number().int().positive()).max(100).optional(),
}).strict();

// ============================================================
// Admin schemas
// ============================================================

export const adminBoatSchema = z.object({
  name: z.string().min(1).max(200),
  operatorName: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).optional(),
  descriptionShort: z.string().max(500).optional().nullable(),
  descriptionLong: z.string().max(10000),
  stateCode: z.string().min(2).max(2),
  cityName: z.string().min(1).max(100),
  portName: z.string().max(100).optional().nullable(),
  streetAddress: z.string().max(200).optional().nullable(),
  zipCode: z.string().max(20).optional().nullable(),
  latitude: z.string().max(20).optional().nullable(),
  longitude: z.string().max(20).optional().nullable(),
  minPricePerPerson: z.string().max(20),
  maxPricePerPerson: z.string().max(20),
  capacity: z.coerce.number().int().min(1).max(10000),
  phone: z.string().max(30),
  email: z.string().email().max(255).optional().nullable(),
  websiteUrl: z.string().max(500),
  bookingUrl: z.string().max(500).optional().nullable(),
  bookingLinkTarget: z.string().max(20).optional().nullable(),
  bookingButtonText: z.string().max(50).optional().nullable(),
  socialX: z.string().max(500).optional().nullable(),
  socialFacebook: z.string().max(500).optional().nullable(),
  socialInstagram: z.string().max(500).optional().nullable(),
  socialYoutube: z.string().max(500).optional().nullable(),
  isFeatured: z.boolean().optional(),
  isFeaturedAdmin: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  primaryImageUrl: z.string().max(2000).optional().nullable(),
  imageFocalPointX: z.number().int().min(0).max(100).optional(),
  imageFocalPointY: z.number().int().min(0).max(100).optional(),
  headerCropData: z.string().max(500).optional().nullable(),
  cardCropData: z.string().max(500).optional().nullable(),
  galleryImageUrls: z.array(z.string().max(2000)).max(20).optional(),
  targetSpecies: z.array(z.string().max(100)).max(50).optional(),
  tripTypes: z.array(z.string().max(100)).max(50).optional(),
  whatsIncluded: z.array(z.string().max(200)).max(50).optional(),
  availableExtras: z.array(z.string().max(200)).max(50).optional(),
  seoTitle: z.string().max(200).optional().nullable(),
  seoDescription: z.string().max(500).optional().nullable(),
  seoKeywords: z.string().max(500).optional().nullable(),
  operatorId: z.number().int().positive().optional().nullable(),
  tripTypeIds: z.array(z.number().int().positive()).max(50).optional(),
  amenityIds: z.array(z.number().int().positive()).max(50).optional(),
  speciesIds: z.array(z.number().int().positive()).max(100).optional(),
});

export const adminSpeciesSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  sortOrder: z.number().int().min(0).optional(),
  categoryId: z.number().int().positive().optional().nullable(),
  scientificName: z.string().max(200).optional().nullable(),
  description: z.string().max(5000).optional().nullable(),
  imageUrl: z.string().max(2000).optional().nullable(),
  aliases: z.array(z.string().max(100)).max(20).optional(),
});

export const adminSpeciesCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  sortOrder: z.number().int().min(0).optional(),
  description: z.string().max(1000).optional().nullable(),
});

export const speciesSuggestionSchema = z.object({
  speciesName: z.string().min(1).max(200),
  commonNames: z.string().max(500).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const adminTripTypeSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  sortOrder: z.number().int().min(0).optional(),
});

export const adminAmenitySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  icon: z.string().min(1).max(50),
  sortOrder: z.number().int().min(0).optional(),
});

export const adminReviewActionSchema = z.object({
  status: z.enum(["approved", "rejected"]).optional(),
  operatorReply: z.string().max(5000).optional().nullable(),
}).passthrough();

export const adminClaimActionSchema = z.object({
  claimId: z.number().int().positive(),
  action: z.enum(["approve", "reject"]),
});

export const adminBragBoardActionSchema = z.object({
  photoId: z.number().int().positive(),
  action: z.enum(["approve", "reject"]),
  boatId: z.number().int().positive().optional(),
  boatName: z.string().max(200).optional(),
  boatSlug: z.string().max(200).optional(),
  submitterName: z.string().max(100).optional(),
});

export const operatorReviewReplySchema = z.object({
  reply: z.string().min(1).max(2000),
});
