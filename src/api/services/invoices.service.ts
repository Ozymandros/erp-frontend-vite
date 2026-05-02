import { getApiClient } from "../clients";
import {
  CREDIT_NOTES_ENDPOINTS,
  INVOICES_ENDPOINTS,
  PAYMENTS_ENDPOINTS,
} from "../constants/endpoints";
import type {
  CancelInvoiceRequest,
  CreateCreditNoteDto,
  CreateInvoiceDto,
  CreditNoteDto,
  InvoiceDto,
  IssueInvoiceRequest,
  PaginatedResponse,
  PaymentDto,
  QuerySpec,
  RecordPaymentDto,
} from "@/types/api.types";

class InvoicesService {
  private readonly apiClient = getApiClient();

  async getInvoices(): Promise<InvoiceDto[]> {
    return this.apiClient.get<InvoiceDto[]>(INVOICES_ENDPOINTS.BASE);
  }

  async searchInvoices(
    querySpec: QuerySpec
  ): Promise<PaginatedResponse<InvoiceDto>> {
    return this.apiClient.get<PaginatedResponse<InvoiceDto>>(
      INVOICES_ENDPOINTS.SEARCH,
      {
        params: querySpec,
      }
    );
  }

  async getInvoiceById(id: string): Promise<InvoiceDto> {
    return this.apiClient.get<InvoiceDto>(INVOICES_ENDPOINTS.BY_ID(id));
  }

  async getInvoicesByCustomer(customerId: string): Promise<InvoiceDto[]> {
    return this.apiClient.get<InvoiceDto[]>(
      INVOICES_ENDPOINTS.BY_CUSTOMER(customerId)
    );
  }

  async getInvoicesByOrder(orderId: string): Promise<InvoiceDto[]> {
    return this.apiClient.get<InvoiceDto[]>(INVOICES_ENDPOINTS.BY_ORDER(orderId));
  }

  async createInvoice(data: CreateInvoiceDto): Promise<InvoiceDto> {
    return this.apiClient.post<InvoiceDto>(INVOICES_ENDPOINTS.BASE, data);
  }

  async issueInvoice(id: string, data: IssueInvoiceRequest): Promise<InvoiceDto> {
    return this.apiClient.post<InvoiceDto>(INVOICES_ENDPOINTS.ISSUE(id), data);
  }

  async recordPayment(id: string, data: RecordPaymentDto): Promise<InvoiceDto> {
    return this.apiClient.post<InvoiceDto>(INVOICES_ENDPOINTS.PAYMENTS(id), data);
  }

  async cancelInvoice(id: string, data: CancelInvoiceRequest): Promise<InvoiceDto> {
    return this.apiClient.post<InvoiceDto>(INVOICES_ENDPOINTS.CANCEL(id), data);
  }

  async createCreditNote(
    id: string,
    data: CreateCreditNoteDto
  ): Promise<CreditNoteDto> {
    return this.apiClient.post<CreditNoteDto>(
      INVOICES_ENDPOINTS.CREDIT_NOTES(id),
      data
    );
  }

  async getPaymentsByInvoice(invoiceId: string): Promise<PaymentDto[]> {
    return this.apiClient.get<PaymentDto[]>(
      PAYMENTS_ENDPOINTS.BY_INVOICE(invoiceId)
    );
  }

  async getCreditNotesByInvoice(invoiceId: string): Promise<CreditNoteDto[]> {
    return this.apiClient.get<CreditNoteDto[]>(
      CREDIT_NOTES_ENDPOINTS.BY_INVOICE(invoiceId)
    );
  }

  async exportToXlsx(): Promise<Blob> {
    return this.apiClient.get<Blob>(INVOICES_ENDPOINTS.EXPORT_XLSX, {
      responseType: "blob",
    });
  }

  async exportToPdf(): Promise<Blob> {
    return this.apiClient.get<Blob>(INVOICES_ENDPOINTS.EXPORT_PDF, {
      responseType: "blob",
    });
  }
}

export const invoicesService = new InvoicesService();
