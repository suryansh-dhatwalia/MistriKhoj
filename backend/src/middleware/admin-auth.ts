import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { clearSessionCookie, hashSessionToken, readSessionToken } from "../lib/admin-session.js";

export type SafeAdmin = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: "SUPER_ADMIN";
  createdAt: Date;
};

export async function requireAdmin(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const token = readSessionToken(request);

  if (!token) {
    response.status(401).json({ success: false, message: "Administrator login required." });
    return;
  }

  try {
    const session = await prisma.adminSession.findUnique({
      where: { tokenHash: hashSessionToken(token) },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
    });

    if (!session || session.expiresAt <= new Date() || !session.admin.isActive) {
      if (session) {
        await prisma.adminSession.delete({ where: { id: session.id } }).catch(() => undefined);
      }
      clearSessionCookie(response);
      response.status(401).json({ success: false, message: "Your admin session has expired." });
      return;
    }

    response.locals.admin = {
      id: session.admin.id,
      name: session.admin.name,
      email: session.admin.email,
      phone: session.admin.phone,
      role: session.admin.role,
      createdAt: session.admin.createdAt,
    } satisfies SafeAdmin;
    response.locals.adminSessionId = session.id;

    next();
  } catch (error) {
    next(error);
  }
}
