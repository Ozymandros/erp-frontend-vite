import { describe, it, expect, vi, beforeEach } from "vitest";
import type {
  EntityChangeDto,
  PaginatedResponse,
  QuerySpec,
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

const {
  auditEntityChangesService,
  buildEntityChangeListQueryParams,
} = await import("@/api/services/audit-entity-changes.service");

describe("buildEntityChangeListQueryParams", () => {
  it("maps pagination, sort, search, and Filters[key] params", () => {
    const params: QuerySpec = {
      page: 2,
      pageSize: 20,
      sortBy: "createdAt",
      sortDesc: true,
      searchFields: "entityName,createdBy",
      searchTerm: "admin",
      filters: {
        entityName: "User",
        changeType: "Updated",
        empty: "",
      },
    };

    expect(buildEntityChangeListQueryParams(params)).toEqual({
      page: 2,
      pageSize: 20,
      sortBy: "createdAt",
      sortDesc: true,
      searchFields: "entityName,createdBy",
      searchTerm: "admin",
      "Filters[entityName]": "User",
      "Filters[changeType]": "Updated",
    });
  });

  it("returns empty object when params are undefined", () => {
    expect(buildEntityChangeListQueryParams()).toEqual({});
  });
});

describe("AuditEntityChangesService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("searchEntityChanges", () => {
    it("should fetch paginated entity changes with transformed params", async () => {
      const querySpec: QuerySpec = {
        page: 1,
        pageSize: 20,
        searchTerm: "User",
        filters: { entityName: "User" },
      };

      const mockResponse: PaginatedResponse<EntityChangeDto> = {
        items: [],
        page: 1,
        pageSize: 20,
        total: 0,
        hasNextPage: false,
        hasPreviousPage: false,
        totalPages: 0,
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await auditEntityChangesService.searchEntityChanges(
        querySpec,
      );

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/audit/api/audit/entity-changes",
        {
          params: {
            page: 1,
            pageSize: 20,
            searchTerm: "User",
            "Filters[entityName]": "User",
          },
        },
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getEntityChangeById", () => {
    it("should fetch entity change by id", async () => {
      const mockChange: EntityChangeDto = {
        id: "ec-1",
        entityName: "User",
        entityId: "550e8400-e29b-41d4-a716-446655440000",
        changeType: "Updated",
        originalValue: '{"email":"old@example.com"}',
        newValue: '{"email":"new@example.com"}',
        createdAt: "2025-01-15T10:00:00Z",
        createdBy: "admin",
        updatedAt: "2025-01-15T10:00:00Z",
        updatedBy: null,
        propertyChanges: [],
      };

      mockApiClient.get.mockResolvedValue(mockChange);

      const result = await auditEntityChangesService.getEntityChangeById("ec-1");

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/audit/api/audit/entity-changes/ec-1",
      );
      expect(result).toEqual(mockChange);
    });
  });

  describe("getByEntity", () => {
    it("should fetch entity changes by entity name and id", async () => {
      const mockChanges: EntityChangeDto[] = [];

      mockApiClient.get.mockResolvedValue(mockChanges);

      const result = await auditEntityChangesService.getByEntity(
        "User",
        "550e8400-e29b-41d4-a716-446655440000",
      );

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/audit/api/audit/entity-changes/by-entity/User/550e8400-e29b-41d4-a716-446655440000",
      );
      expect(result).toEqual(mockChanges);
    });
  });
});
