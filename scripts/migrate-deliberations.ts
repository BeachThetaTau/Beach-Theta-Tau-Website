import { readFile } from "node:fs/promises";
import path from "node:path";
import { adminDb } from "./_firebase-admin.js";

const csvPath = process.argv.find((argument) => argument.endsWith(".csv"));
const apply = process.argv.includes("--apply");
if (!csvPath)
  throw new Error(
    "Usage: npm exec tsx scripts/migrate-deliberations.ts -- candidates.csv [--apply]",
  );

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]!;
    const next = text[index + 1];
    if (character === '"' && quoted && next === '"') {
      field += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && next === "\n") index += 1;
      row.push(field);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }
  row.push(field);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

function driveId(value: string) {
  const direct = value.match(/\/d\/([^/]+)/)?.[1];
  if (direct) return direct;
  try {
    return new URL(value).searchParams.get("id") ?? value.trim();
  } catch {
    return value.trim();
  }
}

const columns = {
  email: 2,
  firstName: 3,
  lastName: 4,
  event: 5,
  major: 9,
  gradYear: 11,
  image: 13,
};
const source = await readFile(path.resolve(csvPath), "utf8");
const rows = parseCsv(source).slice(1);
const candidates = new Map<
  string,
  { name: string; events: string[]; major: string; gradYear: string; image: string }
>();

for (const row of rows) {
  const email = row[columns.email]?.trim().toLowerCase();
  if (!email) continue;
  const candidate = candidates.get(email) ?? {
    name: "",
    events: [],
    major: "",
    gradYear: "",
    image: "",
  };
  candidate.name =
    `${row[columns.firstName] ?? ""} ${row[columns.lastName] ?? ""}`.trim() || candidate.name;
  const event = row[columns.event]?.trim();
  if (event && !candidate.events.includes(event)) candidate.events.push(event);
  candidate.major = row[columns.major]?.trim() || candidate.major;
  candidate.gradYear = row[columns.gradYear]?.trim() || candidate.gradYear;
  candidate.image = driveId(row[columns.image] ?? "") || candidate.image;
  candidates.set(email, candidate);
}

console.log(`${apply ? "Importing" : "Would import"} ${candidates.size} deliberation candidates.`);
if (apply) {
  let batch = adminDb.batch();
  let operations = 0;
  for (const [email, candidate] of candidates) {
    batch.set(adminDb.doc(`delibs/${email}`), candidate, { merge: true });
    operations += 1;
    if (operations >= 450) {
      await batch.commit();
      batch = adminDb.batch();
      operations = 0;
    }
  }
  if (operations) await batch.commit();
  console.log("Candidate import complete.");
} else {
  console.log("Dry run only. Re-run with --apply to write changes.");
}
