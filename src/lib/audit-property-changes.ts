import type { EntityChangeDto, PropertyChangeDto } from "@/types/api.types";

type JsonRecord = Record<string, unknown>;

function readString(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

function tryParseJsonObject(
  value: string | null | undefined,
): JsonRecord | null {
  if (value == null || value.trim() === "") {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(value.trim());
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as JsonRecord;
    }
  } catch {
    return null;
  }
  return null;
}

function valuesEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function normalizePropertyChange(
  raw: unknown,
  index: number,
): PropertyChangeDto | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const row = raw as Record<string, unknown>;
  const propertyName = readString(row["propertyName"] ?? row["PropertyName"]);
  if (!propertyName) {
    return null;
  }
  const id = readString(row["id"] ?? row["Id"]) ?? `property-${index}`;
  return {
    id,
    propertyName,
    originalValue: readString(row["originalValue"] ?? row["OriginalValue"]),
    newValue: readString(row["newValue"] ?? row["NewValue"]),
  };
}

export function normalizePropertyChanges(raw: unknown): PropertyChangeDto[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw
    .map((item, index) => normalizePropertyChange(item, index))
    .filter((item): item is PropertyChangeDto => item != null);
}

function isCreatedChangeType(changeType: string): boolean {
  const t = changeType.toLowerCase();
  return t.includes("creat") || t.includes("add");
}

function isDeletedChangeType(changeType: string): boolean {
  const t = changeType.toLowerCase();
  return t.includes("delet") || t.includes("remov");
}

function deriveFromSnapshots(change: EntityChangeDto): PropertyChangeDto[] {
  const original = tryParseJsonObject(change.originalValue);
  const updated = tryParseJsonObject(change.newValue);

  if (isCreatedChangeType(change.changeType) && updated) {
    return Object.entries(updated).map(([propertyName, value], index) => ({
      id: `derived-${index}-${propertyName}`,
      propertyName,
      originalValue: null,
      newValue: readString(value),
    }));
  }

  if (isDeletedChangeType(change.changeType) && original) {
    return Object.entries(original).map(([propertyName, value], index) => ({
      id: `derived-${index}-${propertyName}`,
      propertyName,
      originalValue: readString(value),
      newValue: null,
    }));
  }

  if (!original || !updated) {
    return [];
  }

  const keys = new Set([...Object.keys(original), ...Object.keys(updated)]);
  const changes: PropertyChangeDto[] = [];
  let index = 0;

  for (const propertyName of keys) {
    const originalValue = original[propertyName];
    const newValue = updated[propertyName];
    if (!valuesEqual(originalValue, newValue)) {
      changes.push({
        id: `derived-${index}-${propertyName}`,
        propertyName,
        originalValue:
          originalValue === undefined ? null : readString(originalValue),
        newValue: newValue === undefined ? null : readString(newValue),
      });
      index += 1;
    }
  }

  return changes;
}

/** Uses API propertyChanges when present; otherwise derives rows from entity snapshots. */
export function resolvePropertyChanges(
  change: EntityChangeDto,
): PropertyChangeDto[] {
  const fromApi = normalizePropertyChanges(change.propertyChanges);
  if (fromApi.length > 0) {
    return fromApi;
  }
  return deriveFromSnapshots(change);
}

export function shouldShowPropertyChangesSection(
  change: EntityChangeDto,
  rows: PropertyChangeDto[],
): boolean {
  if (rows.length > 0) {
    return true;
  }
  const t = change.changeType.toLowerCase();
  return (
    t.includes("creat") ||
    t.includes("add") ||
    t.includes("delet") ||
    t.includes("remov") ||
    t.includes("updat") ||
    t.includes("modif")
  );
}
