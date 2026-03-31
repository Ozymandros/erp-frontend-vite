import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@/test/utils/test-utils";

const mockOnOpenChange = vi.fn();
const mockOnSuccess = vi.fn();

vi.mock("@/api/services/crm-accounts.service", () => ({
  crmAccountsService: {
    updateAccountOwner: vi.fn(),
  },
}));

import { UpdateAccountOwnerDialog } from "../update-account-owner-dialog";
import { crmAccountsService } from "@/api/services/crm-accounts.service";
import { AccountDto } from "@/types/api.types";

describe("UpdateAccountOwnerDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders and saves new owner", async () => {
    vi.mocked(crmAccountsService.updateAccountOwner).mockResolvedValue(
      new AccountDto({
        id: "account-1",
        customerId: "cust-1",
        name: "Test Account",
        isActive: true,
        lastSyncedAt: "2026-03-31T00:00:00Z",
        createdAt: "2026-03-31T00:00:00Z",
        createdBy: "system"
      })
    );

    render(
      <UpdateAccountOwnerDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
        accountId="acc-1"
        initialOwnerUsername={"oldowner"}
      />,
    );

    expect(screen.getByRole("heading", { name: /change account owner/i })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Owner Username/i), { target: { value: "newowner" } });
    fireEvent.click(screen.getByRole("button", { name: /save owner/i }));

    await waitFor(() => {
      expect(crmAccountsService.updateAccountOwner).toHaveBeenCalledWith(
        "acc-1",
        expect.objectContaining({ ownerUsername: "newowner" }),
      );
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
});
