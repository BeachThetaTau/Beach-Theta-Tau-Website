import { readFile } from "node:fs/promises";
import path from "node:path";

export interface CsvParseOptions {
  /** Delimiter character, default is comma */
  delimiter?: string;
  /** Whether to trim whitespace from field values, default is true */
  trim?: boolean;
  /** Whether to skip rows that contain only empty/whitespace fields, default is true */
  skipEmptyRows?: boolean;
}

export interface CsvRecordOptions extends CsvParseOptions {
  /** Function to normalize header keys, e.g. lowercasing. Defaults to lowercase + trim */
  normalizeHeader?: (header: string) => string;
}

/**
 * Standard RFC 4180 compliant CSV parser.
 * Handles quoted fields, multiline cells, escaped quotes (""), and varied line breaks (\r, \n, \r\n).
 */
export function parseCsv(text: string, options: CsvParseOptions = {}): string[][] {
  const { delimiter = ",", trim = true, skipEmptyRows = true } = options;
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]!;
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        field += '"';
        i += 1; // Skip the escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      row.push(trim ? field.trim() : field);
      field = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i += 1; // Handle CRLF
      }
      row.push(trim ? field.trim() : field);
      if (!skipEmptyRows || row.some((val) => val.trim().length > 0)) {
        rows.push(row);
      }
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  // Push final field & row if present
  row.push(trim ? field.trim() : field);
  if (!skipEmptyRows || row.some((val) => val.trim().length > 0)) {
    rows.push(row);
  }

  return rows;
}

/**
 * Parses CSV text into an array of objects keyed by header names.
 */
export function parseCsvToRecords<T = Record<string, string>>(
  text: string,
  options: CsvRecordOptions = {},
): T[] {
  const normalize =
    options.normalizeHeader ?? ((h: string) => h.trim().toLowerCase());
  const rawRows = parseCsv(text, options);

  if (rawRows.length === 0) return [];

  const rawHeaders = rawRows[0] ?? [];
  const headers = rawHeaders.map(normalize);
  const dataRows = rawRows.slice(1);

  return dataRows.map((row) => {
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      if (header) {
        record[header] = row[index] ?? "";
      }
    });
    return record as T;
  });
}

/**
 * Reads and parses a CSV file from disk into records.
 */
export async function readCsvFile<T = Record<string, string>>(
  filePath: string,
  options: CsvRecordOptions = {},
): Promise<{ headers: string[]; records: T[] }> {
  const fullPath = path.resolve(filePath);
  const content = await readFile(fullPath, "utf8");
  const rawRows = parseCsv(content, options);

  if (rawRows.length === 0) {
    return { headers: [], records: [] };
  }

  const rawHeaders = rawRows[0] ?? [];
  const records = parseCsvToRecords<T>(content, options);

  return {
    headers: rawHeaders,
    records,
  };
}

/**
 * Helper to build flexible column extractors that find matching keys by aliases/keywords.
 */
export function createColumnFinder(headers: string[]) {
  const normalizedHeaders = headers.map((h) => ({
    original: h,
    normalized: h.trim().toLowerCase(),
  }));

  return {
    /**
     * Finds the first header matching any of the candidate keywords (case-insensitive substring match or exact).
     */
    findKey: (candidates: string[]): string | undefined => {
      const match = normalizedHeaders.find(({ normalized }) =>
        candidates.some((c) => normalized.includes(c.toLowerCase())),
      );
      return match?.original;
    },

    /**
     * Returns a getter function for extracting the value from a raw record.
     */
    matcher: (candidates: string[], fallback = ""): ((record: Record<string, string>) => string) => {
      const match = normalizedHeaders.find(({ normalized }) =>
        candidates.some((c) => normalized.includes(c.toLowerCase())),
      );

      if (!match) return () => fallback;

      const key = match.normalized;
      return (record: Record<string, string>) => record[key] ?? record[match.original] ?? fallback;
    },
  };
}
