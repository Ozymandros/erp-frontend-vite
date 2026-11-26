import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ProjectDetailPage } from "../project-detail";
import { projectsService } from "@/api/services/projects.service";
import { projectTasksService } from "@/api/services/project-tasks.service";
import { projectPlanningLinesService } from "@/api/services/project-planning-lines.service";
import { projectPostingService } from "@/api/services/project-posting.service";

vi.mock("@/api/services/projects.service", () => ({
  projectsService: {
    getProjectById: vi.fn(),
    getProjectStatistics: vi.fn(),
  },
}));

vi.mock("@/api/services/project-tasks.service", () => ({
  projectTasksService: {
    getTaskTree: vi.fn(),
    getTasks: vi.fn(),
  },
}));

vi.mock("@/api/services/project-planning-lines.service", () => ({
  projectPlanningLinesService: {
    getPlanningLines: vi.fn(),
  },
}));

vi.mock("@/api/services/project-posting.service", () => ({
  projectPostingService: {
    getLedgerEntries: vi.fn(),
    getItemConsumptionOrders: vi.fn(),
    getInvoiceRequests: vi.fn(),
  },
}));

vi.mock("@/hooks/use-permissions", () => ({
  useModulePermissions: vi.fn(() => ({
    canUpdate: true,
    canDelete: true,
    canExecute: true,
    canCreate: true,
  })),
}));

describe("ProjectDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(projectsService.getProjectById).mockResolvedValue({
      id: "proj-1",
      projectNumber: "PRJ-001",
      description: "Detail project",
      customerId: "cust-1",
      status: "Open",
      blocked: "None",
      currencyCode: "EUR",
      createdAt: "2024-01-01T00:00:00Z",
      createdBy: "system",
    });
    vi.mocked(projectsService.getProjectStatistics).mockResolvedValue({
      projectId: "proj-1",
      currencyCode: "EUR",
      localCurrency: "EUR",
      totals: {
        budgetCostLcy: 0,
        budgetPrice: 0,
        billablePrice: 0,
        usageCostLcy: 0,
        usagePrice: 0,
        invoicedPrice: 0,
        invoicedPriceLcy: 0,
      },
      tasks: [],
    });
    vi.mocked(projectTasksService.getTaskTree).mockResolvedValue([]);
    vi.mocked(projectTasksService.getTasks).mockResolvedValue([]);
    vi.mocked(projectPlanningLinesService.getPlanningLines).mockResolvedValue([]);
    vi.mocked(projectPostingService.getLedgerEntries).mockResolvedValue([]);
    vi.mocked(projectPostingService.getItemConsumptionOrders).mockResolvedValue([]);
    vi.mocked(projectPostingService.getInvoiceRequests).mockResolvedValue([]);
  });

  it("renders project header", async () => {
    render(
      <MemoryRouter initialEntries={["/projects/proj-1"]}>
        <Routes>
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/PRJ-001/i)).toBeInTheDocument();
      expect(screen.getByText(/Detail project/i)).toBeInTheDocument();
    });
  });
});
