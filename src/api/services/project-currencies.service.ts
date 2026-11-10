import { getApiClient } from "../clients";
import { PROJECT_CURRENCIES_ENDPOINTS } from "../constants/endpoints";
import type {
  CreateExchangeRateDto,
  CreateUpdateCurrencyDto,
  ProjectCurrencyDto,
} from "@/types/api.types";

class ProjectCurrenciesService {
  private readonly apiClient = getApiClient();

  async getCurrencies(): Promise<ProjectCurrencyDto[]> {
    return this.apiClient.get<ProjectCurrencyDto[]>(
      PROJECT_CURRENCIES_ENDPOINTS.BASE
    );
  }

  async getCurrencyByCode(code: string): Promise<ProjectCurrencyDto> {
    return this.apiClient.get<ProjectCurrencyDto>(
      PROJECT_CURRENCIES_ENDPOINTS.BY_CODE(code)
    );
  }

  async createCurrency(
    data: CreateUpdateCurrencyDto
  ): Promise<ProjectCurrencyDto> {
    return this.apiClient.post<ProjectCurrencyDto>(
      PROJECT_CURRENCIES_ENDPOINTS.BASE,
      data
    );
  }

  async updateCurrency(
    code: string,
    data: CreateUpdateCurrencyDto
  ): Promise<ProjectCurrencyDto> {
    return this.apiClient.put<ProjectCurrencyDto>(
      PROJECT_CURRENCIES_ENDPOINTS.BY_CODE(code),
      data
    );
  }

  async deleteCurrency(code: string): Promise<void> {
    return this.apiClient.delete<void>(
      PROJECT_CURRENCIES_ENDPOINTS.BY_CODE(code)
    );
  }

  async getRate(code: string, date?: string): Promise<number> {
    return this.apiClient.get<number>(PROJECT_CURRENCIES_ENDPOINTS.RATE(code), {
      params: date ? { date } : undefined,
    });
  }

  async createExchangeRate(
    code: string,
    data: CreateExchangeRateDto
  ): Promise<ProjectCurrencyDto> {
    return this.apiClient.post<ProjectCurrencyDto>(
      PROJECT_CURRENCIES_ENDPOINTS.EXCHANGE_RATES(code),
      data
    );
  }

  async deleteExchangeRate(code: string, rateId: string): Promise<void> {
    return this.apiClient.delete<void>(
      PROJECT_CURRENCIES_ENDPOINTS.EXCHANGE_RATE_BY_ID(code, rateId)
    );
  }

  async exportToXlsx(): Promise<Blob> {
    return this.apiClient.get<Blob>(PROJECT_CURRENCIES_ENDPOINTS.EXPORT_XLSX, {
      responseType: "blob",
    });
  }

  async exportToPdf(): Promise<Blob> {
    return this.apiClient.get<Blob>(PROJECT_CURRENCIES_ENDPOINTS.EXPORT_PDF, {
      responseType: "blob",
    });
  }
}

export const projectCurrenciesService = new ProjectCurrenciesService();
