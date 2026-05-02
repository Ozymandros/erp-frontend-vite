import { describe, it, expect, vi } from "vitest";
import { render as rtlRender, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ContactsListPage } from "../contacts-list";
import { crmContactsService } from "@/api/services/crm-contacts.service";
import { AuthProvider } from "@/contexts/auth.context";
import type { ContactDto, PaginatedResponse } from "@/types/api.types";

vi.mock("@/api/services/crm-contacts.service", () => ({
  crmContactsService: {
    searchContacts: vi.fn(),
  },
}));

const mockContacts: ContactDto[] = [
  {
    id: "c-1",
    fullName: "John Doe",
    email: "john@example.com",
    phone: "555-0100",
    isPrimary: true,
    accountId: "acc-1",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    createdBy: "system",
  },
];

const mockResponse: PaginatedResponse<ContactDto> = {
  items: mockContacts,
  total: 1,
  page: 1,
  pageSize: 10,
  totalPages: 1,
  hasPreviousPage: false,
  hasNextPage: false,
};

describe("ContactsListPage", () => {
  it("renders contacts list", async () => {
    vi.mocked(crmContactsService.searchContacts).mockResolvedValue(mockResponse);

    rtlRender(<ContactsListPage />, {
      wrapper: ({ children }) => (
        <MemoryRouter>
          <AuthProvider>{children}</AuthProvider>
        </MemoryRouter>
      ),
    });

    expect(screen.getByRole("heading", { name: /CRM Contacts/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });

    expect(screen.getByText("All Contacts")).toBeInTheDocument();
  });
});
