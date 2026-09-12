import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { auditLogQuerySchema } from "../schemas/content.schema.js";

/** GET /api/admin/audit-logs */
export async function listAuditLogs(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const parsed = auditLogQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    response.status(422).json({
      success: false,
      message: "Invalid audit-log filters.",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const { page, pageSize, action, entityType } = parsed.data;
  const where = {
    ...(action ? { action: { contains: action } } : {}),
    ...(entityType ? { entityType } : {}),
  };

  try {
    const [items, total, actionGroups, entityGroups] = await prisma.$transaction([
      prisma.adminAuditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { admin: { select: { id: true, name: true, email: true } } },
      }),
      prisma.adminAuditLog.count({ where }),
      prisma.adminAuditLog.groupBy({ by: ["action"], _count: { _all: true } }),
      prisma.adminAuditLog.groupBy({ by: ["entityType"], _count: { _all: true } }),
    ]);

    response.status(200).json({
      success: true,
      data: items.map((row) => ({
        id: row.id,
        action: row.action,
        entityType: row.entityType,
        entityId: row.entityId,
        details: row.details,
        createdAt: row.createdAt,
        admin: row.admin ? { id: row.admin.id, name: row.admin.name, email: row.admin.email } : null,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      filters: {
        actions: actionGroups.map((row) => row.action).sort(),
        entityTypes: entityGroups
          .map((row) => row.entityType)
          .filter((value): value is string => Boolean(value))
          .sort(),
      },
    });
  } catch (error) {
    next(error);
  }
}
