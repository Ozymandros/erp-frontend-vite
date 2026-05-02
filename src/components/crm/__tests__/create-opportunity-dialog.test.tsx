import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@/test/utils/test-utils";

import type {
  CustomerDto,
  LeadDto,
  PaginatedResponse,
  OpportunityDto,
} from "@/types/api.types";

const mockOnOpenChange = vi.fn();
const mockOnSuccess = vi.fn();

vi.mock("@/api/services/customers.service", () => ({
  customersService: {
    getCustomers: vi.fn(),
  },
}));

vi.mock("@/api/services/leads.service", () => ({
  leadsService: {
    searchLeads: vi.fn(),
  },
}));

vi.mock("@/api/services/crm-opportunities.service", () => ({
  crmOpportunitiesService: {
    createOpportunity: vi.fn(),
  },
}));

import { customersService } from "@/api/services/customers.service";
import { leadsService } from "@/api/services/leads.service";
import { crmOpportunitiesService } from "@/api/services/crm-opportunities.service";
import { CreateOpportunityDialog } from "../create-opportunity-dialog";

describe("CreateOpportunityDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads dependencies and creates an opportunity on submit", async () => {
    const customers: CustomerDto[] = [
      {
        id: "1",
        name: "Customer 1",
        email: "customer1@example.com",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        createdBy: "system",
        updatedBy: "system",
      },
    ] as CustomerDto[];

    const leads: LeadDto[] = [
      {
        id: "lead-1",
        title: "Lead 1",
        status: "Open",
        ownerUsername: "admin",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        createdBy: "system",
        updatedBy: "system",
      },
    ] as LeadDto[];

    const leadsPaginated: PaginatedResponse<LeadDto> = {
      items: leads,
      page: 1,
      pageSize: 50,
      total: leads.length,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    };

    vi.mocked(customersService.getCustomers).mockResolvedValue(customers);
    vi.mocked(leadsService.searchLeads).mockResolvedValue(leadsPaginated);
    vi.mocked(crmOpportunitiesService.createOpportunity).mockResolvedValue({
      id: "opp-1",
      customerId: "1",
      name: "Opportunity 1",
      stage: "Qualification",
      probability: 0.5,
      ownerUsername: "admin",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      createdBy: "system",
      updatedBy: "system",
    } as OpportunityDto);

    render(
      <CreateOpportunityDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
        ownerUsername="admin"
      />,
    );

    await screen.findByRole("option", { name: "Customer 1" });

    await fireEvent.change(screen.getByLabelText(/customer/i), {
      target: { value: "1" },
    });

    await fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "Opportunity E2E Created" },
    });

    const submitBtn = screen.getByRole("button", {
      name: /create opportunity/i,
    });

    await waitFor(() => expect(submitBtn).not.toBeDisabled());
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(crmOpportunitiesService.createOpportunity).toHaveBeenCalledWith(
        expect.objectContaining({
          customerId: "1",
          name: "Opportunity E2E Created",
          ownerUsername: "admin",
        }),
      );
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });
});

