import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ContactDto, CreateContactDto } from "@/types/api.types";

const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

vi.mock("@/api/clients", () => ({
  getApiClient: () => mockApiClient,
}));

const { crmContactsService } = await import("@/api/services/crm-contacts.service");

describe("CrmContactsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getContactsByAccount should GET the account-scoped contacts endpoint", async () => {
    const accountId = "acc-1";
    const mockContacts: ContactDto[] = [
      { id: "c-1", accountId, fullName: "John Doe", isPrimary: true, isActive: true } as ContactDto,
    ];
    mockApiClient.get.mockResolvedValue(mockContacts);

    const result = await crmContactsService.getContactsByAccount(accountId);

    expect(mockApiClient.get).toHaveBeenCalledWith(
      `/crm/api/crm/accounts/${accountId}/contacts`,
    );
    expect(result).toEqual(mockContacts);
  });

  it("createContact should POST to the contacts base endpoint", async () => {
    const payload: CreateContactDto = {
      accountId: "acc-1",
      fullName: "Jane Doe",
      email: "jane@example.com",
      isPrimary: true,
    };

    const created: ContactDto = {
      id: "c-1",
      accountId: payload.accountId,
      fullName: payload.fullName,
      email: payload.email,
      isPrimary: true,
      isActive: true,
    } as ContactDto;

    mockApiClient.post.mockResolvedValue(created);

    const result = await crmContactsService.createContact(payload);

    expect(mockApiClient.post).toHaveBeenCalledWith(
      "/crm/api/crm/contacts",
      payload,
    );
    expect(result).toEqual(created);
  });

  it("deactivateContact should DELETE the contact by id endpoint", async () => {
    mockApiClient.delete.mockResolvedValue(undefined);

    await crmContactsService.deactivateContact("c-1");

    expect(mockApiClient.delete).toHaveBeenCalledWith(
      "/crm/api/crm/contacts/c-1",
    );
  });
});

