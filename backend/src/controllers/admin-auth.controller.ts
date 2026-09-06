import bcrypt from "bcrypt";
import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import {
  clearSessionCookie,
  createSessionToken,
  hashSessionToken,
  readSessionToken,
  setSessionCookie,
} from "../lib/admin-session.js";
import { prisma } from "../lib/prisma.js";
import type { SafeAdmin } from "../middleware/admin-auth.js";
import { adminLoginSchema } from "../schemas/admin.schema.js";

export async function loginAdmin(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const validation = adminLoginSchema.safeParse(request.body);
  if (!validation.success) {
    response.status(422).json({
      success: false,
      message: "Enter a valid email address and password.",
      errors: validation.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const admin = await prisma.admin.findUnique({ where: { email: validation.data.email } });
    const passwordMatches = admin
      ? await bcrypt.compare(validation.data.password, admin.passwordHash)
      : false;

    if (!admin || !admin.isActive || !passwordMatches) {
      response.status(401).json({ success: false, message: "Invalid email or password." });
      return;
    }

    const token = createSessionToken();
    const expiresAt = new Date(Date.now() + env.ADMIN_SESSION_DAYS * 24 * 60 * 60 * 1000);

    await prisma.$transaction([
      prisma.adminSession.deleteMany({
        where: { OR: [{ expiresAt: { lte: new Date() } }, { adminId: admin.id }] },
      }),
      prisma.adminSession.create({
        data: { tokenHash: hashSessionToken(token), adminId: admin.id, expiresAt },
      }),
      prisma.adminAuditLog.create({
        data: { adminId: admin.id, action: "ADMIN_LOGIN", entityType: "Admin", entityId: String(admin.id) },
      }),
    ]);

    setSessionCookie(response, token);
    response.status(200).json({
      success: true,
      message: "Login successful.",
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
        createdAt: admin.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function logoutAdmin(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const token = readSessionToken(request);
  try {
    if (token) {
      await prisma.adminSession.deleteMany({ where: { tokenHash: hashSessionToken(token) } });
    }
    clearSessionCookie(response);
    response.status(200).json({ success: true, message: "Logged out successfully." });
  } catch (error) {
    next(error);
  }
}

export function getCurrentAdmin(_request: Request, response: Response): void {
  response.status(200).json({ success: true, admin: response.locals.admin as SafeAdmin });
}
