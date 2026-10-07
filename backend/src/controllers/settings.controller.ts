import type { NextFunction, Request, Response } from "express";
import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import type { SafeAdmin } from "../middleware/admin-auth.js";
import {
  DEFAULT_PAID_PLAN_PRICE_INR,
  PAID_PLAN_PRICE_SETTING_KEY,
  isValidPaidPlanPrice,
} from "../config/subscription.js";
import { AD_PRICE_SETTING_KEYS, ensureAdRateCardSettings, getAdRateCard } from "../config/ad-pricing.js";
import { validateAdRateCard, type AdScopeName } from "../lib/ad-targeting.js";
import { siteSettingsPatchSchema } from "../schemas/content.schema.js";

/** GET /api/admin/settings */
export async function listSiteSettings(
  _request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // Make sure the editable price row exists (create-only; never overwrites).
    await prisma.siteSetting.upsert({
      where: { key: PAID_PLAN_PRICE_SETTING_KEY },
      update: {},
      create: {
        key: PAID_PLAN_PRICE_SETTING_KEY,
        value: DEFAULT_PAID_PLAN_PRICE_INR,
        label: "Paid plan price (₹ per year)",
        settingGroup: "subscription",
      },
    });
    await ensureAdRateCardSettings(prisma);
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

  const price = parsed.data.settings.find((entry) => entry.key === PAID_PLAN_PRICE_SETTING_KEY);
  if (price && !isValidPaidPlanPrice(price.value)) {
    response.status(422).json({
      success: false,
      message: "Paid plan price must be a whole number of rupees greater than 0.",
    });
    return;
  }

  // Ad prices are validated as a set (homepage must stay the most expensive tier).
  const adPriceKeys = new Set(Object.values(AD_PRICE_SETTING_KEYS));
  if (parsed.data.settings.some((entry) => adPriceKeys.has(entry.key))) {
    const rates = await getAdRateCard(prisma);
    for (const scope of Object.keys(AD_PRICE_SETTING_KEYS) as AdScopeName[]) {
      const patched = parsed.data.settings.find((entry) => entry.key === AD_PRICE_SETTING_KEYS[scope]);
      if (patched) rates[scope] = patched.value as number;
    }
    const problem = validateAdRateCard(rates);
    if (problem) {
      response.status(422).json({ success: false, message: problem });
      return;
    }
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
