import { describe, it, expect, vi, beforeEach } from "vitest";
import type { AccountDto, PaginatedResponse, QuerySpec, UpdateAccountOwnerDto } from "@/types/api.types";

const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

vi.mock("@/api/clients", () => ({
  getApiClient: () => mockApiClient,
}));

const { crmAccountsService } = await import("@/api/services/crm-accounts.service");

describe("CrmAccountsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("searchAccounts should call GET accounts with query params", async () => {
    const querySpec: QuerySpec = {
      page: 1,
      pageSize: 10,
      searchTerm: "acme",
      sortBy: "createdAt",
      sortDesc: true,
    };

    const mockResponse: PaginatedResponse<AccountDto> = {
      items: [],
      page: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    };

    mockApiClient.get.mockResolvedValue(mockResponse);

    const result = await crmAccountsService.searchAccounts(querySpec);

    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/crm/api/crm/accounts",
      { params: querySpec },
    );
    expect(result).toEqual(mockResponse);
  });

  it("updateAccountOwner should PUT to the owner endpoint", async () => {
    const accountId = "acc-1";
    const payload: UpdateAccountOwnerDto = { ownerUsername: "newOwner" };

    const updated: AccountDto = {
      id: accountId,
      customerId: "cust-1",
      name: "ACME",
      isActive: true,
      lastSyncedAt: "2026-03-30T00:00:00Z",
      ownerUsername: payload.ownerUsername,
    } as AccountDto;

    mockApiClient.put.mockResolvedValue(updated);

    const result = await crmAccountsService.updateAccountOwner(
      accountId,
      payload,
    );

    expect(mockApiClient.put).toHaveBeenCalledWith(
      `/crm/api/crm/accounts/${accountId}/owner`,
      payload,
    );
    expect(result).toEqual(updated);
  });
});

