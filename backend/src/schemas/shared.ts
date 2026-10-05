import { z } from "zod";

/**
 * Shared Zod building blocks used across request schemas.
 * These were previously duplicated verbatim in mistri.schema.ts and admin.schema.ts.
 */

/**
 * Free-text city / town names are normalised so "shimla", " SHIMLA " and "Shimla" all
 * become "Shimla": whitespace collapsed, each word (and hyphenated part) capitalised.
 * Keeps search filters and paid top-slot checks from treating them as different places.
 */
export const normalizeCityName = (value: string): string =>
  value
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/(^|[\s-])(\p{L})/gu, (_match, separator: string, letter: string) =>
      `${separator}${letter.toUpperCase()}`,
    );

export const citySchema = z
  .string()
  .trim()
  .min(2)
  .max(100)
  .transform(normalizeCityName);

export const phoneSchema = z
  .string()
  .trim()
  .transform((phone) => phone.replace(/[\s()-]/g, "").replace(/^(?:\+91|91)/, ""))
  .pipe(z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"));

export const optionalPhoneSchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  phoneSchema.optional(),
);

export const optionalText = (maximum: number) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().max(maximum).optional(),
  );

export const isSafeHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" ||
      (url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))
    );
  } catch {
    return false;
  }
};

export const httpUrlSchema = (maximum = 2_048) =>
  z
    .string()
    .trim()
    .max(maximum)
    .refine(isSafeHttpUrl, "Enter a valid HTTPS URL");

const isSupportedImageValue = (value: string) => {
  if (/^data:image\/(?:png|jpe?g|webp);base64,/i.test(value)) {
    return true;
  }

  return isSafeHttpUrl(value);
};

/** Accepts an https(s) URL or an inline base64 PNG/JPEG/WebP data URL. */
export const imageInputSchema = z
  .string()
  .trim()
  .min(1, "An image is required")
  .max(8_000_000, "Image is too large")
  .refine(isSupportedImageValue, "Image must be a web URL or a PNG, JPEG, or WebP upload");

/** True for an inline base64 video data URL (mp4 / webm / ogg / quicktime). */
export const isVideoDataUri = (value: string): boolean => /^data:video\//i.test(value);

const isSupportedMediaValue = (value: string) => {
  if (/^data:(?:image\/(?:png|jpe?g|webp)|video\/(?:mp4|webm|ogg|quicktime));base64,/i.test(value)) {
    return true;
  }
  return isSafeHttpUrl(value);
};

/**
 * Accepts an https(s) URL, an inline base64 image (PNG/JPEG/WebP), or an inline
 * base64 video (MP4/WebM/OGG/MOV). Used for ad creatives, which may be either.
 * The byte cap is generous because base64 inflates a video ~33%.
 */
export const mediaInputSchema = z
  .string()
  .trim()
  .min(1, "A creative is required")
  .max(70_000_000, "The file is too large. Keep ad videos under ~45 MB.")
  .refine(
    isSupportedMediaValue,
    "Must be a web URL, an image (PNG/JPEG/WebP), or a video (MP4/WebM/MOV)",
  );

const isSupportedVideoValue = (value: string) => {
  if (/^data:video\/(?:mp4|webm|ogg|quicktime);base64,/i.test(value)) {
    return true;
  }
  return isSafeHttpUrl(value);
};

/**
 * Accepts an https(s) URL or an inline base64 video (MP4/WebM/OGG/MOV), and nothing
 * else. Used for video-only fields, such as a customer's video testimonial, that sit
 * alongside — not instead of — an image field on the same record.
 */
export const videoInputSchema = z
  .string()
  .trim()
  .min(1, "A video is required")
  .max(70_000_000, "The file is too large. Keep videos under ~45 MB.")
  .refine(isSupportedVideoValue, "Must be a web URL or a video (MP4/WebM/MOV)");

export const contentStatusSchema = z.enum(["ACTIVE", "INACTIVE"]);

export const sortOrderSchema = z.coerce.number().int().min(0).max(100_000);

export const idParamSchema = z.coerce.number().int().positive();
