import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { OpportunitiesListPage } from "../opportunities-list";
import { crmOpportunitiesService } from "@/api/services/crm-opportunities.service";
// mocked below via `vi.mock` — no direct imports needed
import type { OpportunityDto, PaginatedResponse } from "@/types/api.types";

vi.mock("@/api/services/crm-opportunities.service", () => ({
  crmOpportunitiesService: {
    searchOpportunities: vi.fn(),
  },
}));

vi.mock("@/contexts/auth.context", () => ({
  useAuth: vi.fn(() => ({ user: { username: "owner1" } })),
}));

vi.mock("@/hooks/use-permissions", () => ({
  useModulePermissions: vi.fn(() => ({ canCreate: true })),
}));

const mockOpportunities: OpportunityDto[] = [
  {
    id: "opp-1",
    name: "Opportunity 1",
    stage: "Qualification",
    ownerUsername: "owner1",
    customerId: "CUST-1",
    probability: 50,
    createdAt: "2024-01-01T00:00:00Z",
    createdBy: "system",
  },
];

const mockResponse: PaginatedResponse<OpportunityDto> = {
  items: mockOpportunities,
  total: 1,
  page: 1,
  pageSize: 10,
  totalPages: 1,
  hasPreviousPage: false,
  hasNextPage: false,
};

describe("OpportunitiesListPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders opportunities and header", async () => {
    vi.mocked(crmOpportunitiesService.searchOpportunities).mockResolvedValue(mockResponse);

    render(
      <MemoryRouter>
        <OpportunitiesListPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/CRM Opportunities/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Opportunity 1/i)).toBeInTheDocument();
    });

    expect(screen.getByText("All Opportunities")).toBeInTheDocument();
    expect(screen.getByText(/1 total opportunities/i)).toBeInTheDocument();
  });

  it("shows empty state when no opportunities", async () => {
    vi.mocked(crmOpportunitiesService.searchOpportunities).mockResolvedValue({ ...mockResponse, items: [], total: 0 });

    render(
      <MemoryRouter>
        <OpportunitiesListPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/No opportunity found./i)).toBeInTheDocument();
    });
  });
});
