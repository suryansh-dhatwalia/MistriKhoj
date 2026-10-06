import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  CATEGORY_CATALOG_ADDITIONS,
  categorySlug,
} from "../data/category-catalog.js";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";

async function availableSlug(preferred: string): Promise<string> {
  let slug = preferred;
  let suffix = 2;
  while (await prisma.category.findUnique({ where: { slug }, select: { id: true } })) {
    const ending = `-${suffix++}`;
    slug = `${preferred.slice(0, 80 - ending.length)}${ending}`;
  }
  return slug;
}

async function syncCategories(): Promise<void> {
  const [categoriesBefore, mistriCategoryCounts] = await Promise.all([
    prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.mistri.groupBy({
      by: ["category"],
      _count: { _all: true },
      orderBy: { category: "asc" },
    }),
  ]);

  const backupDir = path.resolve(env.BACKUP_DIR);
  await mkdir(backupDir, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(backupDir, `category-sync-${timestamp}.json`);
  await writeFile(
    backupPath,
    JSON.stringify({ createdAt: new Date().toISOString(), categoriesBefore, mistriCategoryCounts }, null, 2),
  );

  let nextSortOrder = categoriesBefore.reduce((max, row) => Math.max(max, row.sortOrder), -1) + 1;
  let created = 0;
  let statusUpdated = 0;

  for (const entry of CATEGORY_CATALOG_ADDITIONS) {
    const preferredSlug = entry.slug ?? categorySlug(entry.name);
    const existing = await prisma.category.findFirst({
      where: { OR: [{ name: entry.name }, { slug: preferredSlug }] },
    });
    if (existing) {
      if (existing.status !== entry.status) {
        await prisma.category.update({ where: { id: existing.id }, data: { status: entry.status } });
        statusUpdated += 1;
      }
      continue;
    }

    await prisma.category.create({
      data: {
        slug: await availableSlug(preferredSlug),
        name: entry.name,
        hindiName: entry.name,
        iconName: "Wrench",
        description: `${entry.name} services from local professionals.`,
        avgResponseTime: "Contact provider",
        popularServices: [],
        sortOrder: nextSortOrder++,
        status: entry.status,
      },
    });
    created += 1;
  }

  let recoveredFromMistris = 0;
  for (const row of mistriCategoryCounts) {
    const existing = await prisma.category.findFirst({ where: { name: row.category } });
    if (existing) continue;
    const preferredSlug = categorySlug(row.category);
    await prisma.category.create({
      data: {
        slug: await availableSlug(preferredSlug),
        name: row.category,
        hindiName: row.category,
        iconName: "Wrench",
        description: `${row.category} services from local professionals.`,
        avgResponseTime: "Contact provider",
        popularServices: [],
        sortOrder: nextSortOrder++,
        status: "ACTIVE",
      },
    });
    recoveredFromMistris += 1;
  }

  const [total, active, inactive, usedCategories] = await Promise.all([
    prisma.category.count(),
    prisma.category.count({ where: { status: "ACTIVE" } }),
    prisma.category.count({ where: { status: "INACTIVE" } }),
    prisma.mistri.groupBy({ by: ["category"], _count: { _all: true } }),
  ]);
  const missingMasters: string[] = [];
  for (const row of usedCategories) {
    const match = await prisma.category.findFirst({
      where: { name: row.category, status: "ACTIVE" },
      select: { id: true },
    });
    if (!match) missingMasters.push(row.category);
  }

  console.log(
    JSON.stringify(
      {
        backupPath,
        created,
        statusUpdated,
        recoveredFromMistris,
        totals: { total, active, inactive },
        mistriCategoriesWithoutActiveMaster: missingMasters,
      },
      null,
      2,
    ),
  );
}

syncCategories()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
