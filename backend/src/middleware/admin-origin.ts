import type { RequestHandler } from "express";
import { env } from "../config/env.js";

const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * Cookie-authenticated writes must originate from the configured admin site.
 * This blocks cross-site form submissions even when the session cookie must use
 * SameSite=None because the admin and API are hosted on different sites.
 */
export const requireAdminOrigin: RequestHandler = (request, response, next) => {
  if (safeMethods.has(request.method)) {
    next();
    return;
  }

  const origin = request.get("origin");
  const hasAdminHeader = request.get("x-mistrikhoj-admin") === "1";
  const originIsAllowed = origin === env.ADMIN_URL;

  if (originIsAllowed && hasAdminHeader) {
    next();
    return;
  }

  if (env.NODE_ENV !== "production" && !origin && hasAdminHeader) {
    next();
    return;
  }

  response.status(403).json({
    success: false,
    message: "This admin request did not come from the configured admin site.",
  });
};
