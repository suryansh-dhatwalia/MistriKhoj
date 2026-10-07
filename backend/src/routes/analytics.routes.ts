import { Router } from "express";
import { ipKeyGenerator, rateLimit } from "express-rate-limit";
import {
  trackAdImpressions,
  trackPageView,
  trackProfileView,
} from "../controllers/analytics.controller.js";

export const analyticsRouter = Router();

// Public, unauthenticated write endpoints: cap each visitor so they cannot be used to
// flood the counters. Limits are well above what real browsing produces.
const limiter = (limit: number) =>
  rateLimit({
    windowMs: 5 * 60 * 1000,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    keyGenerator: (request) => ipKeyGenerator(request.ip ?? ""),
    message: { success: false, message: "Too many requests." },
  });

analyticsRouter.post("/page-view", limiter(150), trackPageView);
analyticsRouter.post("/profile-view/:id", limiter(80), trackProfileView);
analyticsRouter.post("/ad-impressions", limiter(150), trackAdImpressions);
