import { describe, it, expect } from "vitest";
import type { EntityChangeDto } from "@/types/api.types";
import {
  normalizePropertyChanges,
  resolvePropertyChanges,
  shouldShowPropertyChangesSection,
} from "@/lib/audit-property-changes";

describe("audit-property-changes", () => {
  describe("normalizePropertyChanges", () => {
    it("normalizes camelCase and PascalCase property change rows", () => {
      const rows = normalizePropertyChanges([
        {
          Id: "pc-1",
          PropertyName: "Email",
          OriginalValue: "old@example.com",
          NewValue: "new@example.com",
        },
      ]);

      expect(rows).toEqual([
        {
          id: "pc-1",
          propertyName: "Email",
          originalValue: "old@example.com",
          newValue: "new@example.com",
        },
      ]);
    });

    it("returns empty array for invalid input", () => {
      expect(normalizePropertyChanges(null)).toEqual([]);
      expect(normalizePropertyChanges([{ invalid: true }])).toEqual([]);
    });

    it("stringifies object and number values in normalized rows", () => {
      const rows = normalizePropertyChanges([
        {
          propertyName: "meta",
          originalValue: { a: 1 },
          newValue: 42,
        },
      ]);
      expect(rows[0]?.originalValue).toBe(JSON.stringify({ a: 1 }));
      expect(rows[0]?.newValue).toBe("42");
    });
  });

  describe("resolvePropertyChanges", () => {
    it("derives property rows from created snapshots", () => {
      const change: EntityChangeDto = {
        id: "ec-1",
        entityName: "User",
        entityId: "1",
        changeType: "Created",
        originalValue: null,
        newValue: JSON.stringify({ email: "new@example.com", role: "Admin" }),
        createdAt: "2025-01-15T10:00:00Z",
        createdBy: "admin",
        updatedAt: "2025-01-15T10:00:00Z",
        updatedBy: null,
        propertyChanges: [],
      };

      const rows = resolvePropertyChanges(change);

      expect(rows).toHaveLength(2);
      expect(rows[0]).toMatchObject({
        propertyName: "email",
        originalValue: null,
        newValue: "new@example.com",
      });
    });

    it("derives changed fields from updated snapshots", () => {
      const change: EntityChangeDto = {
        id: "ec-2",
        entityName: "User",
        entityId: "1",
        changeType: "Updated",
        originalValue: JSON.stringify({ email: "old@example.com", role: "User" }),
        newValue: JSON.stringify({ email: "new@example.com", role: "User" }),
        createdAt: "2025-01-15T10:00:00Z",
        createdBy: "admin",
        updatedAt: "2025-01-15T10:00:00Z",
        updatedBy: null,
        propertyChanges: [],
      };

      const rows = resolvePropertyChanges(change);

      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({
        propertyName: "email",
        originalValue: "old@example.com",
        newValue: "new@example.com",
      });
    });

    it("prefers API propertyChanges when present", () => {
      const change: EntityChangeDto = {
        id: "ec-3",
        entityName: "User",
        entityId: "1",
        changeType: "Updated",
        originalValue: "{}",
        newValue: "{}",
        createdAt: "2025-01-15T10:00:00Z",
        createdBy: "admin",
        updatedAt: "2025-01-15T10:00:00Z",
        updatedBy: null,
        propertyChanges: [
          {
            id: "pc-1",
            propertyName: "Status",
            originalValue: "Active",
            newValue: "Inactive",
          },
        ],
      };

      expect(resolvePropertyChanges(change)).toEqual(change.propertyChanges);
    });

    it("derives property rows from deleted snapshots", () => {
      const change: EntityChangeDto = {
        id: "ec-deleted",
        entityName: "User",
        entityId: "1",
        changeType: "Deleted",
        originalValue: JSON.stringify({ email: "gone@example.com" }),
        newValue: null,
        createdAt: "2025-01-15T10:00:00Z",
        createdBy: "admin",
        updatedAt: "2025-01-15T10:00:00Z",
        updatedBy: null,
        propertyChanges: [],
      };

      const rows = resolvePropertyChanges(change);

      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({
        propertyName: "email",
        originalValue: "gone@example.com",
        newValue: null,
      });
    });

    it("handles Added and Removed change types for snapshot derivation", () => {
      const added: EntityChangeDto = {
        id: "ec-add",
        entityName: "Item",
        entityId: "1",
        changeType: "Added",
        originalValue: null,
        newValue: JSON.stringify({ name: "x" }),
        createdAt: "2025-01-15T10:00:00Z",
        createdBy: "admin",
        updatedAt: "2025-01-15T10:00:00Z",
        updatedBy: null,
        propertyChanges: [],
      };
      expect(resolvePropertyChanges(added).length).toBeGreaterThan(0);

      const removed: EntityChangeDto = {
        id: "ec-rem",
        entityName: "Item",
        entityId: "1",
        changeType: "Removed",
        originalValue: JSON.stringify({ name: "x" }),
        newValue: null,
        createdAt: "2025-01-15T10:00:00Z",
        createdBy: "admin",
        updatedAt: "2025-01-15T10:00:00Z",
        updatedBy: null,
        propertyChanges: [],
      };
      expect(resolvePropertyChanges(removed).length).toBeGreaterThan(0);
    });

    it("treats snapshot JSON arrays as unparsable for diffing", () => {
      const change: EntityChangeDto = {
        id: "ec-arr",
        entityName: "User",
        entityId: "1",
        changeType: "Updated",
        originalValue: "[1,2]",
        newValue: "[1,2,3]",
        createdAt: "2025-01-15T10:00:00Z",
        createdBy: "admin",
        updatedAt: "2025-01-15T10:00:00Z",
        updatedBy: null,
        propertyChanges: [],
      };
      expect(resolvePropertyChanges(change)).toEqual([]);
    });

    it("returns empty array when snapshots cannot be parsed", () => {
      const change: EntityChangeDto = {
        id: "ec-empty",
        entityName: "User",
        entityId: "1",
        changeType: "Updated",
        originalValue: "not-json",
        newValue: "also-not-json",
        createdAt: "2025-01-15T10:00:00Z",
        createdBy: "admin",
        updatedAt: "2025-01-15T10:00:00Z",
        updatedBy: null,
        propertyChanges: [],
      };

      expect(resolvePropertyChanges(change)).toEqual([]);
    });
  });

  describe("shouldShowPropertyChangesSection", () => {
    it("returns true for update-like change types even without rows", () => {
      const change: EntityChangeDto = {
        id: "ec-4",
        entityName: "User",
        entityId: "1",
        changeType: "Updated",
        originalValue: null,
        newValue: null,
        createdAt: "2025-01-15T10:00:00Z",
        createdBy: "admin",
        updatedAt: "2025-01-15T10:00:00Z",
        updatedBy: null,
        propertyChanges: [],
      };

      expect(shouldShowPropertyChangesSection(change, [])).toBe(true);
    });

    it("returns false for unrelated change types with no rows", () => {
      const change: EntityChangeDto = {
        id: "ec-5",
        entityName: "User",
        entityId: "1",
        changeType: "Archived",
        originalValue: null,
        newValue: null,
        createdAt: "2025-01-15T10:00:00Z",
        createdBy: "admin",
        updatedAt: "2025-01-15T10:00:00Z",
        updatedBy: null,
        propertyChanges: [],
      };

      expect(shouldShowPropertyChangesSection(change, [])).toBe(false);
    });

    it("returns true when rows exist regardless of change type", () => {
      const change: EntityChangeDto = {
        id: "ec-6",
        entityName: "User",
        entityId: "1",
        changeType: "Archived",
        originalValue: null,
        newValue: null,
        createdAt: "2025-01-15T10:00:00Z",
        createdBy: "admin",
        updatedAt: "2025-01-15T10:00:00Z",
        updatedBy: null,
        propertyChanges: [],
      };

      expect(
        shouldShowPropertyChangesSection(change, [
          {
            id: "pc-1",
            propertyName: "Status",
            originalValue: "A",
            newValue: "B",
          },
        ]),
      ).toBe(true);
    });
  });
});
