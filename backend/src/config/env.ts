import "dotenv/config";
import { z } from "zod";

const optionalNonEmptyString = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().optional(),
);

const isHttpsOrLocal = (value: string): boolean => {
  const url = new URL(value);
  return (
    url.protocol === "https:" ||
    (url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))
  );
};

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    FRONTEND_URL: z.string().url().default("http://localhost:5173"),
    ADMIN_URL: z.string().url().default("http://localhost:5174"),
    ADMIN_SESSION_DAYS: z.coerce.number().int().min(1).max(30).default(7),
    ADMIN_COOKIE_SAME_SITE: z.enum(["lax", "strict", "none"]).optional(),
    ADMIN_COOKIE_DOMAIN: optionalNonEmptyString,
    SHUTDOWN_TIMEOUT_MS: z.coerce.number().int().min(1_000).max(60_000).default(10_000),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    CLOUDINARY_CLOUD_NAME: optionalNonEmptyString,
    CLOUDINARY_API_KEY: optionalNonEmptyString,
    CLOUDINARY_API_SECRET: optionalNonEmptyString,
  })
  .superRefine((value, context) => {
    if (value.NODE_ENV === "production") {
      for (const key of ["FRONTEND_URL", "ADMIN_URL"] as const) {
        if (!isHttpsOrLocal(value[key])) {
          context.addIssue({
            code: "custom",
            path: [key],
            message: "Production browser origins must use HTTPS.",
          });
        }
      }
    }

    const cloudinaryValues = [
      value.CLOUDINARY_CLOUD_NAME,
      value.CLOUDINARY_API_KEY,
      value.CLOUDINARY_API_SECRET,
    ];
    const configuredCloudinaryValues = cloudinaryValues.filter(Boolean).length;
    if (configuredCloudinaryValues > 0 && configuredCloudinaryValues < cloudinaryValues.length) {
      context.addIssue({
        code: "custom",
        path: ["CLOUDINARY_CLOUD_NAME"],
        message: "Cloudinary must be configured with cloud name, API key, and API secret together.",
      });
    }
  });
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment configuration:", parsedEnv.error.flatten().fieldErrors);
  throw new Error("Please correct the environment variables before starting the API.");
}

export const env = parsedEnv.data;
