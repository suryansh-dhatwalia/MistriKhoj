import { Router } from "express";
import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import {
  getMistriLocations,
  getMistriProfile,
  getPaidSlotStatus,
  listMistris,
  rateMistri,
  registerMistri,
} from "../controllers/mistri.controller.js";

export const mistriRouter = Router();

// No customer login exists, so this is the only guard against one visitor spamming
// stars at a single Mistri — keyed by IP + the Mistri being rated, not IP alone, so
// rating several different Mistris is unaffected.
const ratingRateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: (request) => `${ipKeyGenerator(request.ip ?? "")}:${request.params.id}`,
  message: { success: false, message: "You've already rated this Mistri recently. Try again later." },
});

mistriRouter.get("/", listMistris);
mistriRouter.get("/paid-slot", getPaidSlotStatus);
mistriRouter.get("/locations", getMistriLocations);
mistriRouter.get("/:id", getMistriProfile);
mistriRouter.post("/register", registerMistri);
mistriRouter.post("/:id/rating", ratingRateLimiter, rateMistri);
