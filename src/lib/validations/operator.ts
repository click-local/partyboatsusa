import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  companyName: z.string().min(1, "Company name is required"),
  contactName: z.string().min(1, "Contact name is required"),
  phone: z.string().optional(),
});

export const updateProfileSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  contactName: z.string().min(1, "Contact name is required"),
  phone: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const boatSubmissionSchema = z.object({
  name: z.string().min(1, "Boat name is required"),
  operatorName: z.string().min(1, "Operator name is required"),
  descriptionShort: z.string().optional(),
  descriptionLong: z.string().min(1, "Description is required"),
  stateCode: z.string().min(2, "State is required"),
  cityName: z.string().min(1, "City is required"),
  portName: z.string().optional(),
  streetAddress: z.string().optional(),
  zipCode: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  minPricePerPerson: z.string().min(1, "Min price is required"),
  maxPricePerPerson: z.string().min(1, "Max price is required"),
  capacity: z.coerce.number().min(1, "Capacity is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email().optional().or(z.literal("")),
  websiteUrl: z.string().url("Please enter a valid URL"),
  bookingUrl: z.string().url().optional().or(z.literal("")),
  bookingLinkTarget: z.string().optional(),
  bookingButtonText: z.string().optional(),
  socialX: z.string().optional(),
  socialFacebook: z.string().optional(),
  socialInstagram: z.string().optional(),
  socialYoutube: z.string().optional(),
  primaryImageUrl: z.string().optional(),
  imageFocalPointX: z.coerce.number().default(50),
  imageFocalPointY: z.coerce.number().default(50),
  galleryImageUrls: z.array(z.string()).default([]),
  targetSpecies: z.array(z.string()).default([]),
  tripTypeIds: z.array(z.coerce.number()).default([]),
  amenityIds: z.array(z.coerce.number()).default([]),
});

export const claimRequestSchema = z.object({
  boatId: z.coerce.number().min(1),
  message: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type BoatSubmissionInput = z.infer<typeof boatSubmissionSchema>;
export type ClaimRequestInput = z.infer<typeof claimRequestSchema>;
