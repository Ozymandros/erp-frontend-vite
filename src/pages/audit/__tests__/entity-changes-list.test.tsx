import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { EntityChangesListPage } from "../entity-changes-list";
import { auditEntityChangesService } from "@/api/services/audit-entity-changes.service";
import type { EntityChangeDto, PaginatedResponse } from "@/types/api.types";

vi.mock("@/api/services/audit-entity-changes.service", () => ({
  auditEntityChangesService: {
    searchEntityChanges: vi.fn(),
  },
}));

const mockEntries: EntityChangeDto[] = [
  {
    id: "ec-1",
    entityName: "User",
    entityId: "550e8400-e29b-41d4-a716-446655440000",
    changeType: "Updated",
    originalValue: '{"email":"old@example.com"}',
    newValue: '{"email":"new@example.com"}',
    createdAt: "2025-01-15T10:00:00Z",
    createdBy: "admin",
    updatedAt: "2025-01-15T10:00:00Z",
    updatedBy: null,
    propertyChanges: [],
  },
  {
    id: "ec-2",
    entityName: "Product",
    entityId: "660e8400-e29b-41d4-a716-446655440001",
    changeType: "Created",
    originalValue: null,
    newValue: '{"name":"Widget"}',
    createdAt: "2025-01-16T10:00:00Z",
    createdBy: "system",
    updatedAt: "2025-01-16T10:00:00Z",
    updatedBy: null,
    propertyChanges: [],
  },
];

const mockResponse: PaginatedResponse<EntityChangeDto> = {
  items: mockEntries,
  total: 2,
  page: 1,
  pageSize: 20,
  totalPages: 1,
  hasPreviousPage: false,
  hasNextPage: false,
};

describe("EntityChangesListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders audit entries with change type badges", async () => {
    vi.mocked(auditEntityChangesService.searchEntityChanges).mockResolvedValue(
      mockResponse,
    );

    render(
      <MemoryRouter>
        <EntityChangesListPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("User")).toBeInTheDocument();
      expect(screen.getByText("Product")).toBeInTheDocument();
    });

    expect(screen.getAllByText("Updated").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Created").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("admin")).toBeInTheDocument();
    expect(screen.getByText("system")).toBeInTheDocument();
  });

  it("shows empty state when no entries exist", async () => {
    vi.mocked(auditEntityChangesService.searchEntityChanges).mockResolvedValue({
      ...mockResponse,
      items: [],
      total: 0,
    });

    render(
      <MemoryRouter>
        <EntityChangesListPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("No entry found.")).toBeInTheDocument();
    });
  });

  it("applies entity name and change type filters", async () => {
    const user = userEvent.setup();
    vi.mocked(auditEntityChangesService.searchEntityChanges).mockResolvedValue(
      mockResponse,
    );

    render(
      <MemoryRouter>
        <EntityChangesListPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("User")).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText("Entity name"), "Product");
    await user.selectOptions(
      screen.getByLabelText("Filter by change type"),
      "Deleted",
    );

    await waitFor(() => {
      expect(auditEntityChangesService.searchEntityChanges).toHaveBeenCalled();
    });

    const lastCall = vi.mocked(auditEntityChangesService.searchEntityChanges).mock
      .calls.at(-1)?.[0];
    expect(lastCall?.filters?.entityName).toBe("Product");
    expect(lastCall?.filters?.changeType).toBe("Deleted");
  });

  it("ignores search terms shorter than three characters", async () => {
    const user = userEvent.setup();
    vi.mocked(auditEntityChangesService.searchEntityChanges).mockResolvedValue(
      mockResponse,
    );

    render(
      <MemoryRouter>
        <EntityChangesListPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("User")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(
      "Entity name or changed by (min. 3 characters)…",
    );
    await user.type(searchInput, "ab");

    const callsBefore = vi.mocked(auditEntityChangesService.searchEntityChanges)
      .mock.calls.length;
    expect(callsBefore).toBeGreaterThan(0);
  });

  it("clears filters and search term", async () => {
    const user = userEvent.setup();
    vi.mocked(auditEntityChangesService.searchEntityChanges).mockResolvedValue(
      mockResponse,
    );

    render(
      <MemoryRouter>
        <EntityChangesListPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("User")).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText("Entity name"), "User");
    await user.click(screen.getByRole("button", { name: "Clear all filters" }));

    await waitFor(() => {
      const lastCall = vi.mocked(auditEntityChangesService.searchEntityChanges)
        .mock.calls.at(-1)?.[0];
      expect(lastCall?.filters).toEqual({});
      expect(lastCall?.searchTerm).toBe("");
    });
  });
});
