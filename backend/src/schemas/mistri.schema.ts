import { z } from "zod";
import { imageInputSchema as imageSchema, optionalPhoneSchema, optionalText, phoneSchema } from "./shared.js";

const optionalPincodeSchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().regex(/^\d{6}$/, "Pincode must contain exactly 6 digits").optional(),
);

export const mistriRegistrationSchema = z.object({
  state: z.string().trim().min(2).max(100),
  city: z.string().trim().min(2).max(100),
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
  // Optional — a Mistri who skips this gets a default silhouette avatar on the site.
  profilePhoto: z.preprocess(
    (value) => (value === null || (typeof value === "string" && value.trim() === "") ? undefined : value),
    imageSchema.optional(),
  ),
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
  city: z.string().trim().min(2).max(100),
  category: z.string().trim().min(2).max(120),
});
