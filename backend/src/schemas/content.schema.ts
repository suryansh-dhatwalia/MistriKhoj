import { z } from "zod";
import {
  contentStatusSchema,
  httpUrlSchema,
  imageInputSchema,
  mediaInputSchema,
  optionalText,
  phoneSchema,
  sortOrderSchema,
} from "./shared.js";

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

/**
 * Optional nullable text column. A missing key is allowed (left unchanged on update);
 * an empty / whitespace-only string is normalised to `null` so clearing a field in the
 * admin form actually nulls the column.
 */
const nullableText = (maximum: number) =>
  z.preprocess(
    (value) => {
      if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed === "" ? null : trimmed;
      }
      return value;
    },
    z.string().max(maximum).nullable().optional(),
  );

const nullableUrl = (maximum: number) =>
  z.preprocess(
    (value) => {
      if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed === "" ? null : trimmed;
      }
      return value;
    },
    httpUrlSchema(maximum).nullable().optional(),
  );

/** Image field on a write request: an https URL to keep, or a base64 data URL to upload. */
const optionalImageInput = z.preprocess(emptyToUndefined, imageInputSchema.optional());

/** Creative field that may be an image or a video: https URL to keep, or base64 data URL to upload. */
const optionalMediaInput = z.preprocess(emptyToUndefined, mediaInputSchema.optional());

const placementEnum = z.enum(["HOME_BANNER", "CATEGORY", "VIDEO"]);

/** Standard list query for every admin master screen. */
export function makeListQuerySchema(sortableFields: readonly string[]) {
  return z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    search: optionalText(120),
    status: contentStatusSchema.optional(),
    sortBy: z.enum(sortableFields as unknown as [string, ...string[]]).optional(),
    sortOrder: z.enum(["asc", "desc"]).default("asc"),
  });
}

// --- State -----------------------------------------------------------------

export const stateSchema = z.object({
  name: z.string().trim().min(2).max(100),
  code: z.string().trim().min(1).max(8),
  regionalTitle: nullableText(160),
  tagline: nullableText(200),
  activeTechniciansCount: z.coerce.number().int().min(0).max(10_000_000).default(0),
  sortOrder: sortOrderSchema.default(0),
  status: contentStatusSchema.default("ACTIVE"),
});
export const stateListQuerySchema = makeListQuerySchema(["sortOrder", "name", "code", "createdAt"]);

// --- City ----------------------------------------------------------------

export const citySchema = z.object({
  stateId: z.coerce.number().int().positive(),
  name: z.string().trim().min(2).max(120),
  sortOrder: sortOrderSchema.default(0),
  status: contentStatusSchema.default("ACTIVE"),
});
export const cityListQuerySchema = makeListQuerySchema(["sortOrder", "name", "createdAt"]).extend({
  stateId: z.coerce.number().int().positive().optional(),
});

// --- Category ----------------------------------------------------------------

export const categorySchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and hyphens only"),
  name: z.string().trim().min(2).max(140),
  hindiName: nullableText(200),
  iconName: nullableText(60),
  description: nullableText(2_000),
  avgResponseTime: nullableText(60),
  popularServices: z.array(z.string().trim().min(1).max(160)).max(30).default([]),
  sortOrder: sortOrderSchema.default(0),
  status: contentStatusSchema.default("ACTIVE"),
});
export const categoryListQuerySchema = makeListQuerySchema(["sortOrder", "name", "slug", "createdAt"]);

// --- Advertisement ---------------------------------------------------------

export const advertisementSchema = z
  .object({
    placement: placementEnum,
    companyName: nullableText(160),
    title: nullableText(200),
    description: nullableText(2_000),
    ctaText: nullableText(60),
    linkUrl: nullableUrl(500),
    /** https URL (kept) or base64 data URL (uploaded to Cloudinary). Undefined = leave unchanged. */
    image: optionalImageInput,
    /** Uploaded video creative: https URL (kept) or base64 data URL (uploaded to Cloudinary). */
    video: optionalMediaInput,
    videoUrl: nullableUrl(500),
    state: nullableText(100),
    city: nullableText(120),
    category: nullableText(140),
    sortOrder: sortOrderSchema.default(0),
    status: contentStatusSchema.default("ACTIVE"),
  })
  .superRefine((value, ctx) => {
    if (value.placement === "VIDEO" && !value.videoUrl && !value.video) {
      ctx.addIssue({ code: "custom", path: ["video"], message: "A video is required." });
    }
    if (value.placement === "HOME_BANNER" && !value.image && !value.video && !value.videoUrl) {
      ctx.addIssue({ code: "custom", path: ["image"], message: "An image or a video is required." });
    }
    if (value.placement === "CATEGORY" && !value.image) {
      ctx.addIssue({ code: "custom", path: ["image"], message: "An image is required." });
    }
  });
export const advertisementListQuerySchema = makeListQuerySchema([
  "sortOrder",
  "createdAt",
  "title",
]).extend({
  placement: placementEnum.optional(),
});

// --- Testimonial ---------------------------------------------------------

export const testimonialSchema = z.object({
  author: z.string().trim().min(2).max(120),
  location: z.string().trim().min(2).max(120),
  state: z.string().trim().min(2).max(100),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  serviceCategory: z.string().trim().min(2).max(120),
  technicianName: z.string().trim().min(2).max(120),
  comment: z.string().trim().min(10).max(2_000),
  displayDate: z.string().trim().min(1).max(60),
  avatar: optionalImageInput,
  sortOrder: sortOrderSchema.default(0),
  status: contentStatusSchema.default("ACTIVE"),
});
export const testimonialListQuerySchema = makeListQuerySchema([
  "sortOrder",
  "author",
  "rating",
  "createdAt",
]);

// --- Subscription plan ---------------------------------------------------------

export const planSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9_]+$/, "Lowercase letters, numbers and underscores only"),
  name: z.string().trim().min(2).max(140),
  price: z.string().trim().min(1).max(60),
  duration: z.string().trim().min(1).max(120),
  badge: z.string().trim().min(1).max(80),
  features: z.array(z.string().trim().min(1).max(200)).min(1).max(20),
  idealFor: z.string().trim().min(2).max(255),
  highlighted: z.boolean().default(false),
  popular: z.boolean().default(false),
  sortOrder: sortOrderSchema.default(0),
  status: contentStatusSchema.default("ACTIVE"),
});
export const planListQuerySchema = makeListQuerySchema(["sortOrder", "name", "createdAt"]);

// --- Referral ----------------------------------------------------------------

export const referralSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2)
    .max(50)
    .regex(/^[A-Za-z0-9_-]+$/, "Letters, numbers, hyphens and underscores only"),
  name: z.string().trim().min(2).max(120),
  phone: phoneSchema,
  status: contentStatusSchema.default("ACTIVE"),
});
export const referralListQuerySchema = makeListQuerySchema(["createdAt", "code", "name"]);

// --- Site settings / audit / public ------------------------------------------

export const siteSettingsPatchSchema = z.object({
  settings: z
    .array(z.object({ key: z.string().trim().min(1).max(80), value: z.unknown() }))
    .min(1)
    .max(50),
});

export const auditLogQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  action: optionalText(100),
  entityType: optionalText(100),
});

export const referralMistriQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const publicAdsQuerySchema = z.object({
  placement: placementEnum.default("HOME_BANNER"),
  state: optionalText(100),
  city: optionalText(120),
  category: optionalText(140),
});

// --- Advertise-with-us requests ---------------------------------------------

const adRequestStatusEnum = z.enum(["NEW", "CONTACTED", "APPROVED", "REJECTED"]);

/** Public submission from the "Advertise With Us" form. */
export const adRequestPublicSchema = z.object({
  companyName: z.string().trim().min(2).max(160),
  contactNumber: phoneSchema,
  email: z.string().trim().toLowerCase().pipe(z.string().email("Enter a valid email").max(191)),
  adType: z.enum(["image", "video"]),
  duration: z.string().trim().min(1).max(40),
  targetUrl: nullableUrl(500),
  /** Optional creative: an https URL or a base64 image / video data URL (uploaded to Cloudinary). */
  creative: z.preprocess(emptyToUndefined, mediaInputSchema.optional()),
  message: nullableText(2_000),
});

export const adRequestAdminUpdateSchema = z.object({ status: adRequestStatusEnum });

export const adRequestListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    search: optionalText(120),
    status: adRequestStatusEnum.optional(),
    sortBy: z.enum(["createdAt", "companyName", "status"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  });
