import { getApiClient } from "../clients";
import { projectPostingEndpoints } from "../constants/endpoints";
import type {
  ConsumptionOrderDto,
  CreateInvoiceRequestDto,
  CreateItemConsumptionDto,
  InvoiceRequestDto,
  PostUsageDto,
  ProjectLedgerEntryDto,
} from "@/types/api.types";

class ProjectPostingService {
  private readonly apiClient = getApiClient();

  async getLedgerEntries(
    projectId: string,
    taskId?: string
  ): Promise<ProjectLedgerEntryDto[]> {
    const endpoints = projectPostingEndpoints(projectId);
    return this.apiClient.get<ProjectLedgerEntryDto[]>(endpoints.LEDGER, {
      params: taskId ? { taskId } : undefined,
    });
  }

  async postUsage(
    projectId: string,
    data: PostUsageDto
  ): Promise<ProjectLedgerEntryDto> {
    const endpoints = projectPostingEndpoints(projectId);
    return this.apiClient.post<ProjectLedgerEntryDto>(endpoints.USAGE, data);
  }

  async getItemConsumptionOrders(
    projectId: string
  ): Promise<ConsumptionOrderDto[]> {
    const endpoints = projectPostingEndpoints(projectId);
    return this.apiClient.get<ConsumptionOrderDto[]>(
      endpoints.ITEM_CONSUMPTION
    );
  }

  async createItemConsumption(
    projectId: string,
    data: CreateItemConsumptionDto
  ): Promise<ConsumptionOrderDto> {
    const endpoints = projectPostingEndpoints(projectId);
    return this.apiClient.post<ConsumptionOrderDto>(
      endpoints.ITEM_CONSUMPTION,
      data
    );
  }

  async getInvoiceRequests(projectId: string): Promise<InvoiceRequestDto[]> {
    const endpoints = projectPostingEndpoints(projectId);
    return this.apiClient.get<InvoiceRequestDto[]>(
      endpoints.INVOICE_REQUESTS
    );
  }

  async createInvoiceRequest(
    projectId: string,
    data: CreateInvoiceRequestDto
  ): Promise<InvoiceRequestDto> {
    const endpoints = projectPostingEndpoints(projectId);
    return this.apiClient.post<InvoiceRequestDto>(
      endpoints.INVOICE_REQUESTS,
      data
    );
  }

  async exportLedgerToXlsx(projectId: string): Promise<Blob> {
    const endpoints = projectPostingEndpoints(projectId);
    return this.apiClient.get<Blob>(endpoints.LEDGER_EXPORT_XLSX, {
      responseType: "blob",
    });
  }

  async exportLedgerToPdf(projectId: string): Promise<Blob> {
    const endpoints = projectPostingEndpoints(projectId);
    return this.apiClient.get<Blob>(endpoints.LEDGER_EXPORT_PDF, {
      responseType: "blob",
    });
  }
}

export const projectPostingService = new ProjectPostingService();
