import { Router } from "express";
import {
  getAds,
  getCategories,
  getLocations,
  getPlans,
  getPublicSettings,
  getTestimonials,
  getVideos,
  validateReferral,
} from "../controllers/content.controller.js";

export const contentRouter = Router();

contentRouter.get("/locations", getLocations);
contentRouter.get("/categories", getCategories);
contentRouter.get("/ads", getAds);
contentRouter.get("/videos", getVideos);
contentRouter.get("/testimonials", getTestimonials);
contentRouter.get("/plans", getPlans);
contentRouter.get("/settings", getPublicSettings);
contentRouter.get("/referrals/:code", validateReferral);
