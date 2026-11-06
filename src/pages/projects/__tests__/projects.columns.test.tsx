import type React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { getProjectColumns } from "../projects.columns";
import type { ProjectDto } from "@/types/api.types";

const baseProject: ProjectDto = {
  id: "proj-1",
  projectNumber: "PRJ-001",
  description: "Alpha",
  customerId: "cust-1",
  status: "Open",
  blocked: "None",
  currencyCode: "EUR",
  createdAt: "2024-03-01T10:00:00Z",
  createdBy: "u1",
};

function renderColumn(
  columnIndex: number,
  project: ProjectDto,
  props: { onEdit?: (p: ProjectDto) => void; onDelete?: (p: ProjectDto) => void; canEdit?: boolean; canDelete?: boolean }
) {
  const cols = getProjectColumns({
    onEdit: props.onEdit ?? vi.fn(),
    onDelete: props.onDelete ?? vi.fn(),
    canEdit: props.canEdit,
    canDelete: props.canDelete,
  });
  const cell = cols[columnIndex].accessor as (p: ProjectDto) => React.ReactNode;
  return render(<MemoryRouter>{cell(project)}</MemoryRouter>);
}

describe("getProjectColumns", () => {
  it("renders created date or dash when missing", () => {
    const withDate = { ...baseProject, createdAt: "2024-03-01T10:00:00Z" };
    renderColumn(4, withDate, {});
    expect(screen.getByText(/2024|Mar|01/i)).toBeInTheDocument();

    const withoutDate = { ...baseProject, createdAt: undefined };
    renderColumn(4, withoutDate, {});
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("shows edit and delete buttons when allowed", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    renderColumn(5, baseProject, { onEdit, onDelete, canEdit: true, canDelete: true });
    screen.getByLabelText("Edit project").click();
    screen.getByLabelText("Delete project").click();
    expect(onEdit).toHaveBeenCalledWith(baseProject);
    expect(onDelete).toHaveBeenCalledWith(baseProject);
  });

  it("hides edit and delete when not allowed", () => {
    renderColumn(5, baseProject, {
      canEdit: false,
      canDelete: false,
    });
    expect(screen.queryByLabelText("Edit project")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Delete project")).not.toBeInTheDocument();
  });
});
