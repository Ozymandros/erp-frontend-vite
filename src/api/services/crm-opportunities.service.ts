import { getApiClient } from "../clients";
import { OPPORTUNITIES_ENDPOINTS } from "../constants/endpoints";
import type {
  OpportunityDto,
  CreateOpportunityDto,
  UpdateOpportunityForecastDto,
  MoveOpportunityStageDto,
  MarkOpportunityLostDto,
  MarkOpportunityWonRequest,
  PaginatedResponse,
  QuerySpec,
  OpportunityLineDto,
  CreateOpportunityLineDto,
  UpdateOpportunityLineDto,
  ForecastSummaryDto,
} from "@/types/api.types";

class CrmOpportunitiesService {
  private readonly apiClient = getApiClient();

  async searchOpportunities(
    querySpec: QuerySpec,
  ): Promise<PaginatedResponse<OpportunityDto>> {
    return this.apiClient.get<PaginatedResponse<OpportunityDto>>(
      OPPORTUNITIES_ENDPOINTS.BASE,
      { params: querySpec },
    );
  }

  async getOpportunityById(id: string): Promise<OpportunityDto> {
    return this.apiClient.get<OpportunityDto>(
      OPPORTUNITIES_ENDPOINTS.BY_ID(id),
    );
  }

  async createOpportunity(
    data: CreateOpportunityDto,
  ): Promise<OpportunityDto> {
    return this.apiClient.post<OpportunityDto>(OPPORTUNITIES_ENDPOINTS.BASE, data);
  }

  async updateOpportunityForecast(
    id: string,
    data: UpdateOpportunityForecastDto,
  ): Promise<OpportunityDto> {
    return this.apiClient.put<OpportunityDto>(
      OPPORTUNITIES_ENDPOINTS.UPDATE_FORECAST(id),
      data,
    );
  }

  async moveOpportunityStage(
    id: string,
    data: MoveOpportunityStageDto,
  ): Promise<OpportunityDto> {
    return this.apiClient.post<OpportunityDto>(
      OPPORTUNITIES_ENDPOINTS.MOVE_STAGE(id),
      data,
    );
  }

  async markOpportunityWon(
    id: string,
    data: MarkOpportunityWonRequest,
  ): Promise<OpportunityDto> {
    return this.apiClient.post<OpportunityDto>(
      OPPORTUNITIES_ENDPOINTS.MARK_WON(id),
      data,
    );
  }

  async markOpportunityLost(
    id: string,
    data: MarkOpportunityLostDto,
  ): Promise<OpportunityDto> {
    return this.apiClient.post<OpportunityDto>(
      OPPORTUNITIES_ENDPOINTS.MARK_LOST(id),
      data,
    );
  }

  async getForecastSummary(params: {
    ownerUsername?: string;
    fromExpectedCloseDate?: string;
    toExpectedCloseDate?: string;
  }): Promise<ForecastSummaryDto> {
    return this.apiClient.get<ForecastSummaryDto>(OPPORTUNITIES_ENDPOINTS.FORECAST, {
      params,
    });
  }

  async addOpportunityLine(
    opportunityId: string,
    data: CreateOpportunityLineDto,
  ): Promise<OpportunityLineDto> {
    return this.apiClient.post<OpportunityLineDto>(
      OPPORTUNITIES_ENDPOINTS.LINES_BASE(opportunityId),
      data,
    );
  }

  async updateOpportunityLine(
    opportunityId: string,
    lineId: string,
    data: UpdateOpportunityLineDto,
  ): Promise<OpportunityLineDto> {
    return this.apiClient.put<OpportunityLineDto>(
      OPPORTUNITIES_ENDPOINTS.LINE_BY_ID(opportunityId, lineId),
      data,
    );
  }

  async removeOpportunityLine(
    opportunityId: string,
    lineId: string,
  ): Promise<void> {
    return this.apiClient.delete<void>(
      OPPORTUNITIES_ENDPOINTS.LINE_BY_ID(opportunityId, lineId),
    );
  }
}

export const crmOpportunitiesService = new CrmOpportunitiesService();

