import type { NextFunction, Request, Response } from "express";
import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import type { SafeAdmin } from "../middleware/admin-auth.js";
import { siteSettingsPatchSchema } from "../schemas/content.schema.js";

/** GET /api/admin/settings */
export async function listSiteSettings(
  _request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const settings = await prisma.siteSetting.findMany({
      orderBy: [{ settingGroup: "asc" }, { key: "asc" }],
    });
    response.status(200).json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
}

/** PATCH /api/admin/settings — bulk update of existing keys only. */
export async function updateSiteSettings(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const parsed = siteSettingsPatchSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(422).json({
      success: false,
      message: "Please correct the highlighted settings.",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const admin = response.locals.admin as SafeAdmin;
    const existing = await prisma.siteSetting.findMany({ select: { key: true } });
    const knownKeys = new Set(existing.map((row) => row.key));
    const updates = parsed.data.settings.filter((entry) => knownKeys.has(entry.key));

    if (updates.length === 0) {
      response.status(400).json({ success: false, message: "No known settings to update." });
      return;
    }

    await prisma.$transaction(async (tx) => {
      for (const entry of updates) {
        await tx.siteSetting.update({
          where: { key: entry.key },
          data: {
            value:
              entry.value === undefined || entry.value === null
                ? Prisma.JsonNull
                : (entry.value as Prisma.InputJsonValue),
          },
        });
      }
      await tx.adminAuditLog.create({
        data: {
          adminId: admin.id,
          action: "SITE_SETTINGS_UPDATED",
          entityType: "SiteSetting",
          entityId: updates.map((entry) => entry.key).join(","),
        },
      });
    });

    const settings = await prisma.siteSetting.findMany({
      orderBy: [{ settingGroup: "asc" }, { key: "asc" }],
    });
    response.status(200).json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
}
