import { describe, it, expect, vi, beforeEach } from "vitest";
import type { LeadDto, PaginatedResponse, QuerySpec, QualifyLeadDto, CreateLeadDto, UpdateLeadDto } from "@/types/api.types";

const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

vi.mock("@/api/clients", () => ({
  getApiClient: () => mockApiClient,
}));

const { leadsService } = await import("@/api/services/leads.service");

describe("LeadsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("searchLeads should call the leads endpoint with query params", async () => {
    const querySpec: QuerySpec = {
      page: 1,
      pageSize: 10,
      searchTerm: "test",
      sortBy: "createdAt",
      sortDesc: true,
    };

    const mockResponse: PaginatedResponse<LeadDto> = {
      items: [],
      page: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    };

    mockApiClient.get.mockResolvedValue(mockResponse);

    const result = await leadsService.searchLeads(querySpec);

    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/crm/api/crm/leads",
      { params: querySpec },
    );
    expect(result).toEqual(mockResponse);
  });

  it("qualifyLead should POST to the qualify endpoint", async () => {
    const id = "lead-123";
    const payload: QualifyLeadDto = { customerId: "customer-123" };

    mockApiClient.post.mockResolvedValue(undefined);

    await leadsService.qualifyLead(id, payload);

    expect(mockApiClient.post).toHaveBeenCalledWith(
      `/crm/api/crm/leads/${id}/qualify`,
      payload,
    );
  });

  it("createLead should POST to the leads base endpoint", async () => {
    const payload: CreateLeadDto = {
      title: "Test Lead",
      ownerUsername: "owner",
      source: "web",
    };

    const created: LeadDto = {
      id: "lead-1",
      title: payload.title,
      source: payload.source,
      status: "Open",
      ownerUsername: payload.ownerUsername,
    } as LeadDto;

    mockApiClient.post.mockResolvedValue(created);

    const result = await leadsService.createLead(payload);

    expect(mockApiClient.post).toHaveBeenCalledWith(
      "/crm/api/crm/leads",
      payload,
    );
    expect(result).toEqual(created);
  });

  it("updateLead should PUT to the lead by id endpoint", async () => {
    const id = "lead-123";
    const payload: UpdateLeadDto = {
      title: "Updated Lead",
    };

    const updated: LeadDto = {
      id,
      title: payload.title,
      status: "Open",
      ownerUsername: "owner",
    } as LeadDto;

    mockApiClient.put.mockResolvedValue(updated);

    const result = await leadsService.updateLead(id, payload);

    expect(mockApiClient.put).toHaveBeenCalledWith(
      `/crm/api/crm/leads/${id}`,
      payload,
    );
    expect(result).toEqual(updated);
  });

  it("getLeadById should GET the lead by id endpoint", async () => {
    const id = "lead-123";
    const lead: LeadDto = {
      id,
      title: "Test Lead",
      status: "Open",
      ownerUsername: "owner",
      source: "web",
    } as LeadDto;

    mockApiClient.get.mockResolvedValue(lead);

    const result = await leadsService.getLeadById(id);

    expect(mockApiClient.get).toHaveBeenCalledWith(
      `/crm/api/crm/leads/${id}`,
    );
    expect(result).toEqual(lead);
  });

  it("deleteLead should DELETE the lead by id endpoint", async () => {
    const id = "lead-123";

    mockApiClient.delete.mockResolvedValue(undefined);

    await leadsService.deleteLead(id);

    expect(mockApiClient.delete).toHaveBeenCalledWith(
      `/crm/api/crm/leads/${id}`,
    );
  });
});

