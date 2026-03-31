import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LeadsListPage } from "../leads-list";
import { leadsService } from "@/api/services/leads.service";
// mocked below via `vi.mock` — no direct imports needed
import type { LeadDto, PaginatedResponse } from "@/types/api.types";

vi.mock("@/api/services/leads.service", () => ({
  leadsService: {
    searchLeads: vi.fn(),
  },
}));

vi.mock("@/contexts/auth.context", () => ({
  useAuth: vi.fn(() => ({ user: { username: "owner1" } })),
}));

vi.mock("@/hooks/use-permissions", () => ({
  useModulePermissions: vi.fn(() => ({ canCreate: true })),
}));

const mockLeads: LeadDto[] = [
  {
    id: "lead-1",
    title: "Interested Lead",
    status: "New",
    ownerUsername: "owner1",
    contactName: "John Doe",
    createdAt: "2024-01-01T00:00:00Z",
    createdBy: "system",
  },
];

const mockResponse: PaginatedResponse<LeadDto> = {
  items: mockLeads,
  total: 1,
  page: 1,
  pageSize: 10,
  totalPages: 1,
  hasPreviousPage: false,
  hasNextPage: false,
};

describe("LeadsListPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders leads list and header", async () => {
    vi.mocked(leadsService.searchLeads).mockResolvedValue(mockResponse);

    render(
      <MemoryRouter>
        <LeadsListPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/CRM Leads/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Interested Lead/i)).toBeInTheDocument();
    });

    expect(screen.getByText("All Leads")).toBeInTheDocument();
    expect(screen.getByText(/1 total leads/i)).toBeInTheDocument();
  });

  it("shows empty state when no leads", async () => {
    vi.mocked(leadsService.searchLeads).mockResolvedValue({ ...mockResponse, items: [], total: 0 });

    render(
      <MemoryRouter>
        <LeadsListPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/No lead found./i)).toBeInTheDocument();
    });
  });
});
