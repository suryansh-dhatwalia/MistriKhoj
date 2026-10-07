import { z } from "zod";
import { validateAdTargeting } from "../lib/ad-targeting.js";
import { dataUrlMatchesDeclaredType } from "../lib/media-signature.js";
import {
  contentStatusSchema,
  imageInputSchema,
  isSafeHttpUrl,
  mediaInputSchema,
  optionalText,
  sortOrderSchema,
} from "./shared.js";

const emptyToNull = (value: unknown) => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  }
  return value;
};

const nullableText = (maximum: number) =>
  z.preprocess(emptyToNull, z.string().max(maximum).nullable().optional());

const nullableDate = z.preprocess(emptyToNull, z.coerce.date().nullable().optional());

const optionalUpload = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => (typeof value === "string" && value.trim() === "" ? undefined : value), schema.optional());

export const adScopeSchema = z.enum(["HOME", "STATE", "CITY"]);

export const adCampaignSchema = z
  .object({
    scope: adScopeSchema,
    title: z.string().trim().min(2, "Enter a headline").max(200),
    companyName: nullableText(160),
    description: nullableText(2_000),
    ctaText: nullableText(60),
    linkUrl: z.preprocess(
      emptyToNull,
      z
        .string()
        .max(500)
        .refine(isSafeHttpUrl, "Enter a valid HTTPS URL")
        .nullable()
        .optional(),
    ),
    state: nullableText(100),
    city: nullableText(120),
    /** Omitted = the rate-card price of the chosen scope. */
    priceInr: z.preprocess(
      (value) => (value === "" || value === null ? undefined : value),
      z.coerce.number().int("Price must be a whole number of rupees").min(0).max(10_000_000).optional(),
    ),
    startsAt: nullableDate,
    endsAt: nullableDate,
    status: contentStatusSchema.default("ACTIVE"),
    sortOrder: sortOrderSchema.default(0),
    image: optionalUpload(
      imageInputSchema.refine(dataUrlMatchesDeclaredType, "The image file's contents do not match its type"),
    ),
    video: optionalUpload(
      mediaInputSchema.refine(dataUrlMatchesDeclaredType, "The video file's contents do not match its type"),
    ),
  })
  .superRefine((value, context) => {
    const errors = validateAdTargeting({
      scope: value.scope,
      state: value.state,
      city: value.city,
      startsAt: value.startsAt ?? null,
      endsAt: value.endsAt ?? null,
    });
    for (const [path, messages] of Object.entries(errors)) {
      for (const message of messages) context.addIssue({ code: "custom", path: [path], message });
    }
    if (value.image && value.video) {
      context.addIssue({ code: "custom", path: ["video"], message: "Use either an image or a video, not both." });
    }
  });
export type AdCampaignInput = z.infer<typeof adCampaignSchema>;

export const adStatusSchema = z.object({ status: contentStatusSchema });

export const adRateCardSchema = z.object({
  HOME: z.coerce.number().int().min(0).max(10_000_000),
  STATE: z.coerce.number().int().min(0).max(10_000_000),
  CITY: z.coerce.number().int().min(0).max(10_000_000),
});

export const adminAdListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: optionalText(120),
  scope: adScopeSchema.optional().catch(undefined),
  lifecycle: z.enum(["LIVE", "PAUSED", "SCHEDULED", "EXPIRED"]).optional().catch(undefined),
  state: optionalText(100),
  city: optionalText(120),
  sortBy: z.enum(["createdAt", "impressions", "priceInr", "title", "startsAt", "endsAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

/** `YYYY-MM-DD` range + optional location, shared by the analytics endpoints. */
export const analyticsQuerySchema = z.object({
  from: optionalText(10),
  to: optionalText(10),
  state: optionalText(100),
  city: optionalText(120),
  limit: z.coerce.number().int().min(1).max(100).default(10).catch(10),
});
