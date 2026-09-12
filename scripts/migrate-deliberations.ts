import { readCsvFile, createColumnFinder } from "./lib/csv.js";
import { writeBatchToFirestore } from "./lib/firestore-writer.js";
import {
  extractDriveId,
  normalizeEmail,
  cleanString,
  cleanEventName,
  omitEmptyValues,
} from "./lib/transformers.js";

const csvPath =
  process.argv.find((arg) => arg.startsWith("--csv="))?.slice(6) ||
  process.argv.find((arg) => arg.endsWith(".csv"));

const apply = process.argv.includes("--apply");

if (!csvPath) {
  console.error(`
Usage:
  npm exec tsx scripts/migrate-deliberations.ts -- candidates.csv [--apply]
  npm exec tsx scripts/migrate-deliberations.ts -- --csv=candidates.csv [--apply]

Options:
  --apply   Persist changes to Firestore (defaults to dry-run preview)
`);
  process.exit(1);
}

interface DeliberationCandidateRecord {
  name?: string;
  major?: string;
  gradYear?: string;
  image?: string;
  events: string[];
}

async function run() {
  const { headers, records } = await readCsvFile(csvPath!);

  if (records.length === 0) {
    console.log("No data found in the provided CSV file.");
    return;
  }

  const finder = createColumnFinder(headers);
  const getEmail = finder.matcher(["email", "e-mail", "mail"]);
  const getName = finder.matcher(["name", "candidate", "full name"]);
  const getMajor = finder.matcher(["major"]);
  const getGradYear = finder.matcher(["grad", "year", "graduation", "class"]);
  const getImage = finder.matcher(["photo", "image", "picture", "headshot", "drive", "file"]);
  const getEvent = finder.matcher(["event", "session", "night", "check-in", "checkin"]);

  const candidates = new Map<string, DeliberationCandidateRecord>();
  let skippedRows = 0;

  for (const record of records) {
    const rawEmail = getEmail(record);
    const email = normalizeEmail(rawEmail);

    if (!email) {
      skippedRows += 1;
      continue;
    }

    const rawName = cleanString(getName(record));
    const rawMajor = cleanString(getMajor(record));
    const rawGradYear = cleanString(getGradYear(record));
    const rawImage = extractDriveId(getImage(record));
    const event = cleanEventName(getEvent(record));

    const candidate = candidates.get(email) ?? {
      events: [],
    };

    // Only update fields if the incoming CSV row has a non-empty value, preserving existing values
    if (rawName && (!candidate.name || candidate.name.length < rawName.length)) {
      candidate.name = rawName;
    }
    if (rawMajor) {
      candidate.major = rawMajor;
    }
    if (rawGradYear) {
      candidate.gradYear = rawGradYear;
    }
    if (rawImage) {
      candidate.image = rawImage;
    }

    if (event && !candidate.events.includes(event)) {
      candidate.events.push(event);
    }

    candidates.set(email, candidate);
  }

  console.log(`\n📋 Processed ${records.length} CSV rows (${skippedRows} skipped without valid email).`);
  console.log(`Found ${candidates.size} unique candidate(s).\n`);

  const sortedCandidates = Array.from(candidates.entries()).sort((a, b) =>
    (a[1].name ?? "").localeCompare(b[1].name ?? ""),
  );

  sortedCandidates.forEach(([email, c], index) => {
    const eventsStr = c.events.length > 0 ? `Events: [${c.events.join(", ")}]` : "No events";
    const photoStr = c.image ? `Photo: ${c.image}` : "No photo";
    console.log(
      `  ${String(index + 1).padStart(3, " ")}. ${c.name || "Unknown"} <${email}> | Major: ${c.major || "N/A"} | Grad: ${c.gradYear || "N/A"} | ${photoStr} | ${eventsStr}`,
    );
  });

  // Strip empty/null properties so merging does NOT overwrite existing valued fields in Firestore
  const batchItems = sortedCandidates.map(([email, candidate]) => ({
    id: email,
    data: omitEmptyValues({
      name: candidate.name,
      major: candidate.major,
      gradYear: candidate.gradYear,
      image: candidate.image,
      events: candidate.events.length > 0 ? candidate.events : undefined,
    }),
  }));

  await writeBatchToFirestore({
    collection: "delibs",
    items: batchItems,
    apply,
    merge: true,
    omitEmptyFields: true,
  });
}

run().catch((error) => {
  console.error("Migration failed with error:", error);
  process.exit(1);
});
