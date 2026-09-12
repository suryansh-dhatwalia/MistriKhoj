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
import {
  adRequestController,
  advertisementController,
  categoryController,
  cityController,
  planController,
  referralController,
  stateController,
  testimonialController,
} from "../controllers/content-admin.controller.js";
import { updateAdRequestStatus } from "../controllers/ad-request.controller.js";
import { listAuditLogs } from "../controllers/audit.controller.js";
import { getReportsOverview } from "../controllers/reports.controller.js";
import { getReferralLeadCounts, listReferralMistris } from "../controllers/referral.controller.js";
import { listSiteSettings, updateSiteSettings } from "../controllers/settings.controller.js";
import type { CrudController } from "../lib/crud-controller.js";
import { requireAdmin } from "../middleware/admin-auth.js";
import { requireAdminOrigin } from "../middleware/admin-origin.js";

export const adminRouter = Router();

adminRouter.use(requireAdminOrigin);
adminRouter.use((_request, response, next) => {
  response.setHeader("cache-control", "no-store");
  next();
});

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

/** Register the 5 standard CRUD routes for a content resource. */
function mountCrud(path: string, controller: CrudController): void {
  const resourceRouter = Router();
  resourceRouter.get("/", controller.list);
  resourceRouter.post("/", controller.create);
  resourceRouter.get("/:id", controller.getOne);
  resourceRouter.patch("/:id", controller.update);
  resourceRouter.delete("/:id", controller.remove);
  adminRouter.use(path, resourceRouter);
}

mountCrud("/states", stateController);
mountCrud("/cities", cityController);
mountCrud("/categories", categoryController);
mountCrud("/advertisements", advertisementController);
mountCrud("/testimonials", testimonialController);
mountCrud("/plans", planController);

// Referral resource: extra lead-count endpoints registered before the generic :id routes.
const referralRouter = Router();
referralRouter.get("/lead-counts", getReferralLeadCounts);
referralRouter.get("/:id/mistris", listReferralMistris);
referralRouter.get("/", referralController.list);
referralRouter.post("/", referralController.create);
referralRouter.get("/:id", referralController.getOne);
referralRouter.patch("/:id", referralController.update);
referralRouter.delete("/:id", referralController.remove);
adminRouter.use("/referrals", referralRouter);

// Advertise-with-us requests: list / view / update status / delete (no admin create).
// Approving via updateAdRequestStatus also publishes the linked live Advertisement.
const adRequestRouter = Router();
adRequestRouter.get("/", adRequestController.list);
adRequestRouter.get("/:id", adRequestController.getOne);
adRequestRouter.patch("/:id", updateAdRequestStatus);
adRequestRouter.delete("/:id", adRequestController.remove);
adminRouter.use("/ad-requests", adRequestRouter);

adminRouter.get("/reports/overview", getReportsOverview);
adminRouter.get("/audit-logs", listAuditLogs);
adminRouter.get("/settings", listSiteSettings);
adminRouter.patch("/settings", updateSiteSettings);
