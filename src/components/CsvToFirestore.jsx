import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import {
  getFirestore,
  doc,
  setDoc,
  writeBatch,
  collection,
  query,
  where,
  getDocs,
  documentId,
} from "firebase/firestore";

// Relative path to your CSV file in the public folder.
// Only .csv extension supported.
const CSV_FILE_PATH = "/test.csv";

// Zero-based column indices for each field in your CSV.
// Adjust these if your CSV layout changes.
const CSV_COLUMNS = {
  EMAIL: 2,
  FIRST_NAME: 3,
  LAST_NAME: 4,
  EVENT: 5,
  MAJOR: 9,
  GRAD_YEAR: 11,
  IMAGE: 13,
};

/**
 * Attempts to extract the Google Drive file ID from a URL.
 * Supports URLs with '/d/<ID>/' pattern or 'id=<ID>' query param.
 * Returns the ID string, or null if not found.
 */
function extractDriveId(url) {
  if (!url) return null;
  // 1) "/d/<ID>/" pattern
  const match = url.match(/\/d\/([^/]+)/);
  if (match && match[1]) {
    return match[1];
  }

  // 2) "id=<ID>" query parameter
  try {
    const parsed = new URL(url);
    const id = parsed.searchParams.get("id");
    if (id) {
      return id;
    }
  } catch (err) {
    console.warn("Invalid URL when extracting Drive ID:", url);
  }

  return null;
}

function isBlank(v) {
  return v == null || String(v).trim() === "";
}

// Merge helper that applies the "blank keeps original, different updates" rule
function mergeValue(existing, incoming) {
  // Arrays (e.g., events)
  if (Array.isArray(existing) || Array.isArray(incoming)) {
    const existingArr = Array.isArray(existing) ? existing : [];
    const incomingArr = Array.isArray(incoming)
      ? incoming.filter((x) => !isBlank(x))
      : [];

    if (incomingArr.length === 0) {
      // Keep original if it exists; else omit
      return existingArr.length === 0 ? undefined : existingArr;
    }

    // Compare shallow equality
    const sameLength = existingArr.length === incomingArr.length;
    const sameItems =
      sameLength && existingArr.every((v, i) => v === incomingArr[i]);
    return sameItems ? existingArr : incomingArr;
  }

  // Scalars (strings, numbers)
  const inc = isBlank(incoming) ? "" : String(incoming).trim();
  const ex = isBlank(existing) ? "" : String(existing).trim();

  if (inc === "") {
    return ex === "" ? undefined : ex; // keep original if present, else omit
  }

  return inc === ex ? ex : inc; // update if different
}

const CsvToFirestore = () => {
  const [csvData, setCsvData] = useState({});

  function chunk(arr, size) {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  }

  useEffect(() => {
    const db = getFirestore();

    const fetchCsv = async () => {
      try {
        const response = await fetch(CSV_FILE_PATH);
        if (!response.ok) {
          throw new Error(`Failed to fetch CSV at ${CSV_FILE_PATH}`);
        }
        const csvText = await response.text();

        Papa.parse(csvText, {
          header: false,
          skipEmptyLines: true,
          worker: true, // offload parsing to a web worker
          complete: async ({ data }) => {
            const rows = data.slice(1);
            const result = {};

            rows.forEach((row) => {
              const email = row[CSV_COLUMNS.EMAIL]?.trim().toLowerCase();
              if (isBlank(email)) return; // skip rows without email

              const first = row[CSV_COLUMNS.FIRST_NAME] ?? "";
              const last = row[CSV_COLUMNS.LAST_NAME] ?? "";
              const fullName = `${first} ${last}`.trim();
              const event = row[CSV_COLUMNS.EVENT] ?? "";
              const major = row[CSV_COLUMNS.MAJOR] ?? "";
              const gradYear = row[CSV_COLUMNS.GRAD_YEAR] ?? "";
              const rawImage = row[CSV_COLUMNS.IMAGE] ?? "";

              // Extract Drive file ID if present; fall back to raw string
              const imageFileId = extractDriveId(rawImage);
              const image = imageFileId || rawImage?.trim() || "";

              if (!result[email]) {
                result[email] = {
                  name: fullName,
                  events: isBlank(event) ? [] : [String(event).trim()],
                  major,
                  gradYear,
                  image,
                };
              } else {
                if (!isBlank(event))
                  result[email].events.push(String(event).trim());
                if (!isBlank(image)) result[email].image = image;
                if (!isBlank(fullName)) result[email].name = fullName;
                if (!isBlank(major)) result[email].major = String(major).trim();
                if (!isBlank(gradYear))
                  result[email].gradYear = String(gradYear).trim();
              }
            });

            setCsvData(result);
            console.log("Parsed CSV Data:", result);

            // ==== OPTIMIZED READS: bulk-fetch existing docs in chunks using documentId() IN queries (limit 30) ====
            const emails = Object.keys(result);
            const emailChunks = chunk(emails, 30); // Firestore IN limit is 30 values
            const existingMap = new Map();

            for (const group of emailChunks) {
              const q = query(
                collection(db, "delibs"),
                where(documentId(), "in", group)
              );
              const snap = await getDocs(q);
              snap.forEach((d) => existingMap.set(d.id, d.data()));
            }

            // ==== OPTIMIZED WRITES: batch writes (limit 500 ops per batch) ====
            const writeChunks = chunk(emails, 450); // keep under limit comfortably
            for (const group of writeChunks) {
              const batch = writeBatch(db);

              for (const email of group) {
                const data = result[email];
                const existing = existingMap.get(email) || {};

                const mergedName = mergeValue(existing?.name, data.name);
                const mergedEvents = mergeValue(existing?.events, data.events);
                const mergedMajor = mergeValue(existing?.major, data.major);
                const mergedGrad = mergeValue(
                  existing?.gradYear,
                  data.gradYear
                );
                const mergedImage = mergeValue(existing?.image, data.image);

                const payload = {};
                if (mergedName !== undefined) payload.name = mergedName;
                if (mergedEvents !== undefined) payload.events = mergedEvents;
                if (mergedMajor !== undefined) payload.major = mergedMajor;
                if (mergedGrad !== undefined) payload.gradYear = mergedGrad;
                if (mergedImage !== undefined) payload.image = mergedImage;

                batch.set(doc(db, "delibs", email), payload, { merge: true });
              }

              await batch.commit();
              console.log(`✔️ Committed batch for ${group.length} docs`);
            }
          },
        });
      } catch (error) {
        console.error("❗ Error loading or parsing CSV:", error);
      }
    };

    fetchCsv();
  }, []);

  return null;
};

export default CsvToFirestore;
