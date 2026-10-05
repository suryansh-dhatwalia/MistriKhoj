import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import ExcelJS from "exceljs";
import { env } from "../config/env.js";
import { prisma } from "./prisma.js";

const BACKUP_PREFIX = "mistrikhoj-data-";
const CHECK_EVERY_MS = 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

type Column = { header: string; key: string; width?: number };

function addSheet(workbook: ExcelJS.Workbook, name: string, columns: Column[], rows: object[]): void {
  const sheet = workbook.addWorksheet(name, { views: [{ state: "frozen", ySplit: 1 }] });
  sheet.columns = columns.map((column) => ({ width: 20, ...column }));
  sheet.addRows(rows);
  const header = sheet.getRow(1);
  header.font = { bold: true };
  header.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFB800" } };
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: columns.length } };
}

const joinList = (value: unknown): string =>
  Array.isArray(value) ? value.map(String).join(", ") : value == null ? "" : String(value);

/** Builds one workbook with every Mistri, subscription, ad and ad-request row. */
export async function buildDataWorkbook(): Promise<ExcelJS.Workbook> {
  const [mistris, subscriptions, advertisements, adRequests] = await Promise.all([
    prisma.mistri.findMany({ orderBy: { id: "asc" } }),
    prisma.mistriSubscription.findMany(),
    prisma.advertisement.findMany({ orderBy: { id: "asc" } }),
    prisma.adRequest.findMany({ orderBy: { id: "asc" } }),
  ]);
  const subscriptionByMistri = new Map(subscriptions.map((sub) => [sub.mistriId, sub]));

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "MistriKhoj";
  workbook.created = new Date();

  addSheet(
    workbook,
    "Mistris",
    [
      { header: "ID", key: "id", width: 8 },
      { header: "Full name", key: "fullName", width: 26 },
      { header: "Phone", key: "primaryPhone" },
      { header: "Alternate phone", key: "alternatePhone" },
      { header: "State", key: "state" },
      { header: "City", key: "city" },
      { header: "Category", key: "category" },
      { header: "Status", key: "status", width: 12 },
      { header: "Plan", key: "plan", width: 10 },
      { header: "Plan price (INR)", key: "priceInr", width: 16 },
      { header: "Plan starts", key: "startsAt" },
      { header: "Plan expires", key: "expiresAt" },
      { header: "Qualification", key: "qualification", width: 28 },
      { header: "Experience (yrs)", key: "experienceYears", width: 16 },
      { header: "Services offered", key: "servicesOffered", width: 36 },
      { header: "Address", key: "address", width: 40 },
      { header: "Pincode", key: "pincode", width: 10 },
      { header: "Short intro", key: "shortIntro", width: 40 },
      { header: "Referral code", key: "referralCode" },
      { header: "Profile photo URL", key: "profilePhotoUrl", width: 40 },
      { header: "Registered at", key: "createdAt" },
      { header: "Approved at", key: "approvedAt" },
    ],
    mistris.map((mistri) => {
      const sub = subscriptionByMistri.get(mistri.id);
      return {
        ...mistri,
        servicesOffered: joinList(mistri.servicesOffered),
        plan: sub?.plan ?? "FREE",
        priceInr: sub?.priceInr ?? 0,
        startsAt: sub?.startsAt ?? null,
        expiresAt: sub?.expiresAt ?? null,
      };
    }),
  );

  addSheet(
    workbook,
    "Advertisements",
    [
      { header: "ID", key: "id", width: 8 },
      { header: "Placement", key: "placement" },
      { header: "Company", key: "companyName", width: 26 },
      { header: "Title", key: "title", width: 30 },
      { header: "Description", key: "description", width: 40 },
      { header: "Link URL", key: "linkUrl", width: 36 },
      { header: "Image URL", key: "imageUrl", width: 36 },
      { header: "Video URL", key: "videoUrl", width: 36 },
      { header: "State", key: "state" },
      { header: "City", key: "city" },
      { header: "Category", key: "category" },
      { header: "Status", key: "status", width: 12 },
      { header: "Created at", key: "createdAt" },
    ],
    advertisements,
  );

  addSheet(
    workbook,
    "Ad requests",
    [
      { header: "ID", key: "id", width: 8 },
      { header: "Company", key: "companyName", width: 26 },
      { header: "Contact number", key: "contactNumber" },
      { header: "Email", key: "email", width: 28 },
      { header: "Ad type", key: "adType" },
      { header: "Duration", key: "duration" },
      { header: "Target URL", key: "targetUrl", width: 36 },
      { header: "Creative URL", key: "creativeUrl", width: 36 },
      { header: "Message", key: "message", width: 40 },
      { header: "Status", key: "status", width: 12 },
      { header: "Live ad ID", key: "advertisementId", width: 12 },
      { header: "Submitted at", key: "createdAt" },
    ],
    adRequests,
  );

  return workbook;
}

export function exportFileName(date = new Date()): string {
  return `${BACKUP_PREFIX}${date.toISOString().slice(0, 10)}.xlsx`;
}

const backupDir = (): string => path.resolve(env.BACKUP_DIR);

/** Writes a fresh backup workbook into the backup folder and returns its path. */
export async function writeBackupFile(): Promise<string> {
  const workbook = await buildDataWorkbook();
  const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
  await mkdir(backupDir(), { recursive: true });
  const filePath = path.join(backupDir(), exportFileName());
  await writeFile(filePath, buffer);
  return filePath;
}

async function latestBackupTime(): Promise<number | null> {
  try {
    const names = (await readdir(backupDir())).filter(
      (name) => name.startsWith(BACKUP_PREFIX) && name.endsWith(".xlsx"),
    );
    const times = await Promise.all(names.map(async (name) => (await stat(path.join(backupDir(), name))).mtimeMs));
    return times.length ? Math.max(...times) : null;
  } catch {
    return null;
  }
}

async function runBackupIfDue(): Promise<void> {
  try {
    const last = await latestBackupTime();
    if (last !== null && Date.now() - last < env.BACKUP_INTERVAL_DAYS * DAY_MS) return;
    const filePath = await writeBackupFile();
    console.log(`Data backup written to ${filePath}`);
  } catch (error) {
    console.error("Scheduled data backup failed:", error);
  }
}

/**
 * Writes an Excel backup every BACKUP_INTERVAL_DAYS. The newest file's timestamp is
 * the schedule, so restarting the server does not reset or double-run it.
 */
export function startBackupScheduler(): void {
  if (env.BACKUP_INTERVAL_DAYS === 0) return;
  void runBackupIfDue();
  setInterval(() => void runBackupIfDue(), CHECK_EVERY_MS).unref();
}
