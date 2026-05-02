import { getApiClient } from "../clients";
import { LEADS_ENDPOINTS } from "../constants/endpoints";
import type {
  LeadDto,
  CreateLeadDto,
  UpdateLeadDto,
  QualifyLeadDto,
  PaginatedResponse,
  QuerySpec,
} from "@/types/api.types";

class LeadsService {
  private readonly apiClient = getApiClient();

  async searchLeads(
    querySpec: QuerySpec,
  ): Promise<PaginatedResponse<LeadDto>> {
    return this.apiClient.get<PaginatedResponse<LeadDto>>(
      LEADS_ENDPOINTS.BASE,
      { params: querySpec },
    );
  }

  async getLeadById(id: string): Promise<LeadDto> {
    return this.apiClient.get<LeadDto>(LEADS_ENDPOINTS.BY_ID(id));
  }

  async createLead(data: CreateLeadDto): Promise<LeadDto> {
    return this.apiClient.post<LeadDto>(LEADS_ENDPOINTS.BASE, data);
  }

  async updateLead(id: string, data: UpdateLeadDto): Promise<LeadDto> {
    return this.apiClient.put<LeadDto>(LEADS_ENDPOINTS.BY_ID(id), data);
  }

  async deleteLead(id: string): Promise<void> {
    return this.apiClient.delete<void>(LEADS_ENDPOINTS.BY_ID(id));
  }

  async qualifyLead(id: string, data: QualifyLeadDto): Promise<void> {
    return this.apiClient.post<void>(LEADS_ENDPOINTS.QUALIFY(id), data);
  }
}

export const leadsService = new LeadsService();

