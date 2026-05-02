import { describe, it, expect, vi, beforeEach } from "vitest";
import { render as rtlRender, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ContactDetailPage } from "../contact-detail";
import { crmContactsService } from "@/api/services/crm-contacts.service";
import { AuthProvider } from "@/contexts/auth.context";
import { ContactDto } from "@/types/api.types";

vi.mock("@/api/services/crm-contacts.service", () => ({
  crmContactsService: {
    getContactById: vi.fn(),
    updateContact: vi.fn(),
    setPrimaryContact: vi.fn(),
    deactivateContact: vi.fn(),
  },
}));

const mockContact = new ContactDto({
  id: "c1",
  accountId: "acc-1",
  fullName: "Jane Doe",
  email: "jane@example.com",
  phone: "555",
  title: "VP",
  isPrimary: false,
  isActive: true,
});

function renderWithProviders(id = "c1") {
  return rtlRender(
    <MemoryRouter initialEntries={[`/crm/contacts/${id}`]}>
      <AuthProvider>
        <Routes>
          <Route path="/crm/contacts/:id" element={<ContactDetailPage />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("ContactDetailPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders loading state", () => {
    vi.mocked(crmContactsService.getContactById).mockImplementation(() => new Promise(() => {}));

    renderWithProviders();

    expect(screen.getByText(/loading contact/i)).toBeInTheDocument();
  });

  it("renders contact fields", async () => {
    vi.mocked(crmContactsService.getContactById).mockResolvedValue(mockContact);

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByDisplayValue(/jane doe/i)).toBeInTheDocument();
    });

    expect(screen.getByDisplayValue("jane@example.com")).toBeInTheDocument();
    expect(screen.getByText(/acc-1/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /set primary/i })).toBeInTheDocument();
  });

  it("shows error when fetch fails", async () => {
    vi.mocked(crmContactsService.getContactById).mockRejectedValue(new Error("boom"));

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText(/boom/i)).toBeInTheDocument();
    });
  });

  it("saves changes", async () => {
    vi.mocked(crmContactsService.getContactById).mockResolvedValue(mockContact);
    vi.mocked(crmContactsService.updateContact).mockResolvedValue(undefined);

    renderWithProviders();

    await waitFor(() => expect(screen.getByLabelText(/full name/i)).toBeInTheDocument());

    const nameInput = screen.getByLabelText(/full name/i);
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, "Jane Smith");

    await userEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(crmContactsService.updateContact).toHaveBeenCalledWith(
        "c1",
        expect.objectContaining({ fullName: "Jane Smith" })
      );
    });
  });

  it("sets primary contact", async () => {
    vi.mocked(crmContactsService.getContactById).mockResolvedValue(mockContact);
    vi.mocked(crmContactsService.setPrimaryContact).mockResolvedValue(undefined);

    renderWithProviders();

    await waitFor(() => expect(screen.getByRole("button", { name: /set primary/i })).toBeInTheDocument());

    await userEvent.click(screen.getByRole("button", { name: /set primary/i }));

    await waitFor(() => {
      expect(crmContactsService.setPrimaryContact).toHaveBeenCalledWith("acc-1", {
        contactId: "c1",
      });
    });
  });

  it("deactivates and navigates away", async () => {
    let hrefValue = "";
    vi.stubGlobal(
      "location",
      Object.defineProperty({}, "href", {
        configurable: true,
        get() {
          return hrefValue;
        },
        set(v: string) {
          hrefValue = v;
        },
      }) as Location
    );

    vi.mocked(crmContactsService.getContactById).mockResolvedValue(mockContact);
    vi.mocked(crmContactsService.deactivateContact).mockResolvedValue(undefined);

    renderWithProviders();

    await waitFor(() => expect(screen.getByRole("button", { name: /deactivate/i })).toBeInTheDocument());

    await userEvent.click(screen.getByRole("button", { name: /deactivate/i }));

    await waitFor(() => {
      expect(crmContactsService.deactivateContact).toHaveBeenCalledWith("c1");
      expect(hrefValue).toBe("/crm/contacts");
    });
  });
});
