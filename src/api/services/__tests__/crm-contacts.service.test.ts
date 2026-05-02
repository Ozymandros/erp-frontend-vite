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

  it("searchContacts should GET the contacts base endpoint with query params", async () => {
    const querySpec = { page: 1, pageSize: 10, search: "john" };
    const mockResponse = {
      data: [{ id: "c-1", fullName: "John Doe" } as ContactDto],
      total: 1,
      page: 1,
      pageSize: 10,
    };
    mockApiClient.get.mockResolvedValue(mockResponse);

    const result = await crmContactsService.searchContacts(querySpec);

    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/crm/api/crm/contacts",
      { params: querySpec },
    );
    expect(result).toEqual(mockResponse);
  });

  it("getContactById should GET the contact by id endpoint", async () => {
    const contact: ContactDto = { id: "c-1", fullName: "John Doe" } as ContactDto;
    mockApiClient.get.mockResolvedValue(contact);

    const result = await crmContactsService.getContactById("c-1");

    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/crm/api/crm/contacts/c-1",
    );
    expect(result).toEqual(contact);
  });

  it("updateContact should PUT to the contact by id endpoint", async () => {
    const updateData = { fullName: "John Smith" };
    const updated: ContactDto = { id: "c-1", ...updateData } as ContactDto;
    mockApiClient.put.mockResolvedValue(updated);

    const result = await crmContactsService.updateContact("c-1", updateData);

    expect(mockApiClient.put).toHaveBeenCalledWith(
      "/crm/api/crm/contacts/c-1",
      updateData,
    );
    expect(result).toEqual(updated);
  });

  it("setPrimaryContact should POST to set primary endpoint", async () => {
    mockApiClient.post.mockResolvedValue(undefined);

    await crmContactsService.setPrimaryContact("acc-1", { contactId: "c-1" });

    expect(mockApiClient.post).toHaveBeenCalledWith(
      "/crm/api/crm/accounts/acc-1/contacts/c-1/set-primary",
      undefined,
    );
  });
});

