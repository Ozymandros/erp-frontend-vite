import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AccountDetailPage } from "../account-detail";
import { crmAccountsService } from "@/api/services/crm-accounts.service";
import { crmContactsService } from "@/api/services/crm-contacts.service";
import type { AccountDto, ContactDto } from "@/types/api.types";

vi.mock("@/api/services/crm-accounts.service", () => ({
  crmAccountsService: {
    getAccountById: vi.fn(),
  },
}));

vi.mock("@/api/services/crm-contacts.service", () => ({
  crmContactsService: {
    getContactsByAccount: vi.fn(),
  },
}));

const mockAccount: AccountDto = {
  id: "acc-1",
  name: "Acme Corp",
  customerId: "CUST-1",
  ownerUsername: "owner1",
  isActive: true,
  createdAt: "2024-01-01T00:00:00Z",
  createdBy: "system",
  lastSyncedAt: "",
};

const mockContacts: ContactDto[] = [
  {
    id: "c-1",
    fullName: "John Doe",
    email: "john@example.com",
    phone: "",
    isPrimary: true,
    accountId: "acc-1",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    createdBy: "system",
  },
];

function TestWrapper({ id = "acc-1" }: { id?: string }) {
  return (
    <MemoryRouter initialEntries={[`/crm/accounts/${id}`]}>
      <Routes>
        <Route path="/crm/accounts/:id" element={<AccountDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("AccountDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state", async () => {
    vi.mocked(crmAccountsService.getAccountById).mockImplementation(() => new Promise(() => {}));

    render(<TestWrapper />);

    expect(screen.getByText(/Loading account.../i)).toBeInTheDocument();
  });

  it("renders account details and contacts", async () => {
    vi.mocked(crmAccountsService.getAccountById).mockResolvedValue(mockAccount);
    vi.mocked(crmContactsService.getContactsByAccount).mockResolvedValue(mockContacts);

    render(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByText(/Acme Corp/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/CUST-1/i)).toBeInTheDocument();
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
  });

  it("shows not found when account missing", async () => {
    vi.mocked(crmAccountsService.getAccountById).mockRejectedValue(new Error("Not found"));
    vi.mocked(crmContactsService.getContactsByAccount).mockResolvedValue([]);

    render(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByText(/not found/i)).toBeInTheDocument();
    });
  });
});
