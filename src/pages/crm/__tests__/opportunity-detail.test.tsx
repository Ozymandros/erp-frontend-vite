import { describe, it, expect, vi, beforeEach } from "vitest";
import { render as rtlRender, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { OpportunityDetailPage } from "../opportunity-detail";
import { crmOpportunitiesService } from "@/api/services/crm-opportunities.service";
import { AuthProvider } from "@/contexts/auth.context";
import { OpportunityDto } from "@/types/api.types";

vi.mock("@/components/crm/update-opportunity-forecast-dialog", () => ({
  UpdateOpportunityForecastDialog: () => null,
}));

vi.mock("@/components/crm/add-opportunity-line-dialog", () => ({
  AddOpportunityLineDialog: () => null,
}));

vi.mock("@/api/services/crm-opportunities.service", () => ({
  crmOpportunitiesService: {
    getOpportunityById: vi.fn(),
    moveOpportunityStage: vi.fn(),
    markOpportunityWon: vi.fn(),
    markOpportunityLost: vi.fn(),
  },
}));

const baseOpp = new OpportunityDto({
  id: "opp-1",
  customerId: "cust-1",
  name: "Enterprise Deal",
  stage: "Qualification",
  probability: 40,
  expectedAmount: 5000,
  expectedCloseDate: "2024-12-31",
  ownerUsername: "bob",
});

function renderWithProviders(id = "opp-1") {
  return rtlRender(
    <MemoryRouter initialEntries={[`/crm/opportunities/${id}`]}>
      <AuthProvider>
        <Routes>
          <Route path="/crm/opportunities/:id" element={<OpportunityDetailPage />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("OpportunityDetailPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders loading state", () => {
    vi.mocked(crmOpportunitiesService.getOpportunityById).mockImplementation(() => new Promise(() => {}));

    renderWithProviders();

    expect(screen.getByText(/loading opportunity/i)).toBeInTheDocument();
  });

  it("renders opportunity details", async () => {
    vi.mocked(crmOpportunitiesService.getOpportunityById).mockResolvedValue(baseOpp);

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText(/enterprise deal/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/qualification/i)).toBeInTheDocument();
    expect(screen.getByText(/bob/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /move stage/i })).toBeInTheDocument();
  });

  it("shows error when fetch fails", async () => {
    vi.mocked(crmOpportunitiesService.getOpportunityById).mockRejectedValue(new Error("gone"));

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText(/gone/i)).toBeInTheDocument();
    });
  });

  it("moves stage", async () => {
    vi.mocked(crmOpportunitiesService.getOpportunityById).mockResolvedValue(baseOpp);
    vi.mocked(crmOpportunitiesService.moveOpportunityStage).mockResolvedValue(baseOpp);

    renderWithProviders();

    await waitFor(() => expect(screen.getByLabelText(/^stage$/i)).toBeInTheDocument());

    const stageInput = screen.getByLabelText(/^stage$/i);
    await userEvent.clear(stageInput);
    await userEvent.type(stageInput, "Proposal");

    await userEvent.click(screen.getByRole("button", { name: /move stage/i }));

    await waitFor(() => {
      expect(crmOpportunitiesService.moveOpportunityStage).toHaveBeenCalledWith("opp-1", {
        stage: "Proposal",
      });
    });
  });

  it("marks won", async () => {
    vi.mocked(crmOpportunitiesService.getOpportunityById).mockResolvedValue(baseOpp);
    vi.mocked(crmOpportunitiesService.markOpportunityWon).mockResolvedValue(baseOpp);

    renderWithProviders();

    await waitFor(() => expect(screen.getByLabelText(/mark won note/i)).toBeInTheDocument());

    await userEvent.type(screen.getByLabelText(/mark won note/i), "Great fit");
    await userEvent.click(screen.getByRole("button", { name: /mark won/i }));

    await waitFor(() => {
      expect(crmOpportunitiesService.markOpportunityWon).toHaveBeenCalledWith("opp-1", {
        convertToQuote: false,
        note: "Great fit",
      });
    });
  });

  it("marks lost with reason", async () => {
    vi.mocked(crmOpportunitiesService.getOpportunityById).mockResolvedValue(baseOpp);
    vi.mocked(crmOpportunitiesService.markOpportunityLost).mockResolvedValue(baseOpp);

    renderWithProviders();

    await waitFor(() => expect(screen.getByLabelText(/mark lost reason/i)).toBeInTheDocument());

    await userEvent.type(screen.getByLabelText(/mark lost reason/i), "Budget cut");
    await userEvent.click(screen.getByRole("button", { name: /mark lost/i }));

    await waitFor(() => {
      expect(crmOpportunitiesService.markOpportunityLost).toHaveBeenCalledWith("opp-1", {
        reason: "Budget cut",
      });
    });
  });

  it("disables edits when opportunity is closed", async () => {
    const closed = new OpportunityDto({
      ...baseOpp,
      stage: "Closed Won",
    });
    vi.mocked(crmOpportunitiesService.getOpportunityById).mockResolvedValue(closed);

    renderWithProviders();

    await waitFor(() => {
      expect(
        screen.getByText(/this opportunity is closed and can no longer be modified/i)
      ).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /update forecast/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /add line/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /move stage/i })).toBeDisabled();
  });
});
