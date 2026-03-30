import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ActivityDto, PaginatedResponse, QuerySpec, CreateActivityDto, CompleteActivityDto } from "@/types/api.types";

const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

vi.mock("@/api/clients", () => ({
  getApiClient: () => mockApiClient,
}));

const { crmActivitiesService } = await import("@/api/services/crm-activities.service");

describe("CrmActivitiesService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("searchActivities should call GET activities with query params", async () => {
    const querySpec: QuerySpec = {
      page: 1,
      pageSize: 10,
      searchTerm: "meeting",
      sortBy: "createdAt",
      sortDesc: true,
    };

    const mockResponse: PaginatedResponse<ActivityDto> = {
      items: [],
      page: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    };

    mockApiClient.get.mockResolvedValue(mockResponse);

    const result = await crmActivitiesService.searchActivities(querySpec);

    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/crm/api/crm/activities",
      { params: querySpec },
    );
    expect(result).toEqual(mockResponse);
  });

  it("createActivity should POST to the activities base endpoint", async () => {
    const payload: CreateActivityDto = {
      subject: "Intro call",
      type: "Call",
      dueAt: "2026-03-30T10:00:00Z",
      assignedToUsername: "owner",
      leadId: "lead-1",
    };

    const created: ActivityDto = {
      id: "act-1",
      subject: payload.subject,
      type: payload.type,
      status: "Open",
      dueAt: payload.dueAt,
      assignedToUsername: payload.assignedToUsername,
      leadId: payload.leadId,
    } as ActivityDto;

    mockApiClient.post.mockResolvedValue(created);

    const result = await crmActivitiesService.createActivity(payload);

    expect(mockApiClient.post).toHaveBeenCalledWith(
      "/crm/api/crm/activities",
      payload,
    );
    expect(result).toEqual(created);
  });

  it("completeActivity should POST to the complete endpoint", async () => {
    const id = "act-1";
    const payload: CompleteActivityDto = { note: "Done" };
    mockApiClient.post.mockResolvedValue({} as ActivityDto);

    await crmActivitiesService.completeActivity(id, payload);

    expect(mockApiClient.post).toHaveBeenCalledWith(
      `/crm/api/crm/activities/${id}/complete`,
      payload,
    );
  });
});

