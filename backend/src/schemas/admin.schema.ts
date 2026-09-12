import { z } from "zod";
import { optionalPhoneSchema, optionalText, phoneSchema } from "./shared.js";

const optionalPincodeSchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().regex(/^\d{6}$/, "PIN code must contain exactly 6 digits").optional(),
);

export const adminLoginSchema = z.object({
  email: z.string().trim().email().max(191).transform((email) => email.toLowerCase()),
  password: z.string().min(8).max(128),
});

export const adminProfileSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(191).transform((email) => email.toLowerCase()),
  phone: optionalPhoneSchema,
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1).max(128),
    newPassword: z
      .string()
      .min(8)
      .max(128)
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[a-z]/, "Password must contain a lowercase letter")
      .regex(/\d/, "Password must contain a number"),
    confirmPassword: z.string().min(1).max(128),
  })
  .refine((input) => input.newPassword === input.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const adminMistriQuerySchema = z.object({
  status: z.enum(["PENDING", "APPROVED"]),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: optionalText(120),
  state: optionalText(100),
  city: optionalText(100),
  category: optionalText(120),
  plan: z.enum(["FREE", "PAID"]).optional(),
  sortBy: z.enum(["createdAt", "experienceYears", "fullName", "id"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const adminMistriUpdateSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  primaryPhone: phoneSchema,
  alternatePhone: optionalPhoneSchema.nullable(),
  state: z.string().trim().min(2).max(100),
  city: z.string().trim().min(2).max(100),
  category: z.string().trim().min(2).max(120),
  qualification: z.string().trim().min(2).max(255),
  address: z.string().trim().min(5).max(2_000),
  pincode: optionalPincodeSchema.nullable(),
  experienceYears: z.coerce.number().int().min(0).max(80),
  servicesOffered: z.array(z.string().trim().min(2).max(120)).min(1).max(20),
  shortIntro: optionalText(2_000).nullable(),
  plan: z.enum(["FREE", "PAID"]).optional(),
});

export const rejectMistriSchema = z.object({
  reason: optionalText(500),
});
