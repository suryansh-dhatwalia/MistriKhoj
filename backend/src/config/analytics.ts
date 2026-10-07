import { createHash } from "node:crypto";
import { env } from "./env.js";

export const analyticsConfig = {
  secret:
    env.ANALYTICS_SALT ??
    createHash("sha256").update(`mistrikhoj-analytics|${env.DATABASE_URL}`).digest("hex"),
  ignoreAdmin: env.ANALYTICS_IGNORE_ADMIN ? env.ANALYTICS_IGNORE_ADMIN === "true" : env.NODE_ENV === "production",
  profileViewWindowMs: env.PROFILE_VIEW_DEDUPE_MINUTES * 60 * 1000,
};
