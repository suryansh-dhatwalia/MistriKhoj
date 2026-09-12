import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { idParamSchema } from "../schemas/shared.js";
import { referralMistriQuerySchema } from "../schemas/content.schema.js";

/** GET /api/admin/referrals/lead-counts -> [{ code, count }] for every referral code used by a Mistri. */
export async function getReferralLeadCounts(
  _request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const grouped = await prisma.mistri.groupBy({
      by: ["referralCode"],
      where: { referralCode: { not: null } },
      _count: { _all: true },
    });

    response.status(200).json({
      success: true,
      data: grouped
        .filter((row): row is typeof row & { referralCode: string } => Boolean(row.referralCode))
        .map((row) => ({ code: row.referralCode, count: row._count._all })),
    });
  } catch (error) {
    next(error);
  }
}

/** GET /api/admin/referrals/:id/mistris -> paginated Mistris that registered with this code. */
export async function listReferralMistris(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const id = idParamSchema.safeParse(request.params.id);
  if (!id.success) {
    response.status(400).json({ success: false, message: "Invalid referral ID." });
    return;
  }

  const parsedQuery = referralMistriQuerySchema.safeParse(request.query);
  if (!parsedQuery.success) {
    response.status(422).json({
      success: false,
      message: "Invalid list filters.",
      errors: parsedQuery.error.flatten().fieldErrors,
    });
    return;
  }

  const { page, pageSize } = parsedQuery.data;

  try {
    const referral = await prisma.referral.findUnique({ where: { id: id.data } });
    if (!referral) {
      response.status(404).json({ success: false, message: "Referral not found." });
      return;
    }

    const where = { referralCode: referral.code };
    const [items, total] = await Promise.all([
      prisma.mistri.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          fullName: true,
          primaryPhone: true,
          state: true,
          city: true,
          category: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.mistri.count({ where }),
    ]);

    response.status(200).json({
      success: true,
      referral: { id: referral.id, code: referral.code, name: referral.name },
      data: items,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    });
  } catch (error) {
    next(error);
  }
}
