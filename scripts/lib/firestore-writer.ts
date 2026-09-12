import type { Firestore } from "firebase-admin/firestore";
import { adminDb } from "../_firebase-admin.js";
import { omitEmptyValues } from "./transformers.js";

export interface BatchItem<T = Record<string, unknown>> {
  id: string;
  data: T;
}

export interface BatchWriteOptions<T = Record<string, unknown>> {
  /** Target Firestore collection path (e.g., 'delibs', 'users', 'alumni') */
  collection: string;
  /** Array of items containing doc ID and data object */
  items: BatchItem<T>[];
  /** Whether to merge with existing document fields (default: true) */
  merge?: boolean;
  /**
   * If true (default), strips null, undefined, and empty string fields before writing with merge.
   * This guarantees that blank or null incoming values will NOT overwrite existing values in Firestore.
   */
  omitEmptyFields?: boolean;
  /** If false, performs a dry run without committing writes (default: false) */
  apply?: boolean;
  /** Max write operations per batch chunk (Firestore max is 500, default: 400) */
  batchSize?: number;
  /** Optional custom Firestore instance (defaults to adminDb) */
  db?: Firestore;
  /** Optional custom logger (defaults to console.log) */
  logger?: (msg: string) => void;
}

export interface BatchWriteResult {
  totalItems: number;
  applied: boolean;
  batchCount: number;
  writtenCount: number;
}

/**
 * Writes documents in safe batches to Firestore with dry-run support, merge safety, and progress logging.
 */
export async function writeBatchToFirestore<T = Record<string, unknown>>({
  collection,
  items,
  merge = true,
  omitEmptyFields = true,
  apply = false,
  batchSize = 400,
  db = adminDb,
  logger = console.log,
}: BatchWriteOptions<T>): Promise<BatchWriteResult> {
  const safeBatchSize = Math.min(Math.max(1, batchSize), 450);
  const totalItems = items.length;
  const numBatches = Math.ceil(totalItems / safeBatchSize) || 1;

  logger(
    `\n📦 ${apply ? "Writing" : "Simulating write of"} ${totalItems} document(s) to collection '${collection}' across ${numBatches} batch(es)...`,
  );

  if (!apply) {
    logger(`\n🔎 [DRY RUN] No writes committed. Pass --apply to persist changes.`);
    return {
      totalItems,
      applied: false,
      batchCount: numBatches,
      writtenCount: 0,
    };
  }

  let writtenCount = 0;
  let batchIndex = 0;

  for (let i = 0; i < totalItems; i += safeBatchSize) {
    batchIndex += 1;
    const chunk = items.slice(i, i + safeBatchSize);
    const batch = db.batch();

    for (const item of chunk) {
      const docRef = db.collection(collection).doc(item.id);
      const payload = omitEmptyFields
        ? (omitEmptyValues(item.data as Record<string, unknown>) as FirebaseFirestore.WithFieldValue<FirebaseFirestore.DocumentData>)
        : (item.data as FirebaseFirestore.WithFieldValue<FirebaseFirestore.DocumentData>);

      batch.set(docRef, payload, { merge });
    }

    await batch.commit();
    writtenCount += chunk.length;
    logger(`  ✓ Committed batch ${batchIndex}/${numBatches} (${writtenCount}/${totalItems} documents)`);
  }

  logger(`\n✨ Successfully committed ${writtenCount} document(s) to '${collection}'.\n`);
  return {
    totalItems,
    applied: true,
    batchCount: numBatches,
    writtenCount,
  };
}
