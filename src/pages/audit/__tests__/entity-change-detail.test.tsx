import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { EntityChangeDetailPage } from "../entity-change-detail";
import { auditEntityChangesService } from "@/api/services/audit-entity-changes.service";
import type { EntityChangeDto } from "@/types/api.types";

vi.mock("@/api/services/audit-entity-changes.service", () => ({
  auditEntityChangesService: {
    getEntityChangeById: vi.fn(),
  },
}));

const mockChange: EntityChangeDto = {
  id: "ec-1",
  entityName: "User",
  entityId: "550e8400-e29b-41d4-a716-446655440000",
  changeType: "Updated",
  originalValue: JSON.stringify({ email: "old@example.com", role: "User" }),
  newValue: JSON.stringify({ email: "new@example.com", role: "User" }),
  createdAt: "2025-01-15T10:00:00Z",
  createdBy: "admin",
  updatedAt: "2025-01-15T10:00:00Z",
  updatedBy: "admin",
  propertyChanges: [
    {
      id: "pc-1",
      propertyName: "Email",
      originalValue: "old@example.com",
      newValue: "new@example.com",
    },
  ],
};

function renderDetail(id = "ec-1") {
  return render(
    <MemoryRouter initialEntries={[`/audit/entity-changes/${id}`]}>
      <Routes>
        <Route
          path="/audit/entity-changes/:id"
          element={<EntityChangeDetailPage />}
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe("EntityChangeDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state", () => {
    vi.mocked(auditEntityChangesService.getEntityChangeById).mockImplementation(
      () => new Promise(() => {}),
    );

    renderDetail();

    expect(
      screen.getByRole("status", { name: "Loading audit entry" }),
    ).toBeInTheDocument();
  });

  it("renders audit entry details with property changes and snapshots", async () => {
    vi.mocked(auditEntityChangesService.getEntityChangeById).mockResolvedValue(
      mockChange,
    );

    renderDetail();

    await waitFor(() => {
      expect(screen.getByText("Audit entry")).toBeInTheDocument();
    });

    expect(screen.getByText("Summary")).toBeInTheDocument();
    expect(screen.getByText("Property changes")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("old@example.com")).toBeInTheDocument();
    expect(screen.getByText("new@example.com")).toBeInTheDocument();
    expect(screen.getByText("Entity snapshots")).toBeInTheDocument();
    expect(screen.getAllByText("Original value").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("New value").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("admin").length).toBeGreaterThanOrEqual(1);
  });

  it("shows empty property changes message when section is visible but rows are empty", async () => {
    vi.mocked(auditEntityChangesService.getEntityChangeById).mockResolvedValue({
      ...mockChange,
      propertyChanges: [],
      originalValue: null,
      newValue: null,
    });

    renderDetail();

    await waitFor(() => {
      expect(
        screen.getByText(
          "No individual property changes were recorded for this entry.",
        ),
      ).toBeInTheDocument();
    });
  });

  it("shows error state when fetch fails", async () => {
    vi.mocked(auditEntityChangesService.getEntityChangeById).mockRejectedValue(
      new Error("Not found"),
    );

    renderDetail();

    await waitFor(() => {
      expect(screen.getByText("Not found")).toBeInTheDocument();
    });

    expect(
      screen.getByRole("link", { name: /back to audit log/i }),
    ).toBeInTheDocument();
  });

  it("shows not found when service returns null-like failure", async () => {
    vi.mocked(auditEntityChangesService.getEntityChangeById).mockRejectedValue(
      "unknown",
    );

    renderDetail();

    await waitFor(() => {
      expect(
        screen.getByText("Failed to fetch audit entry"),
      ).toBeInTheDocument();
    });
  });
});
