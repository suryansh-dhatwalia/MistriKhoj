import type { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "./prisma.js";
export { MAX_EXTRA_CATEGORIES, normalizeExtraCategories } from "./mistri-category-rules.js";

type ExtraCategoryClient = Pick<Prisma.TransactionClient, "mistriExtraCategory">;

/** Extra categories for each requested Mistri id, in the order they were chosen. */
export async function loadExtraCategories(
  ids: readonly number[],
  client: ExtraCategoryClient = prisma,
): Promise<Map<number, string[]>> {
  const map = new Map<number, string[]>();
  if (ids.length === 0) return map;
  const rows = await client.mistriExtraCategory.findMany({
    where: { mistriId: { in: [...ids] } },
    orderBy: { id: "asc" },
    select: { mistriId: true, category: true },
  });
  for (const row of rows) {
    const list = map.get(row.mistriId) ?? [];
    list.push(row.category);
    map.set(row.mistriId, list);
  }
  return map;
}

/** Replaces a Mistri's extra categories with an already-normalized list. */
export async function replaceExtraCategories(
  client: ExtraCategoryClient,
  mistriId: number,
  categories: readonly string[],
): Promise<void> {
  await client.mistriExtraCategory.deleteMany({ where: { mistriId } });
  if (categories.length > 0) {
    await client.mistriExtraCategory.createMany({
      data: categories.map((category) => ({ mistriId, category })),
    });
  }
}

/** Ids of Mistris that list `category` as an extra trade (exact name match). */
export async function mistriIdsWithExtraCategory(category: string): Promise<number[]> {
  const rows = await prisma.mistriExtraCategory.findMany({
    where: { category },
    select: { mistriId: true },
  });
  return rows.map((row) => row.mistriId);
}
