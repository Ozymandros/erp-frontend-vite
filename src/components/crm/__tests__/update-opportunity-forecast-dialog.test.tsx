import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@/test/utils/test-utils";

const mockOnOpenChange = vi.fn();
const mockOnSuccess = vi.fn();

vi.mock("@/api/services/crm-opportunities.service", () => ({
  crmOpportunitiesService: {
    updateOpportunityForecast: vi.fn(),
  },
}));

import { UpdateOpportunityForecastDialog } from "../update-opportunity-forecast-dialog";
import { crmOpportunitiesService } from "@/api/services/crm-opportunities.service";
import { OpportunityDto } from "@/types/api.types";

describe("UpdateOpportunityForecastDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("disables save when opportunity is closed", () => {
    render(
      <UpdateOpportunityForecastDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
        opportunityId="opp-1"
        isClosed={true}
      />,
    );

    expect(screen.getByRole("button", { name: /save forecast/i })).toBeDisabled();
  });

  it("updates forecast on valid submit", async () => {
    vi.mocked(crmOpportunitiesService.updateOpportunityForecast).mockResolvedValue(
      new OpportunityDto({
        id: "opp-1",
        customerId: "cust-1",
        name: "Test Opportunity",
        stage: "Prospecting",
        probability: 50,
        ownerUsername: "user1",
        createdAt: "2026-03-31T00:00:00Z",
        createdBy: "system"
      })
    );


    render(
      <UpdateOpportunityForecastDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
        opportunityId="opp-1"
        isClosed={false}
        initialData={{ probability: 0.2, expectedAmount: 100, expectedCloseDate: "2024-12-31" }}
      />,
    );

    fireEvent.change(screen.getByLabelText(/Probability/i), { target: { value: "0.5" } });
    fireEvent.change(screen.getByLabelText(/Expected Amount/i), { target: { value: "200" } });

    const form = document.querySelector("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(crmOpportunitiesService.updateOpportunityForecast).toHaveBeenCalledWith(
        "opp-1",
        expect.objectContaining({ probability: 0.5, expectedAmount: 200 }),
      );
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
});
