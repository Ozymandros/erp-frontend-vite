import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ProjectsListPage } from "../projects-list";
import { projectsService } from "@/api/services/projects.service";
import type { PaginatedResponse, ProjectDto } from "@/types/api.types";

vi.mock("@/api/services/projects.service", () => ({
  projectsService: {
    searchProjects: vi.fn(),
    exportToXlsx: vi.fn(),
    exportToPdf: vi.fn(),
  },
}));

vi.mock("@/hooks/use-permissions", () => ({
  useModulePermissions: vi.fn(() => ({
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    canExport: true,
  })),
}));

const mockProjects: ProjectDto[] = [
  {
    id: "proj-1",
    projectNumber: "PRJ-001",
    description: "Test Project",
    customerId: "cust-1",
    status: "Open",
    blocked: "None",
    currencyCode: "EUR",
    createdAt: "2024-01-01T00:00:00Z",
    createdBy: "system",
  },
];

const mockResponse: PaginatedResponse<ProjectDto> = {
  items: mockProjects,
  total: 1,
  page: 1,
  pageSize: 10,
  totalPages: 1,
  hasPreviousPage: false,
  hasNextPage: false,
};

describe("ProjectsListPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders projects", async () => {
    vi.mocked(projectsService.searchProjects).mockResolvedValue(mockResponse);

    render(
      <MemoryRouter>
        <ProjectsListPage />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "Projects" })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Test Project/i)).toBeInTheDocument();
    });
  });
});
