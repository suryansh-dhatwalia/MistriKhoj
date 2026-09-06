import { z } from "zod";

const phoneSchema = z
  .string()
  .trim()
  .transform((phone) => phone.replace(/[\s()-]/g, "").replace(/^(?:\+91|91)/, ""))
  .pipe(z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"));

const optionalPhoneSchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  phoneSchema.optional(),
);

const optionalPincodeSchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().regex(/^\d{6}$/, "Pincode must contain exactly 6 digits").optional(),
);

const optionalText = (maximum: number) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().max(maximum).optional(),
  );

const isSupportedImageValue = (value: string) => {
  if (/^data:image\/(?:png|jpe?g|webp);base64,/i.test(value)) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const imageSchema = z
  .string()
  .trim()
  .min(1, "An image is required")
  .max(8_000_000, "Image is too large")
  .refine(isSupportedImageValue, "Image must be a web URL or a PNG, JPEG, or WebP upload");

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
  profilePhoto: imageSchema,
  galleryImages: z.array(imageSchema).max(3).default([]),
  referralCode: optionalText(50),
  subscriptionPlan: z.string().trim().optional(),
  acceptedTerms: z.boolean().refine((accepted) => accepted, {
    message: "You must accept the terms and safety policies",
  }),
});

export type MistriRegistrationInput = z.infer<typeof mistriRegistrationSchema>;
