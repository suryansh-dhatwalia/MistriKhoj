import "dotenv/config";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { Prisma } from "../../generated/prisma/client.js";
import { env } from "../config/env.js";
import { normalizeCategoryName } from "../data/category-catalog.js";
import { prisma } from "../lib/prisma.js";

type SqlValue = string | null;
type LegacyMistri = {
  id: number;
  state: string;
  city: string;
  category: string;
  name: string;
  primaryPhone: string;
  alternatePhone: string;
  qualification: string;
  address: string;
  experience: string;
  about: string;
  profilePic: string;
  referralCode: string;
};

type Match = {
  currentId: number;
  legacyId: number;
  strategy: string;
  currentCategory: string;
  targetCategory: string;
  targetServices: string[];
};

function parseSqlTuples(source: string): SqlValue[][] {
  const rows: SqlValue[][] = [];
  let row: SqlValue[] = [];
  let field = "";
  let depth = 0;
  let inString = false;
  let escaped = false;
  let quoted = false;

  const finishField = () => {
    const value = quoted ? field : field.trim();
    row.push(!quoted && value.toUpperCase() === "NULL" ? null : value);
    field = "";
    quoted = false;
  };

  for (const character of source) {
    if (inString) {
      if (escaped) {
        const escapes: Record<string, string> = {
          "0": "\0",
          b: "\b",
          n: "\n",
          r: "\r",
          t: "\t",
          Z: "\u001a",
        };
        field += escapes[character] ?? character;
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === "'") {
        inString = false;
      } else {
        field += character;
      }
      continue;
    }

    if (character === "'") {
      inString = true;
      quoted = true;
    } else if (character === "(") {
      if (depth === 0) row = [];
      depth += 1;
    } else if (character === ")") {
      if (depth === 1) {
        finishField();
        rows.push(row);
      }
      depth -= 1;
    } else if (character === "," && depth === 1) {
      finishField();
    } else if (depth === 1) {
      field += character;
    }
  }

  if (inString || depth !== 0) throw new Error("Could not parse the legacy SQL tuple data safely.");
  return rows;
}

function extractLegacyMistris(sql: string): LegacyMistri[] {
  const marker = "INSERT INTO `tbl_mistri`";
  const result: LegacyMistri[] = [];
  let searchFrom = 0;

  while (true) {
    const insertStart = sql.indexOf(marker, searchFrom);
    if (insertStart < 0) break;
    const columnsStart = sql.indexOf("(", insertStart + marker.length);
    const columnsEnd = sql.indexOf(") VALUES", columnsStart);
    if (columnsStart < 0 || columnsEnd < 0) throw new Error("Malformed tbl_mistri INSERT header.");
    const columnsText = sql.slice(columnsStart, columnsEnd + 1);
    const columns = [...columnsText.matchAll(/`([^`]+)`/g)].map((match) => match[1]);
    const valuesStart = columnsEnd + ") VALUES".length;

    let inString = false;
    let escaped = false;
    let depth = 0;
    let statementEnd = -1;
    for (let index = valuesStart; index < sql.length; index += 1) {
      const character = sql[index];
      if (inString) {
        if (escaped) escaped = false;
        else if (character === "\\") escaped = true;
        else if (character === "'") inString = false;
      } else if (character === "'") inString = true;
      else if (character === "(") depth += 1;
      else if (character === ")") depth -= 1;
      else if (character === ";" && depth === 0) {
        statementEnd = index;
        break;
      }
    }
    if (statementEnd < 0) throw new Error("Unterminated tbl_mistri INSERT statement.");

    const rows = parseSqlTuples(sql.slice(valuesStart, statementEnd));
    const columnIndex = new Map(columns.map((column, index) => [column, index]));
    const value = (row: SqlValue[], column: string): string =>
      String(row[columnIndex.get(column) ?? -1] ?? "").trim();

    for (const row of rows) {
      result.push({
        id: Number(value(row, "id")),
        state: value(row, "state"),
        city: value(row, "city"),
        category: value(row, "category").replace(/\s+/g, " "),
        name: value(row, "name"),
        primaryPhone: value(row, "phone_no"),
        alternatePhone: value(row, "alternate_no"),
        qualification: value(row, "qualification"),
        address: value(row, "address"),
        experience: value(row, "experience"),
        about: value(row, "about"),
        profilePic: value(row, "profile_pic"),
        referralCode: value(row, "referral_code"),
      });
    }
    searchFrom = statementEnd + 1;
  }

  return result;
}

function phoneKey(value: string | null | undefined): string {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (digits.length < 10) return "";
  const lastTen = digits.slice(-10);
  return /^[6-9]\d{9}$/.test(lastTen) ? lastTen : "";
}

function textKey(value: string | null | undefined): string {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("en-IN");
}

function categoryMatchKey(value: string): string {
  return normalizeCategoryName(value).replace(/\s*([,/()&-])\s*/g, "$1");
}

function profileFilename(value: string | null | undefined): string {
  const withoutQuery = String(value ?? "").split(/[?#]/, 1)[0];
  return withoutQuery.split("/").pop()?.trim().toLocaleLowerCase("en-IN") ?? "";
}

function narrowByExactEvidence<T>(
  candidates: LegacyMistri[],
  currentValue: T,
  legacyValue: (candidate: LegacyMistri) => T,
): LegacyMistri[] {
  if (currentValue === "" || currentValue === null || currentValue === undefined) return candidates;
  const matching = candidates.filter((candidate) => legacyValue(candidate) === currentValue);
  return matching.length > 0 ? matching : candidates;
}

function addToIndex(index: Map<string, LegacyMistri[]>, key: string, row: LegacyMistri): void {
  if (!key) return;
  const values = index.get(key) ?? [];
  values.push(row);
  index.set(key, values);
}

function sameLegacyCategory(rows: LegacyMistri[]): boolean {
  return new Set(rows.map((row) => normalizeCategoryName(row.category))).size === 1;
}

function reconcileServices(value: unknown, previousPrimary: string, legacyCategories: string[]): string[] {
  const result: string[] = [];
  const seen = new Set<string>();
  const legacyCategoryKeys = new Set(legacyCategories.map((category) => normalizeCategoryName(category)));
  const add = (service: string) => {
    const cleaned = service.trim().replace(/\s+/g, " ");
    const key = normalizeCategoryName(cleaned);
    if (!cleaned || seen.has(key)) return;
    seen.add(key);
    result.push(cleaned);
  };

  if (Array.isArray(value)) {
    for (const service of value) {
      if (typeof service !== "string") continue;
      if (normalizeCategoryName(service) === normalizeCategoryName(previousPrimary)) continue;
      if (legacyCategoryKeys.has(normalizeCategoryName(service))) continue;
      add(service);
    }
  }
  for (const category of legacyCategories) add(category);
  return result;
}

function sameStringList(left: string[], right: unknown): boolean {
  if (!Array.isArray(right) || left.length !== right.length) return false;
  return left.every(
    (value, index) =>
      typeof right[index] === "string" && normalizeCategoryName(value) === normalizeCategoryName(right[index]),
  );
}

async function main(): Promise<void> {
  const sqlPathArgument = process.argv.find((argument) => argument.startsWith("--sql="));
  if (!sqlPathArgument) throw new Error("Provide the legacy dump path with --sql=/absolute/path/dbmistri.sql");
  const sqlPath = sqlPathArgument.slice("--sql=".length);
  const applyChanges = process.argv.includes("--apply");
  const sql = await readFile(sqlPath, "utf8");
  const legacyRows = extractLegacyMistris(sql);

  const [currentRows, categoryMasters] = await Promise.all([
    prisma.mistri.findMany({
      orderBy: { id: "asc" },
      select: {
        id: true,
        fullName: true,
        primaryPhone: true,
        alternatePhone: true,
        state: true,
        city: true,
        category: true,
        qualification: true,
        address: true,
        experienceYears: true,
        servicesOffered: true,
        shortIntro: true,
        profilePhotoUrl: true,
        referralCode: true,
      },
    }),
    prisma.category.findMany({ where: { status: "ACTIVE" }, select: { name: true } }),
  ]);

  const masterNameByKey = new Map(
    categoryMasters.map((category) => [categoryMatchKey(category.name), category.name]),
  );
  const legacyPrimary = new Map<string, LegacyMistri[]>();
  const legacyAlternate = new Map<string, LegacyMistri[]>();
  for (const row of legacyRows) {
    addToIndex(legacyPrimary, phoneKey(row.primaryPhone), row);
    addToIndex(legacyAlternate, phoneKey(row.alternatePhone), row);
  }

  const matches: Match[] = [];
  const multiCategoryMatches: Array<{
    currentId: number;
    currentCategory: string;
    candidates: Array<{ legacyId: number; category: string }>;
  }> = [];
  const unmatched: number[] = [];
  const missingTargetCategories = new Set<string>();
  const missingTargetMatches: Array<{ currentId: number; legacyId: number; category: string }> = [];
  const strategyCounts = new Map<string, number>();

  for (const current of currentRows) {
    const currentPrimary = phoneKey(current.primaryPhone);
    const currentAlternate = phoneKey(current.alternatePhone);
    const attempts: Array<[string, LegacyMistri[]]> = [
      ["primary-to-primary", legacyPrimary.get(currentPrimary) ?? []],
      ["primary-to-alternate", legacyAlternate.get(currentPrimary) ?? []],
      ["alternate-to-primary", currentAlternate ? legacyPrimary.get(currentAlternate) ?? [] : []],
      ["alternate-to-alternate", currentAlternate ? legacyAlternate.get(currentAlternate) ?? [] : []],
    ];

    let strategy = "";
    let candidates: LegacyMistri[] = [];
    for (const attempt of attempts) {
      if (attempt[1].length > 0) {
        [strategy, candidates] = attempt;
        break;
      }
    }

    const uniqueById = [...new Map(candidates.map((candidate) => [candidate.id, candidate])).values()];
    candidates = uniqueById;
    let serviceCandidates = uniqueById;
    if (serviceCandidates.length > 1) {
      const sameName = serviceCandidates.filter(
        (candidate) => textKey(candidate.name) === textKey(current.fullName),
      );
      if (sameName.length > 0) serviceCandidates = sameName;
    }
    if (candidates.length > 1) {
      candidates = narrowByExactEvidence(
        candidates,
        profileFilename(current.profilePhotoUrl),
        (candidate) => profileFilename(candidate.profilePic),
      );
    }
    if (candidates.length > 1) {
      candidates = narrowByExactEvidence(
        candidates,
        textKey(current.referralCode),
        (candidate) => textKey(candidate.referralCode),
      );
      candidates = narrowByExactEvidence(
        candidates,
        textKey(current.address),
        (candidate) => textKey(candidate.address),
      );
      candidates = narrowByExactEvidence(
        candidates,
        textKey(current.qualification),
        (candidate) => textKey(candidate.qualification),
      );
      candidates = narrowByExactEvidence(
        candidates,
        current.experienceYears,
        (candidate) => Number.parseInt(candidate.experience, 10) || 0,
      );
      candidates = narrowByExactEvidence(
        candidates,
        textKey(current.shortIntro),
        (candidate) => textKey(candidate.about),
      );
    }
    if (candidates.length > 1) {
      const nameMatches = candidates.filter((candidate) => textKey(candidate.name) === textKey(current.fullName));
      if (nameMatches.length === 1) candidates = nameMatches;
      else {
        const locationMatches = candidates.filter(
          (candidate) =>
            textKey(candidate.name) === textKey(current.fullName) &&
            textKey(candidate.state) === textKey(current.state) &&
            textKey(candidate.city) === textKey(current.city),
        );
        if (locationMatches.length === 1) candidates = locationMatches;
        else if (sameLegacyCategory(candidates)) candidates = [candidates[0]];
      }
    }

    if (candidates.length === 0) {
      const nameAndLocation = legacyRows.filter(
        (candidate) =>
          textKey(candidate.name) === textKey(current.fullName) &&
          textKey(candidate.state) === textKey(current.state) &&
          textKey(candidate.city) === textKey(current.city),
      );
      if (nameAndLocation.length === 1) {
        candidates = nameAndLocation;
        serviceCandidates = nameAndLocation;
        strategy = "name-state-city";
      }
    }

    if (candidates.length === 0) {
      unmatched.push(current.id);
      continue;
    }
    if (candidates.length > 1) {
      multiCategoryMatches.push({
        currentId: current.id,
        currentCategory: current.category,
        candidates: candidates.map((candidate) => ({ legacyId: candidate.id, category: candidate.category })),
      });
      candidates = [candidates.slice().sort((left, right) => left.id - right.id)[0]];
    }

    const legacy = candidates[0];
    const targetCategory = masterNameByKey.get(categoryMatchKey(legacy.category));
    const targetServices: string[] = [];
    const targetServiceKeys = new Set<string>();
    let missingServiceCategory = false;
    for (const serviceCandidate of serviceCandidates.slice().sort((left, right) => left.id - right.id)) {
      const masterName = masterNameByKey.get(categoryMatchKey(serviceCandidate.category));
      if (!masterName) {
        missingServiceCategory = true;
        missingTargetCategories.add(serviceCandidate.category);
        missingTargetMatches.push({
          currentId: current.id,
          legacyId: serviceCandidate.id,
          category: serviceCandidate.category,
        });
        continue;
      }
      const key = normalizeCategoryName(masterName);
      if (targetServiceKeys.has(key)) continue;
      targetServiceKeys.add(key);
      targetServices.push(masterName);
    }
    if (!targetCategory || missingServiceCategory) {
      if (!targetCategory) {
        missingTargetCategories.add(legacy.category);
        missingTargetMatches.push({ currentId: current.id, legacyId: legacy.id, category: legacy.category });
      }
      continue;
    }
    strategyCounts.set(strategy, (strategyCounts.get(strategy) ?? 0) + 1);
    matches.push({
      currentId: current.id,
      legacyId: legacy.id,
      strategy,
      currentCategory: current.category,
      targetCategory,
      targetServices: reconcileServices(current.servicesOffered, current.category, targetServices),
    });
  }

  const changes = matches.filter(
    (match) => {
      const current = currentRows.find((row) => row.id === match.currentId);
      return (
        normalizeCategoryName(match.currentCategory) !== normalizeCategoryName(match.targetCategory) ||
        !sameStringList(match.targetServices, current?.servicesOffered)
      );
    },
  );
  const categoryChanges = changes.filter(
    (match) => normalizeCategoryName(match.currentCategory) !== normalizeCategoryName(match.targetCategory),
  ).length;
  const serviceChanges = changes.filter((match) => {
    const current = currentRows.find((row) => row.id === match.currentId);
    return !sameStringList(match.targetServices, current?.servicesOffered);
  }).length;
  const summary = {
    mode: applyChanges ? "apply" : "preview",
    legacyRows: legacyRows.length,
    currentRows: currentRows.length,
    matched: matches.length,
    recordsChanged: changes.length,
    categoryChanges,
    serviceChanges,
    alreadyMatching: matches.length - changes.length,
    multiCategoryRecords: multiCategoryMatches.length,
    unmatched: unmatched.length,
    missingTargetCategories: [...missingTargetCategories].sort((left, right) => left.localeCompare(right)),
    strategyCounts: Object.fromEntries(strategyCounts),
    multiCategoryDetails: multiCategoryMatches,
    missingTargetMatches,
    unmatchedCurrentIds: unmatched,
  };

  if (!applyChanges) {
    console.log(JSON.stringify(summary, null, 2));
    return;
  }
  if (missingTargetCategories.size > 0) {
    throw new Error("Create active category masters for every missingTargetCategories value before applying.");
  }

  const backupDir = path.resolve(env.BACKUP_DIR);
  await mkdir(backupDir, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(backupDir, `mistri-category-reconcile-${timestamp}.json`);
  await writeFile(
    backupPath,
    JSON.stringify(
      {
        createdAt: new Date().toISOString(),
        sourceSql: sqlPath,
        summary,
        before: currentRows,
        matches,
        multiCategoryMatches,
        unmatched,
      },
      null,
      2,
    ),
  );

  for (let start = 0; start < changes.length; start += 50) {
    const batch = changes.slice(start, start + 50);
    await prisma.$transaction(
      batch.flatMap((change) => [
        prisma.mistri.update({
          where: { id: change.currentId },
          data: {
            category: change.targetCategory,
            servicesOffered: change.targetServices as Prisma.InputJsonValue,
          },
        }),
        prisma.mistriSubscription.updateMany({
          where: { mistriId: change.currentId },
          data: { category: change.targetCategory },
        }),
      ]),
    );
  }

  console.log(JSON.stringify({ ...summary, backupPath, applied: changes.length }, null, 2));
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
