import type { RequestHandler } from "express";
import type { ZodTypeAny } from "zod";
import { prisma } from "./prisma.js";
import type { SafeAdmin } from "../middleware/admin-auth.js";
import { idParamSchema } from "../schemas/shared.js";

type AnyRecord = Record<string, unknown>;

/**
 * Minimal structural view of a Prisma model delegate. Prisma's generated delegates
 * do not share a public interface, so the factory addresses them by model key and
 * relies on this shape at the call sites it actually uses.
 */
interface PrismaModelDelegate {
  findMany(args?: AnyRecord): Promise<AnyRecord[]>;
  findUnique(args: AnyRecord): Promise<AnyRecord | null>;
  create(args: AnyRecord): Promise<AnyRecord>;
  update(args: AnyRecord): Promise<AnyRecord>;
  delete(args: AnyRecord): Promise<AnyRecord>;
  count(args?: AnyRecord): Promise<number>;
}

function delegateOf(client: unknown, model: string): PrismaModelDelegate {
  return (client as Record<string, PrismaModelDelegate>)[model];
}

/** "SubscriptionPlan" -> "SUBSCRIPTION_PLAN" for audit-log action names. */
function auditPrefix(entity: string): string {
  return entity.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toUpperCase();
}

export interface CrudControllerConfig {
  /** Prisma delegate key, e.g. "state", "advertisement". */
  model: string;
  /** Human entity name used for audit-log `entityType` and 404 messages, e.g. "State". */
  auditEntity: string;
  createSchema: ZodTypeAny;
  updateSchema: ZodTypeAny;
  /** Parses list query params — expected to yield { page, pageSize, search?, status?, sortBy?, sortOrder? }. */
  listQuerySchema: ZodTypeAny;
  /** Fields matched with `contains` when `search` is supplied. */
  searchableFields?: string[];
  /** Applied when the parsed query has no `sortBy`. Defaults to newest first. */
  defaultOrderBy?: Array<Record<string, "asc" | "desc">>;
  include?: AnyRecord;
  select?: AnyRecord;
  /** Shape the stored row into the API response (parse JSON columns, drop internals). */
  transform?: (row: AnyRecord) => unknown;
  /** Extra `where` clauses merged into every list query (e.g. a fixed `placement`). */
  buildWhere?: (query: AnyRecord) => AnyRecord;
  /** Map validated create input to Prisma `data` (may upload images — runs outside the txn). */
  toCreateData?: (input: AnyRecord) => Promise<AnyRecord> | AnyRecord;
  /** Map validated update input to Prisma `data`, given the current row. */
  toUpdateData?: (input: AnyRecord, existing: AnyRecord) => Promise<AnyRecord> | AnyRecord;
  /** `select` used when loading the current row before an update/delete (e.g. image public ids). */
  existingSelectForWrite?: AnyRecord;
  /** Runs before a delete with the loaded row; throw an HttpError to block it (e.g. still referenced). */
  beforeDelete?: (existing: AnyRecord) => Promise<void> | void;
  /** Runs after a successful delete (e.g. remove Cloudinary assets). */
  onAfterDelete?: (existing: AnyRecord) => Promise<void> | void;
  /** Runs after a successful update (e.g. remove a replaced Cloudinary asset). */
  onAfterUpdate?: (updated: AnyRecord, previous: AnyRecord) => Promise<void> | void;
}

export interface CrudController {
  list: RequestHandler;
  getOne: RequestHandler;
  create: RequestHandler;
  update: RequestHandler;
  remove: RequestHandler;
}

export function createCrudController(config: CrudControllerConfig): CrudController {
  const searchableFields = config.searchableFields ?? [];
  const defaultOrderBy = config.defaultOrderBy ?? [{ id: "desc" }];
  const prefix = auditPrefix(config.auditEntity);
  const readArgs: AnyRecord = {
    ...(config.include ? { include: config.include } : {}),
    ...(config.select ? { select: config.select } : {}),
  };
  const present = (row: AnyRecord): unknown => (config.transform ? config.transform(row) : row);

  const list: RequestHandler = async (request, response, next) => {
    try {
      const parsed = config.listQuerySchema.safeParse(request.query);
      if (!parsed.success) {
        response.status(422).json({
          success: false,
          message: "Invalid list filters.",
          errors: parsed.error.flatten().fieldErrors,
        });
        return;
      }

      const query = parsed.data as AnyRecord;
      const page = Number(query.page ?? 1);
      const pageSize = Number(query.pageSize ?? 20);
      const search = typeof query.search === "string" ? query.search.trim() : "";

      const where: AnyRecord = { ...(config.buildWhere ? config.buildWhere(query) : {}) };
      if (query.status) where.status = query.status;
      if (search && searchableFields.length > 0) {
        where.OR = searchableFields.map((field) => ({ [field]: { contains: search } }));
      }

      const orderBy = query.sortBy
        ? [{ [String(query.sortBy)]: query.sortOrder === "asc" ? "asc" : "desc" }]
        : defaultOrderBy;

      const delegate = delegateOf(prisma, config.model);
      const [items, total] = await Promise.all([
        delegate.findMany({
          where,
          orderBy,
          skip: (page - 1) * pageSize,
          take: pageSize,
          ...readArgs,
        }),
        delegate.count({ where }),
      ]);

      response.status(200).json({
        success: true,
        data: items.map(present),
        total,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      });
    } catch (error) {
      next(error);
    }
  };

  const getOne: RequestHandler = async (request, response, next) => {
    try {
      const id = idParamSchema.safeParse(request.params.id);
      if (!id.success) {
        response.status(400).json({ success: false, message: `Invalid ${config.auditEntity} ID.` });
        return;
      }
      const row = await delegateOf(prisma, config.model).findUnique({ where: { id: id.data }, ...readArgs });
      if (!row) {
        response.status(404).json({ success: false, message: `${config.auditEntity} not found.` });
        return;
      }
      response.status(200).json({ success: true, data: present(row) });
    } catch (error) {
      next(error);
    }
  };

  const create: RequestHandler = async (request, response, next) => {
    try {
      const parsed = config.createSchema.safeParse(request.body);
      if (!parsed.success) {
        response.status(422).json({
          success: false,
          message: "Please correct the highlighted fields.",
          errors: parsed.error.flatten().fieldErrors,
        });
        return;
      }

      const admin = response.locals.admin as SafeAdmin;
      const data = config.toCreateData
        ? await config.toCreateData(parsed.data as AnyRecord)
        : (parsed.data as AnyRecord);

      const row = await prisma.$transaction(async (tx) => {
        const created = await delegateOf(tx, config.model).create({ data, ...readArgs });
        await tx.adminAuditLog.create({
          data: {
            adminId: admin.id,
            action: `${prefix}_CREATED`,
            entityType: config.auditEntity,
            entityId: String(created.id),
          },
        });
        return created;
      });

      response.status(201).json({ success: true, data: present(row) });
    } catch (error) {
      next(error);
    }
  };

  const update: RequestHandler = async (request, response, next) => {
    try {
      const id = idParamSchema.safeParse(request.params.id);
      if (!id.success) {
        response.status(400).json({ success: false, message: `Invalid ${config.auditEntity} ID.` });
        return;
      }

      const parsed = config.updateSchema.safeParse(request.body);
      if (!parsed.success) {
        response.status(422).json({
          success: false,
          message: "Please correct the highlighted fields.",
          errors: parsed.error.flatten().fieldErrors,
        });
        return;
      }

      const admin = response.locals.admin as SafeAdmin;
      const delegate = delegateOf(prisma, config.model);
      const existing = await delegate.findUnique({
        where: { id: id.data },
        ...(config.existingSelectForWrite ? { select: config.existingSelectForWrite } : {}),
      });
      if (!existing) {
        response.status(404).json({ success: false, message: `${config.auditEntity} not found.` });
        return;
      }

      const data = config.toUpdateData
        ? await config.toUpdateData(parsed.data as AnyRecord, existing)
        : (parsed.data as AnyRecord);

      const updated = await prisma.$transaction(async (tx) => {
        const row = await delegateOf(tx, config.model).update({ where: { id: id.data }, data, ...readArgs });
        await tx.adminAuditLog.create({
          data: {
            adminId: admin.id,
            action: `${prefix}_UPDATED`,
            entityType: config.auditEntity,
            entityId: String(id.data),
          },
        });
        return row;
      });

      if (config.onAfterUpdate) {
        await config.onAfterUpdate(updated, existing);
      }

      response.status(200).json({ success: true, data: present(updated) });
    } catch (error) {
      next(error);
    }
  };

  const remove: RequestHandler = async (request, response, next) => {
    try {
      const id = idParamSchema.safeParse(request.params.id);
      if (!id.success) {
        response.status(400).json({ success: false, message: `Invalid ${config.auditEntity} ID.` });
        return;
      }

      const admin = response.locals.admin as SafeAdmin;
      const delegate = delegateOf(prisma, config.model);
      const existing = await delegate.findUnique({
        where: { id: id.data },
        ...(config.existingSelectForWrite ? { select: config.existingSelectForWrite } : {}),
      });
      if (!existing) {
        response.status(404).json({ success: false, message: `${config.auditEntity} not found.` });
        return;
      }

      if (config.beforeDelete) {
        await config.beforeDelete(existing);
      }

      await prisma.$transaction(async (tx) => {
        await delegateOf(tx, config.model).delete({ where: { id: id.data } });
        await tx.adminAuditLog.create({
          data: {
            adminId: admin.id,
            action: `${prefix}_DELETED`,
            entityType: config.auditEntity,
            entityId: String(id.data),
          },
        });
      });

      if (config.onAfterDelete) {
        await config.onAfterDelete(existing);
      }

      response.status(200).json({ success: true, message: `${config.auditEntity} deleted.` });
    } catch (error) {
      next(error);
    }
  };

  return { list, getOne, create, update, remove };
}
