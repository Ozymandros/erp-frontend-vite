import { describe, it, expect } from "vitest";
import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { EntityChangeDto } from "@/types/api.types";
import {
  getChangeTypeBadgeVariant,
  getEntityChangeColumns,
  truncateEntityId,
} from "../entity-changes.columns";

describe("entity-changes.columns", () => {
  describe("truncateEntityId", () => {
    it("returns full id when length is 12 or less", () => {
      expect(truncateEntityId("short-id")).toBe("short-id");
      expect(truncateEntityId("123456789012")).toBe("123456789012");
    });

    it("truncates long ids", () => {
      expect(truncateEntityId("550e8400-e29b-41d4-a716-446655440000")).toBe(
        "550e8400…",
      );
    });
  });

  describe("getChangeTypeBadgeVariant", () => {
    it("maps change types to badge variants", () => {
      expect(getChangeTypeBadgeVariant("Created")).toBe("default");
      expect(getChangeTypeBadgeVariant("Added")).toBe("default");
      expect(getChangeTypeBadgeVariant("Deleted")).toBe("destructive");
      expect(getChangeTypeBadgeVariant("Removed")).toBe("destructive");
      expect(getChangeTypeBadgeVariant("Updated")).toBe("secondary");
      expect(getChangeTypeBadgeVariant("Modified")).toBe("secondary");
      expect(getChangeTypeBadgeVariant("Unknown")).toBe("outline");
    });
  });

  describe("getEntityChangeColumns", () => {
    const sampleRow: EntityChangeDto = {
      id: "ec-1",
      entityName: "User",
      entityId: "550e8400-e29b-41d4-a716-446655440000",
      changeType: "Updated",
      originalValue: null,
      newValue: null,
      createdAt: "2025-01-15T10:00:00Z",
      createdBy: "admin",
      updatedAt: "2025-01-15T10:00:00Z",
      updatedBy: null,
      propertyChanges: [],
    };

    it("renders entity, change type, and action links", () => {
      const columns = getEntityChangeColumns();

      render(
        <MemoryRouter>
          <>
            {columns.map((column) => {
              const content =
                typeof column.accessor === "function"
                  ? column.accessor(sampleRow)
                  : sampleRow[column.accessor];
              const key =
                typeof column.header === "string"
                  ? column.header
                  : column.sortField ?? "col";
              return <div key={key}>{content as ReactNode}</div>;
            })}
          </>
        </MemoryRouter>,
      );

      expect(screen.getByText("User")).toBeInTheDocument();
      expect(screen.getAllByText("Updated").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("admin")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "View" })).toHaveAttribute(
        "href",
        "/audit/entity-changes/ec-1",
      );
    });
  });
});
