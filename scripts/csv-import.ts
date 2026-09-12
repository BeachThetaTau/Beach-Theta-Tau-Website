import { readCsvFile } from "./lib/csv.js";
import { writeBatchToFirestore } from "./lib/firestore-writer.js";
import { cleanString, omitEmptyValues } from "./lib/transformers.js";

function getArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : undefined;
}

const csvPath = getArg("csv") || getArg("file") || process.argv.find((arg) => arg.endsWith(".csv"));
const collectionName = getArg("collection") || getArg("col");
const idColumn = getArg("id") || getArg("key") || "id";
const apply = process.argv.includes("--apply");
const keepEmpty = process.argv.includes("--keep-empty");

if (!csvPath || !collectionName) {
  console.error(`
Usage:
  npm exec tsx scripts/csv-import.ts -- --csv=<path-to-csv> --collection=<firestore-collection> [--id=<id-column>] [--apply]

Examples:
  # Dry-run candidate import
  npm exec tsx scripts/csv-import.ts -- --csv=candidates.csv --collection=delibs --id=email

  # Commit users to Firestore (merging without overwriting existing fields with empty values)
  npm exec tsx scripts/csv-import.ts -- --csv=users.csv --collection=users --id=uid --apply

Options:
  --csv, --file        Path to the CSV file to read
  --collection, --col  Target Firestore collection name
  --id, --key          CSV column name to use as Firestore Document ID (defaults to 'id')
  --keep-empty         If set, empty CSV cells will overwrite existing fields with empty strings
  --apply              Persist changes to Firestore (default is dry-run preview)
`);
  process.exit(1);
}

async function run() {
  const { headers, records } = await readCsvFile(csvPath!);

  if (records.length === 0) {
    console.log("No data found in the CSV file.");
    return;
  }

  const normalizedIdKey = idColumn.trim().toLowerCase();
  const idHeader = headers.find((h) => h.trim().toLowerCase() === normalizedIdKey) ?? headers[0]!;

  console.log(`\n📂 Reading '${csvPath}'`);
  console.log(`📊 Headers detected: ${headers.join(", ")}`);
  console.log(`🔑 Using column '${idHeader}' as Document ID`);
  console.log(`🎯 Target Collection: '${collectionName}'`);
  console.log(`🛡️  Empty field protection: ${keepEmpty ? "Disabled (blanks overwrite)" : "Enabled (blanks will not overwrite)"}\n`);

  // Map to aggregate multi-row entries by ID
  const aggregatedData = new Map<string, Record<string, unknown>>();
  let skipped = 0;

  for (const record of records) {
    const rawId = record[normalizedIdKey] ?? record[idHeader.toLowerCase()];
    const docId = cleanString(rawId);

    if (!docId) {
      skipped += 1;
      continue;
    }

    const existing = aggregatedData.get(docId) ?? {};

    for (const [key, value] of Object.entries(record)) {
      const cleaned = cleanString(value);
      // If we are not keeping empty, only set field if value is non-empty or not yet defined
      if (cleaned || keepEmpty || !(key in existing)) {
        if (cleaned || keepEmpty) {
          existing[key] = cleaned;
        }
      }
    }

    aggregatedData.set(docId, existing);
  }

  const items = Array.from(aggregatedData.entries()).map(([id, data]) => ({
    id,
    data: keepEmpty ? data : omitEmptyValues(data),
  }));

  console.log(`Processed ${records.length} rows (${skipped} skipped with empty ID).`);
  console.log(`Prepared ${items.length} unique document(s) for write.\n`);

  if (items.length > 0) {
    console.log("Sample document payload (first item):");
    console.log(JSON.stringify(items[0], null, 2));
  }

  await writeBatchToFirestore({
    collection: collectionName!,
    items,
    apply,
    merge: true,
    omitEmptyFields: !keepEmpty,
  });
}

run().catch((error) => {
  console.error("CSV import failed:", error);
  process.exit(1);
});
