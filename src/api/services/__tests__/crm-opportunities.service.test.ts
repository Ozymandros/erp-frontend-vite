import { describe, it, expect, vi, beforeEach } from "vitest";
import type {
  OpportunityDto,
  PaginatedResponse,
  QuerySpec,
  UpdateOpportunityForecastDto,
  MarkOpportunityLostDto,
  MarkOpportunityWonRequest,
  CreateOpportunityLineDto,
  OpportunityLineDto,
  CreateOpportunityDto,
} from "@/types/api.types";

const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

vi.mock("@/api/clients", () => ({
  getApiClient: () => mockApiClient,
}));

const { crmOpportunitiesService } = await import("@/api/services/crm-opportunities.service");

describe("CrmOpportunitiesService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("searchOpportunities should call GET opportunities with query params", async () => {
    const querySpec: QuerySpec = {
      page: 1,
      pageSize: 10,
      searchTerm: "forecast",
      sortBy: "createdAt",
      sortDesc: true,
    };

    const mockResponse: PaginatedResponse<OpportunityDto> = {
      items: [],
      page: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    };

    mockApiClient.get.mockResolvedValue(mockResponse);

    const result = await crmOpportunitiesService.searchOpportunities(querySpec);

    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/crm/api/crm/opportunities",
      { params: querySpec },
    );
    expect(result).toEqual(mockResponse);
  });

  it("updateOpportunityForecast should PUT to the forecast endpoint", async () => {
    const id = "opp-1";
    const payload: UpdateOpportunityForecastDto = {
      probability: 0.5,
      expectedAmount: 1000,
      expectedCloseDate: "2026-03-30",
    };

    const updated: OpportunityDto = {
      id,
      customerId: "cust-1",
      name: "Test",
      stage: "Qualified",
      probability: payload.probability,
      expectedAmount: payload.expectedAmount,
      expectedCloseDate: payload.expectedCloseDate,
      ownerUsername: "owner",
    } as OpportunityDto;

    mockApiClient.put.mockResolvedValue(updated);

    const result = await crmOpportunitiesService.updateOpportunityForecast(
      id,
      payload,
    );

    expect(mockApiClient.put).toHaveBeenCalledWith(
      `/crm/api/crm/opportunities/${id}/forecast`,
      payload,
    );
    expect(result).toEqual(updated);
  });

  it("moveOpportunityStage should POST to the move-stage endpoint", async () => {
    const id = "opp-1";
    mockApiClient.post.mockResolvedValue({} as OpportunityDto);

    await crmOpportunitiesService.moveOpportunityStage(id, { stage: "Won" });

    expect(mockApiClient.post).toHaveBeenCalledWith(
      `/crm/api/crm/opportunities/${id}/move-stage`,
      { stage: "Won" },
    );
  });

  it("markOpportunityLost should POST to the mark-lost endpoint", async () => {
    const id = "opp-1";
    const payload: MarkOpportunityLostDto = { reason: "Budget cut" };
    mockApiClient.post.mockResolvedValue({} as OpportunityDto);

    await crmOpportunitiesService.markOpportunityLost(id, payload);

    expect(mockApiClient.post).toHaveBeenCalledWith(
      `/crm/api/crm/opportunities/${id}/mark-lost`,
      payload,
    );
  });

  it("addOpportunityLine should POST to the lines endpoint", async () => {
    const opportunityId = "opp-1";
    const payload: CreateOpportunityLineDto = {
      description: "Consulting",
      quantity: 2,
      unitPrice: 100,
      discountPercent: 0,
    };

    const createdLine: OpportunityLineDto = {
      id: "line-1",
      opportunityId,
      description: payload.description,
      quantity: payload.quantity,
      unitPrice: payload.unitPrice,
      discountPercent: payload.discountPercent ?? 0,
      lineTotal: 200,
    } as OpportunityLineDto;

    mockApiClient.post.mockResolvedValue(createdLine);

    const result = await crmOpportunitiesService.addOpportunityLine(opportunityId, payload);

    expect(mockApiClient.post).toHaveBeenCalledWith(
      `/crm/api/crm/opportunities/${opportunityId}/lines`,
      payload,
    );
    expect(result).toEqual(createdLine);
  });

  it("markOpportunityWon should POST with request payload", async () => {
    const id = "opp-1";
    const payload: MarkOpportunityWonRequest = { note: "Great deal", convertToQuote: false };
    mockApiClient.post.mockResolvedValue({} as OpportunityDto);

    await crmOpportunitiesService.markOpportunityWon(id, payload);

    expect(mockApiClient.post).toHaveBeenCalledWith(
      `/crm/api/crm/opportunities/${id}/mark-won`,
      payload,
    );
  });

  it("createOpportunity should POST to the opportunities base endpoint", async () => {
    const payload: CreateOpportunityDto = {
      customerId: "cust-1",
      name: "New Opp",
      ownerUsername: "owner",
    };

    const created: OpportunityDto = {
      id: "opp-1",
      customerId: payload.customerId,
      name: payload.name,
      stage: "Qualified",
      probability: 0.1,
      ownerUsername: payload.ownerUsername,
    } as OpportunityDto;

    mockApiClient.post.mockResolvedValue(created);

    const result = await crmOpportunitiesService.createOpportunity(payload);

    expect(mockApiClient.post).toHaveBeenCalledWith(
      "/crm/api/crm/opportunities",
      payload,
    );
    expect(result).toEqual(created);
  });
});

