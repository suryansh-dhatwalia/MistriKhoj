import bcrypt from "bcrypt";
import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import type { SafeAdmin } from "../middleware/admin-auth.js";
import { adminProfileSchema, changePasswordSchema } from "../schemas/admin.schema.js";

export async function updateAdminProfile(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const validation = adminProfileSchema.safeParse(request.body);
  if (!validation.success) {
    response.status(422).json({
      success: false,
      message: "Please correct the highlighted profile fields.",
      errors: validation.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const currentAdmin = response.locals.admin as SafeAdmin;
    const admin = await prisma.admin.update({
      where: { id: currentAdmin.id },
      data: validation.data,
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    });
    await prisma.adminAuditLog.create({
      data: { adminId: admin.id, action: "ADMIN_PROFILE_UPDATED", entityType: "Admin", entityId: String(admin.id) },
    });
    response.status(200).json({ success: true, admin });
  } catch (error) {
    next(error);
  }
}

export async function changeAdminPassword(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const validation = changePasswordSchema.safeParse(request.body);
  if (!validation.success) {
    response.status(422).json({
      success: false,
      message: "Please correct the password fields.",
      errors: validation.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const currentAdmin = response.locals.admin as SafeAdmin;
    const sessionId = response.locals.adminSessionId as string;
    const admin = await prisma.admin.findUnique({ where: { id: currentAdmin.id } });
    if (!admin || !(await bcrypt.compare(validation.data.currentPassword, admin.passwordHash))) {
      response.status(400).json({ success: false, message: "Current password is incorrect." });
      return;
    }

    const passwordHash = await bcrypt.hash(validation.data.newPassword, 12);
    await prisma.$transaction([
      prisma.admin.update({ where: { id: admin.id }, data: { passwordHash } }),
      prisma.adminSession.deleteMany({ where: { adminId: admin.id, id: { not: sessionId } } }),
      prisma.adminAuditLog.create({
        data: { adminId: admin.id, action: "ADMIN_PASSWORD_CHANGED", entityType: "Admin", entityId: String(admin.id) },
      }),
    ]);

    response.status(200).json({ success: true, message: "Password changed successfully." });
  } catch (error) {
    next(error);
  }
}
