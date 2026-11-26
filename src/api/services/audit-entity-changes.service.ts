import { getApiClient } from "../clients";
import { AUDIT_ENDPOINTS } from "../constants/endpoints";
import type {
  EntityChangeDto,
  PaginatedResponse,
  QuerySpec,
} from "@/types/api.types";

/** Builds flat query params for audit list API (including Filters[key]). */
export function buildEntityChangeListQueryParams(
  params?: QuerySpec,
): Record<string, string | number | boolean> {
  const query: Record<string, string | number | boolean> = {};

  if (!params) {
    return query;
  }

  if (params.page != null) {
    query["page"] = params.page;
  }
  if (params.pageSize != null) {
    query["pageSize"] = params.pageSize;
  }
  if (params.sortBy) {
    query["sortBy"] = params.sortBy;
  }
  if (params.sortDesc != null) {
    query["sortDesc"] = params.sortDesc;
  }
  if (params.searchFields) {
    query["searchFields"] = params.searchFields;
  }
  if (params.searchTerm) {
    query["searchTerm"] = params.searchTerm;
  }

  if (params.filters) {
    for (const [key, value] of Object.entries(params.filters)) {
      if (value !== "" && value != null) {
        query[`Filters[${key}]`] = value;
      }
    }
  }

  return query;
}

class AuditEntityChangesService {
  private readonly apiClient = getApiClient();

  async searchEntityChanges(
    query: QuerySpec,
  ): Promise<PaginatedResponse<EntityChangeDto>> {
    const params = buildEntityChangeListQueryParams(query);
    return this.apiClient.get<PaginatedResponse<EntityChangeDto>>(
      AUDIT_ENDPOINTS.ENTITY_CHANGES,
      { params },
    );
  }

  async getEntityChangeById(id: string): Promise<EntityChangeDto> {
    return this.apiClient.get<EntityChangeDto>(AUDIT_ENDPOINTS.BY_ID(id));
  }

  async getByEntity(
    entityName: string,
    entityId: string,
  ): Promise<EntityChangeDto[]> {
    return this.apiClient.get<EntityChangeDto[]>(
      AUDIT_ENDPOINTS.BY_ENTITY(entityName, entityId),
    );
  }
}

export const auditEntityChangesService = new AuditEntityChangesService();
