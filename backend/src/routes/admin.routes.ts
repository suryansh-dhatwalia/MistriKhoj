import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { getCurrentAdmin, loginAdmin, logoutAdmin } from "../controllers/admin-auth.controller.js";
import { getAdminDashboard } from "../controllers/admin-dashboard.controller.js";
import {
  approveMistri,
  deleteAdminMistri,
  getAdminMistri,
  listAdminMistris,
  updateAdminMistri,
} from "../controllers/admin-mistri.controller.js";
import { changeAdminPassword, updateAdminProfile } from "../controllers/admin-profile.controller.js";
import { requireAdmin } from "../middleware/admin-auth.js";

export const adminRouter = Router();

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { success: false, message: "Too many failed login attempts. Try again in 15 minutes." },
});

adminRouter.post("/auth/login", loginRateLimiter, loginAdmin);
adminRouter.post("/auth/logout", logoutAdmin);

adminRouter.use(requireAdmin);
adminRouter.get("/auth/me", getCurrentAdmin);
adminRouter.get("/dashboard", getAdminDashboard);
adminRouter.get("/mistris", listAdminMistris);
adminRouter.get("/mistris/:id", getAdminMistri);
adminRouter.patch("/mistris/:id", updateAdminMistri);
adminRouter.patch("/mistris/:id/approve", approveMistri);
adminRouter.delete("/mistris/:id", deleteAdminMistri);
adminRouter.patch("/profile", updateAdminProfile);
adminRouter.patch("/profile/password", changeAdminPassword);
