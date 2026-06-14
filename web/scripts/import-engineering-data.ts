import "dotenv/config";

import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";

import { parse } from "csv-parse";
import { Prisma } from "@/generated/prisma/client";

import {
  ENGINEERING_DATASETS,
  resolveDatasetPath,
  type EngineeringDatasetConfig,
} from "../src/lib/datasets";
import { refreshCutoffStats, initializeCutoffView } from "../src/lib/queries";
import { prisma } from "../src/lib/prisma";

const BATCH_SIZE = 5_000; // Larger batches for faster import

type CsvRow = Record<string, string>;

type EngineeringEntryInput = {
  year: number;
  capRound: string;
  instituteCode: string;
  instituteName: string;
  courseCode: string;
  courseName: string;
  seatSection: string | null;
  meritNo: number | null;
  srMeritNo: number | null;
  mhtCetScore: Prisma.Decimal | null;
  applicationId: string;
  candidateName: string;
  gender: string;
  candidateCategory: string;
  seatType: string;
  sourcePdf: string | null;
};

function emptyToNull(value: string | undefined): string | null {
  if (!value || value === "" || value === "--" || value === "-") {
    return null;
  }
  return value;
}

function sanitizeName(name: string): string {
  return name
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

function mapRow(row: CsvRow): EngineeringEntryInput | null {
  const meritNo = row.merit_no ? Number.parseInt(row.merit_no, 10) : null;
  const srMeritNo = row.sr_merit_no ? Number.parseInt(row.sr_merit_no, 10) : null;
  const mhtCetScore = row.mht_cet_score ? Number.parseFloat(row.mht_cet_score) : null;

  const year = Number.parseInt(row.year, 10);
  if (!Number.isFinite(year)) {
    return null;
  }

  return {
    year,
    capRound: row.cap_round || "",
    instituteCode: row.institute_code || "",
    instituteName: row.institute_name || "",
    courseCode: row.course_code || "",
    courseName: row.course_name || "",
    seatSection: emptyToNull(row.seat_section),
    meritNo,
    srMeritNo,
    mhtCetScore: mhtCetScore !== null && Number.isFinite(mhtCetScore) 
      ? new Prisma.Decimal(mhtCetScore) 
      : null,
    applicationId: row.application_id || "",
    candidateName: sanitizeName(row.candidate_name || ""),
    gender: row.gender || "",
    candidateCategory: row.candidate_category || "",
    seatType: row.seat_type || "",
    sourcePdf: emptyToNull(row.source_pdf),
  };
}

async function readCsvRows(filePath: string): Promise<EngineeringEntryInput[]> {
  return new Promise((resolve, reject) => {
    const rows: EngineeringEntryInput[] = [];

    createReadStream(filePath)
      .pipe(
        parse({
          columns: true,
          skip_empty_lines: true,
          trim: true,
          relax_quotes: true,
        }),
      )
      .on("data", (row: CsvRow) => {
        const mapped = mapRow(row);
        if (mapped) {
          rows.push(mapped);
        }
      })
      .on("error", reject)
      .on("end", () => resolve(rows));
  });
}

async function flushBatch(cycleId: string, batch: EngineeringEntryInput[]): Promise<void> {
  if (batch.length === 0) {
    return;
  }

  // Use raw SQL for faster inserts with UUID generation
  const values = batch.map((entry) => 
    `(gen_random_uuid()::text, '${entry.year}', '${entry.capRound}', '${entry.instituteCode}', '${entry.instituteName.replace(/'/g, "''")}', '${entry.courseCode}', '${entry.courseName.replace(/'/g, "''")}', ${entry.seatSection ? `'${entry.seatSection}'` : 'NULL'}, ${entry.meritNo}, ${entry.srMeritNo}, ${entry.mhtCetScore}, '${entry.applicationId}', '${entry.candidateName.replace(/'/g, "''")}', '${entry.gender}', '${entry.candidateCategory}', '${entry.seatType}', ${entry.sourcePdf ? `'${entry.sourcePdf.replace(/'/g, "''")}'` : 'NULL'}, '${cycleId}', NOW())`
  ).join(',');

  await prisma.$executeRawUnsafe(`
    INSERT INTO engineering_entries (
      id, year, cap_round, institute_code, institute_name, course_code, course_name,
      seat_section, merit_no, sr_merit_no, mht_cet_score, application_id,
      candidate_name, gender, candidate_category, seat_type, source_pdf,
      cycle_id, created_at
    ) VALUES ${values}
  `);
}

async function importDataset(dataset: EngineeringDatasetConfig): Promise<number> {
  const filePath = resolveDatasetPath(dataset.relativeFile);

  try {
    await stat(filePath);
  } catch {
    console.warn(`[skip] missing file: ${filePath}`);
    return 0;
  }

  console.log(`\nImporting ${dataset.slug} from ${filePath}`);
  const rows = await readCsvRows(filePath);
  console.log(`  parsed ${rows.length.toLocaleString()} rows`);

  const cycle = await prisma.admissionCycle.upsert({
    where: { slug: dataset.slug },
    create: {
      year: dataset.year,
      slug: dataset.slug,
      sourceFile: dataset.relativeFile,
    },
    update: {
      sourceFile: dataset.relativeFile,
    },
  });

  await prisma.engineeringEntry.deleteMany({ where: { cycleId: cycle.id } });

  let imported = 0;
  let batch: EngineeringEntryInput[] = [];

  for (const row of rows) {
    batch.push(row);

    if (batch.length >= BATCH_SIZE) {
      await flushBatch(cycle.id, batch);
      imported += batch.length;
      batch = [];
      process.stdout.write(`  inserted ${imported.toLocaleString()}...\r`);
    }
  }

  await flushBatch(cycle.id, batch);
  imported += batch.length;

  await prisma.admissionCycle.update({
    where: { id: cycle.id },
    data: {
      rowCount: imported,
      importedAt: new Date(),
    },
  });

  console.log(`  done: ${imported.toLocaleString()} rows for ${dataset.slug}`);
  return imported;
}

async function main(): Promise<void> {
  const slugArg = process.argv.find((arg) => arg.startsWith("--slug="));
  const slug = slugArg?.slice("--slug=".length);

  const datasets = slug
    ? ENGINEERING_DATASETS.filter((dataset) => dataset.slug === slug)
    : ENGINEERING_DATASETS;

  if (datasets.length === 0) {
    throw new Error(
      slug
        ? `Unknown slug "${slug}". Available: ${ENGINEERING_DATASETS.map((d) => d.slug).join(", ")}`
        : "No datasets configured.",
    );
  }

  // Initialize cutoff view if it doesn't exist
  console.log("Initializing cutoff stats view...");
  try {
    await initializeCutoffView();
    console.log("Cutoff stats view initialized.");
  } catch (error) {
    console.log("Cutoff view already exists or error:", error);
  }

  let total = 0;
  for (const dataset of datasets) {
    total += await importDataset(dataset);
  }

  console.log(`\nImport complete: ${total.toLocaleString()} total rows.`);
  console.log("\nRefreshing cutoff stats materialized view...");
  await refreshCutoffStats();
  console.log("Cutoff stats refreshed.");
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
