import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@/test/utils/test-utils";

const mockOnOpenChange = vi.fn();
const mockOnSuccess = vi.fn();

vi.mock("@/api/services/crm-accounts.service", () => ({
  crmAccountsService: {
    searchAccounts: vi.fn(),
  },
}));

vi.mock("@/api/services/crm-contacts.service", () => ({
  crmContactsService: {
    createContact: vi.fn(),
  },
}));

import { CreateContactDialog } from "../create-contact-dialog";
import { crmAccountsService } from "@/api/services/crm-accounts.service";
import { crmContactsService } from "@/api/services/crm-contacts.service";
import type { AccountDto, ContactDto, PaginatedResponse } from "@/types/api.types";

describe("CreateContactDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders create contact form when open and loads accounts", async () => {
    const mockAccounts: AccountDto[] = [
      {
        id: "acc-1",
        name: "Acme Corp",
        customerId: "C1",
        ownerUsername: "owner1",
        isActive: true,
        createdAt: "2024-01-01T00:00:00Z",
        createdBy: "system",
        lastSyncedAt: "",
      },
    ];

    const mockResponse: PaginatedResponse<AccountDto> = {
      items: mockAccounts,
      total: 1,
      page: 1,
      pageSize: 50,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    };

    vi.mocked(crmAccountsService.searchAccounts).mockResolvedValue(mockResponse);

    render(
      <CreateContactDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />,
    );

    expect(screen.getByRole("heading", { name: /create contact/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Acme Corp/i)).toBeInTheDocument();
    });
  });

  it("calls createContact and notifies on success", async () => {
    const created: ContactDto = {
      id: "contact-1",
      fullName: "Jane Doe",
      email: "jane@example.com",
      phone: "123",
      accountId: "acc-1",
      title: "Manager",
      isPrimary: false,
      createdAt: "2024-01-01T00:00:00Z",
      createdBy: "system",
      updatedAt: "2024-01-01T00:00:00Z",
    } as ContactDto;

    vi.mocked(crmAccountsService.searchAccounts).mockResolvedValue({
      items: [
        { id: "acc-1", name: "Acme Corp", customerId: "C1", ownerUsername: "o", isActive: true, createdAt: "", createdBy: "", lastSyncedAt: "" },
      ],
      total: 1,
      page: 1,
      pageSize: 50,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    });

    vi.mocked(crmContactsService.createContact).mockResolvedValue(created);

    render(
      <CreateContactDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />,
    );

    // select account
    await waitFor(() => expect(screen.getByText(/Acme Corp/i)).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/Account/i), { target: { value: "acc-1" } });

    // fill required fields
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: "Jane Doe" } });

    fireEvent.click(screen.getByRole("button", { name: /create contact/i }));

    await waitFor(() => {
      expect(crmContactsService.createContact).toHaveBeenCalled();
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it("calls onOpenChange(false) when Cancel is clicked", () => {
    render(
      <CreateContactDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
