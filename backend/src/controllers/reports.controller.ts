import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** GET /api/admin/reports/overview */
export async function getReportsOverview(
  _request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const now = new Date();
    const since = new Date(now);
    since.setDate(since.getDate() - 29);
    since.setHours(0, 0, 0, 0);

    const [
      pending,
      approved,
      totalMistris,
      recentForSeries,
      byStateRaw,
      byCategoryRaw,
      referralGroups,
      referralRows,
      states,
      cities,
      categories,
      ads,
      testimonials,
      plans,
      referrals,
    ] = await prisma.$transaction([
      prisma.mistri.count({ where: { status: "PENDING" } }),
      prisma.mistri.count({ where: { status: "APPROVED" } }),
      prisma.mistri.count(),
      prisma.mistri.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
      prisma.mistri.groupBy({
        by: ["state"],
        _count: { _all: true },
        orderBy: { _count: { state: "desc" } },
        take: 10,
      }),
      prisma.mistri.groupBy({
        by: ["category"],
        _count: { _all: true },
        orderBy: { _count: { category: "desc" } },
        take: 10,
      }),
      prisma.mistri.groupBy({
        by: ["referralCode"],
        where: { referralCode: { not: null } },
        _count: { _all: true },
      }),
      prisma.referral.findMany({ select: { code: true, name: true } }),
      prisma.state.count(),
      prisma.city.count(),
      prisma.category.count(),
      prisma.advertisement.count(),
      prisma.testimonial.count(),
      prisma.subscriptionPlan.count(),
      prisma.referral.count(),
    ]);

    // 30-day registration series, zero-filled, bucketed in JS.
    const buckets = new Map<string, number>();
    for (let index = 0; index < 30; index += 1) {
      const day = new Date(since);
      day.setDate(since.getDate() + index);
      buckets.set(isoDay(day), 0);
    }
    for (const row of recentForSeries) {
      const key = isoDay(new Date(row.createdAt));
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
    const registrationsByDay = Array.from(buckets, ([date, count]) => ({ date, count }));

    const referralNameByCode = new Map(referralRows.map((row) => [row.code, row.name]));
    const referralLeaderboard = referralGroups
      .filter((row): row is typeof row & { referralCode: string } => Boolean(row.referralCode))
      .map((row) => ({
        code: row.referralCode,
        name: referralNameByCode.get(row.referralCode) ?? null,
        count: row._count._all,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    response.status(200).json({
      success: true,
      data: {
        mistris: { pending, approved, total: totalMistris },
        registrationsByDay,
        byState: byStateRaw.map((row) => ({ label: row.state, count: row._count._all })),
        byCategory: byCategoryRaw.map((row) => ({ label: row.category, count: row._count._all })),
        referralLeaderboard,
        contentTotals: { states, cities, categories, ads, testimonials, plans, referrals },
      },
    });
  } catch (error) {
    next(error);
  }
}
