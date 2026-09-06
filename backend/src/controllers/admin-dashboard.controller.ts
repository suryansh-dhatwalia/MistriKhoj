import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export async function getAdminDashboard(
  _request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const [pendingRegistrations, approvedMistris, totalMistris, todayRegistrations, recentPending] =
      await prisma.$transaction([
        prisma.mistri.count({ where: { status: "PENDING" } }),
        prisma.mistri.count({ where: { status: "APPROVED" } }),
        prisma.mistri.count(),
        prisma.mistri.count({ where: { createdAt: { gte: today } } }),
        prisma.mistri.findMany({
          where: { status: "PENDING" },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            state: true,
            city: true,
            category: true,
            fullName: true,
            primaryPhone: true,
            alternatePhone: true,
            qualification: true,
            address: true,
            pincode: true,
            experienceYears: true,
            servicesOffered: true,
            shortIntro: true,
            profilePhotoUrl: true,
            galleryImages: true,
            referralCode: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            approvedAt: true,
          },
        }),
      ]);

    response.status(200).json({
      success: true,
      data: {
        pendingRegistrations,
        approvedMistris,
        totalMistris,
        todayRegistrations,
        recentPending: recentPending.map((mistri) => ({
          ...mistri,
          servicesOffered: Array.isArray(mistri.servicesOffered)
            ? mistri.servicesOffered.filter((item): item is string => typeof item === "string")
            : [],
          galleryImages: Array.isArray(mistri.galleryImages)
            ? mistri.galleryImages.flatMap((item) =>
                item && typeof item === "object" && "url" in item && typeof item.url === "string"
                  ? [item.url]
                  : typeof item === "string"
                    ? [item]
                    : [],
              )
            : [],
        })),
      },
    });
  } catch (error) {
    next(error);
  }
}
