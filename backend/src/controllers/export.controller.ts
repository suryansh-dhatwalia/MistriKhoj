import type { NextFunction, Request, Response } from "express";
import { buildDataWorkbook, exportFileName } from "../lib/data-export.js";
import { prisma } from "../lib/prisma.js";
import type { SafeAdmin } from "../middleware/admin-auth.js";

/** GET /api/admin/export/data — downloads every Mistri, ad and ad request as .xlsx. */
export async function downloadDataExport(
  _request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const admin = response.locals.admin as SafeAdmin;
    const workbook = await buildDataWorkbook();
    await prisma.adminAuditLog.create({
      data: { adminId: admin.id, action: "DATA_EXPORTED", entityType: "Export", entityId: "xlsx" },
    });

    response.setHeader(
      "content-type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    response.setHeader("content-disposition", `attachment; filename="${exportFileName()}"`);
    await workbook.xlsx.write(response);
    response.end();
  } catch (error) {
    next(error);
  }
}
