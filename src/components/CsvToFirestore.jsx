import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import { getFirestore, doc, setDoc } from "firebase/firestore";

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
  MAJOR: 8,
  GRAD_YEAR: 10,
  IMAGE: 12,
};

/**
 * Attempts to extract the Google Drive file ID from a URL.
 * Supports URLs with '/d/<ID>/' pattern or 'id=<ID>' query param.
 * Returns the ID string, or null if not found.
 */
function extractDriveId(url) {
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

/**
 * CsvToFirestore
 *
 * A non-visual React component that:
 *  1. Fetches a CSV from `CSV_FILE_PATH`
 *  2. Parses rows using PapaParse
 *  3. Aggregates events by email address
 *  4. Extracts Drive file IDs from image URLs
 *  5. Writes each record into Firestore (`delibs` collection),
 *     merging with any existing document for that email.
 *
 * State:
 *  - csvData: an object mapping email → record data
 *
 * Side effects:
 *  - Console logs parsing and Firestore operations.
 *  - Uses `merge: true` so existing Firestore docs aren’t overwritten.
 */
const CsvToFirestore = () => {
  const [csvData, setCsvData] = useState({});

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
          complete: async ({ data }) => {
            const rows = data.slice(1);
            const result = {};

            rows.forEach(row => {
              const email = row[CSV_COLUMNS.EMAIL];
              const fullName = `${row[CSV_COLUMNS.FIRST_NAME]} ${row[CSV_COLUMNS.LAST_NAME]}`;
              const event = row[CSV_COLUMNS.EVENT];
              const major = row[CSV_COLUMNS.MAJOR];
              const gradYear = row[CSV_COLUMNS.GRAD_YEAR];
              const rawImage = row[CSV_COLUMNS.IMAGE];

              // Extract Drive file ID if present
              const imageFileId = extractDriveId(rawImage);
              const image = imageFileId || rawImage;

              if (!result[email]) {
                result[email] = {
                  name: fullName,
                  events: [event],
                  major,
                  gradYear,
                  image,
                };
              } else {
                result[email].events.push(event);
              }
            });

            setCsvData(result);
            console.log("Parsed CSV Data:", result);

            await Promise.all(
              Object.entries(result).map(async ([email, data]) => {
                const docRef = doc(db, "delibs", email);
                try {
                  await setDoc(
                    docRef,
                    {
                      name: data.name,
                      events: data.events,
                      major: data.major,
                      gradYear: data.gradYear,
                      image: data.image,
                    },
                    { merge: true }
                  );
                  console.log(`✔️ Wrote Firestore doc for ${email}`);
                } catch (err) {
                  console.error(`❌ Error writing Firestore doc for ${email}:`, err);
                }
              })
            );
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
