import { describe, it, expect, vi, beforeEach } from "vitest";
import { render as rtlRender, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { LeadDetailPage } from "../lead-detail";
import { leadsService } from "@/api/services/leads.service";
import { AuthProvider } from "@/contexts/auth.context";
import type { LeadDto } from "@/types/api.types";

vi.mock("@/api/services/leads.service", () => ({
  leadsService: {
    getLeadById: vi.fn(),
  },
}));

const mockLead: LeadDto = {
  id: "lead-1",
  title: "Big Opportunity",
  status: "New",
  ownerUsername: "owner1",
  contactName: "John Doe",
  contactEmail: "john@example.com",
  contactPhone: "555-0100",
  createdAt: "2024-01-01T00:00:00Z",
  createdBy: "system",
};

// Render helper that mounts the route inside a MemoryRouter and AuthProvider
function renderWithProviders(id = "lead-1") {
  return rtlRender(
    <MemoryRouter initialEntries={[`/crm/leads/${id}`]}>
      <AuthProvider>
        <Routes>
          <Route path="/crm/leads/:id" element={<LeadDetailPage />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("LeadDetailPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders loading state", () => {
    vi.mocked(leadsService.getLeadById).mockImplementation(() => new Promise(() => {}));

    renderWithProviders();

    expect(screen.getByText(/Loading lead.../i)).toBeInTheDocument();
  });

  it("renders lead details", async () => {
    vi.mocked(leadsService.getLeadById).mockResolvedValue(mockLead);

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText(/Big Opportunity/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/john@example.com/i)).toBeInTheDocument();
  });

  it("shows not found when error", async () => {
    vi.mocked(leadsService.getLeadById).mockRejectedValue(new Error("Not found"));

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText(/Not found/i)).toBeInTheDocument();
    });
  });
});
