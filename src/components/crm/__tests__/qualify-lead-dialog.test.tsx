import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@/test/utils/test-utils";

import type { CustomerDto } from "@/types/api.types";

const mockOnOpenChange = vi.fn();
const mockOnSuccess = vi.fn();

vi.mock("@/api/services/customers.service", () => ({
  customersService: {
    getCustomers: vi.fn(),
  },
}));

vi.mock("@/api/services/leads.service", () => ({
  leadsService: {
    qualifyLead: vi.fn(),
  },
}));

import { customersService } from "@/api/services/customers.service";
import { leadsService } from "@/api/services/leads.service";
import { QualifyLeadDialog } from "../qualify-lead-dialog";

describe("QualifyLeadDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads customers and qualifies the lead on submit", async () => {
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

    vi.mocked(customersService.getCustomers).mockResolvedValue(customers);
    vi.mocked(leadsService.qualifyLead).mockResolvedValue(undefined);

    render(
      <QualifyLeadDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
        leadId="lead-1"
      />,
    );

    await expect(
      screen.findByRole("option", { name: "Customer 1" }),
    ).resolves.toBeTruthy();

    fireEvent.change(screen.getByLabelText(/customer/i), {
      target: { value: "1" },
    });

    await fireEvent.click(
      screen.getByRole("button", { name: /qualify lead/i }),
    );

    await waitFor(() => {
      expect(leadsService.qualifyLead).toHaveBeenCalledWith("lead-1", {
        customerId: "1",
      });
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });
});

