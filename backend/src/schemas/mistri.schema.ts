import { z } from "zod";
import { makeListQuerySchema } from "./content.schema.js";
import {
  citySchema,
  contentStatusSchema,
  imageInputSchema as imageSchema,
  optionalPhoneSchema,
  optionalText,
  phoneSchema,
} from "./shared.js";

const optionalPincodeSchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().regex(/^\d{6}$/, "Pincode must contain exactly 6 digits").optional(),
);

export const mistriRegistrationSchema = z.object({
  state: z.string().trim().min(2).max(100),
  city: citySchema,
  category: z.string().trim().min(2).max(120),
  fullName: z.string().trim().min(2).max(120),
  primaryPhone: phoneSchema,
  alternatePhone: optionalPhoneSchema,
  qualification: z.string().trim().min(2).max(255),
  address: z.string().trim().min(5).max(2_000),
  pincode: optionalPincodeSchema,
  experienceYears: z.coerce.number().int().min(0).max(80),
  servicesOffered: z.array(z.string().trim().min(2).max(120)).min(1).max(20),
  shortIntro: optionalText(2_000),
  // Required for new registrations. Mistris registered before this was enforced keep
  // whatever they already have (including a blank photo) — this only gates new signups.
  profilePhoto: imageSchema,
  galleryImages: z.array(imageSchema).max(3).default([]),
  referralCode: optionalText(50),
  subscriptionPlan: z.enum(["FREE", "PAID"]).default("FREE"),
  acceptedTerms: z.boolean().refine((accepted) => accepted, {
    message: "You must accept the terms and safety policies",
  }),
});

export type MistriRegistrationInput = z.infer<typeof mistriRegistrationSchema>;

/** Query for the advisory "is the paid top slot free?" lookup used by the register form. */
export const paidSlotQuerySchema = z.object({
  state: z.string().trim().min(2).max(100),
  city: citySchema,
  category: z.string().trim().min(2).max(120),
});

/** A public star rating for a Mistri — star value only, no comment/review text. */
export const mistriRatingSchema = z.object({
  rating: z.coerce.number().int().min(1, "Pick 1 to 5 stars").max(5, "Pick 1 to 5 stars"),
});

/** Admin view of a rating row — mainly used to flip `status` to hide a fake/abusive one. */
export const mistriRatingAdminSchema = z.object({
  mistriId: z.coerce.number().int().positive(),
  rating: z.coerce.number().int().min(1).max(5),
  status: contentStatusSchema.default("ACTIVE"),
});
export const mistriRatingAdminListQuerySchema = makeListQuerySchema(["createdAt", "rating"]).extend({
  mistriId: z.coerce.number().int().positive().optional(),
});
