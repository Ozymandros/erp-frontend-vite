import type React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { getResourceColumns } from "../resources.columns";
import type { ResourceDto } from "@/types/api.types";

const resource: ResourceDto = {
  id: "res-1",
  resourceNo: "R001",
  name: "Consultant",
  type: "Person",
  baseUnitOfMeasure: "HOUR",
  unitCost: 50,
  unitPrice: 100,
  dailyCapacity: 8,
  blocked: false,
  createdAt: "2024-01-01T00:00:00Z",
  createdBy: "system",
};

function renderActions(
  props: { canEdit?: boolean; canDelete?: boolean }
) {
  const onEdit = vi.fn();
  const onDelete = vi.fn();
  const cols = getResourceColumns({
    onEdit,
    onDelete,
    canEdit: props.canEdit,
    canDelete: props.canDelete,
  });
  const actionsCol = cols[4];
  const cell = actionsCol.accessor as (r: ResourceDto) => React.ReactNode;
  return { ...render(<MemoryRouter>{cell(resource)}</MemoryRouter>), onEdit, onDelete };
}

describe("getResourceColumns", () => {
  it("renders edit and delete when allowed", () => {
    const { onEdit, onDelete } = renderActions({ canEdit: true, canDelete: true });
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(3);
    buttons[1].click();
    buttons[2].click();
    expect(onEdit).toHaveBeenCalledWith(resource);
    expect(onDelete).toHaveBeenCalledWith(resource);
  });

  it("hides edit and delete when not allowed", () => {
    renderActions({ canEdit: false, canDelete: false });
    expect(screen.getAllByRole("button").length).toBe(1);
  });
});
