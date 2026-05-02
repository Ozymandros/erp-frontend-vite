import { describe, it, expect, vi, beforeEach } from "vitest";
import { render as rtlRender, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AccountsListPage } from "../accounts-list";
import { AuthProvider } from "@/contexts/auth.context";
import { crmAccountsService } from "@/api/services/crm-accounts.service";
import type { AccountDto, PaginatedResponse } from "@/types/api.types";

vi.mock("@/api/services/crm-accounts.service", () => ({
  crmAccountsService: {
    searchAccounts: vi.fn(),
  },
}));

const mockAccounts: AccountDto[] = [
  {
      id: "acc-1",
      name: "Acme Corp",
      customerId: "CUST-1",
      ownerUsername: "owner1",
      isActive: true,
      createdAt: "2024-01-01T00:00:00Z",
      createdBy: "system",
      lastSyncedAt: ""
  },
];

const mockResponse: PaginatedResponse<AccountDto> = {
  items: mockAccounts,
  total: 1,
  page: 1,
  pageSize: 10,
  totalPages: 1,
  hasPreviousPage: false,
  hasNextPage: false,
};

describe("AccountsListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders accounts list and header", async () => {
    vi.mocked(crmAccountsService.searchAccounts).mockResolvedValue(mockResponse);

    rtlRender(<AccountsListPage />, {
      wrapper: ({ children }) => (
        <MemoryRouter>
          <AuthProvider>{children}</AuthProvider>
        </MemoryRouter>
      ),
    });

    expect(screen.getByRole("heading", { name: /CRM Accounts/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Acme Corp/i)).toBeInTheDocument();
    });

    expect(screen.getByText("All Accounts")).toBeInTheDocument();
    expect(screen.getByText(/1 total accounts/i)).toBeInTheDocument();
  });

  it("shows empty state when no accounts", async () => {
    vi.mocked(crmAccountsService.searchAccounts).mockResolvedValue({ ...mockResponse, items: [], total: 0 });

    rtlRender(<AccountsListPage />, {
      wrapper: ({ children }) => (
        <MemoryRouter>
          <AuthProvider>{children}</AuthProvider>
        </MemoryRouter>
      ),
    });

    await waitFor(() => {
      expect(screen.getByText(/No account found./i)).toBeInTheDocument();
    });
  });
});
