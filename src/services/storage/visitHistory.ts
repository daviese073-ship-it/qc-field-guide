import { z } from "zod";

import {
  localStorageService,
  type TypedStorage
} from "@/services/storage/browserStorage";

export const visitTargetKindSchema = z.enum(["section", "generalQcProcess"]);
export type VisitTargetKind = z.infer<typeof visitTargetKindSchema>;

export const visitHistoryRecordSchema = z.object({
  count: z.number().int().positive(),
  id: z.string().min(1),
  kind: visitTargetKindSchema,
  lastVisitedAt: z.number().int().nonnegative()
});

export type VisitHistoryRecord = z.infer<typeof visitHistoryRecordSchema>;

const visitHistorySchema = z.array(visitHistoryRecordSchema);
const visitHistoryStorageKey = "qc-field-guide:visit-history";

export function getVisitHistory(
  storage: TypedStorage = localStorageService
): readonly VisitHistoryRecord[] {
  return storage.get(visitHistoryStorageKey, visitHistorySchema) ?? [];
}

export function recordVisit(
  kind: VisitTargetKind,
  id: string,
  options: {
    now?: number;
    storage?: TypedStorage;
  } = {}
) {
  const storage = options.storage ?? localStorageService;
  const now = options.now ?? Date.now();
  const existing = getVisitHistory(storage);
  const key = getVisitKey(kind, id);
  const nextByKey = new Map(
    existing.map((record) => [getVisitKey(record.kind, record.id), record])
  );
  const previous = nextByKey.get(key);

  nextByKey.set(key, {
    count: previous ? previous.count + 1 : 1,
    id,
    kind,
    lastVisitedAt: now
  });

  const next = [...nextByKey.values()].sort(sortVisitRecords);
  storage.set(visitHistoryStorageKey, next);

  return next;
}

export function getTopVisited(
  kind: VisitTargetKind,
  limit = 5,
  storage: TypedStorage = localStorageService
) {
  return getVisitHistory(storage)
    .filter((record) => record.kind === kind)
    .sort(sortVisitRecords)
    .slice(0, limit);
}

export function clearVisitHistory(storage: TypedStorage = localStorageService) {
  return storage.remove(visitHistoryStorageKey);
}

function sortVisitRecords(left: VisitHistoryRecord, right: VisitHistoryRecord) {
  return (
    right.count - left.count ||
    right.lastVisitedAt - left.lastVisitedAt ||
    left.kind.localeCompare(right.kind) ||
    left.id.localeCompare(right.id, undefined, {
      numeric: true,
      sensitivity: "base"
    })
  );
}

function getVisitKey(kind: VisitTargetKind, id: string) {
  return `${kind}:${id}`;
}
