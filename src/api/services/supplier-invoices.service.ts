import { getApiClient } from "../clients";
import { SUPPLIER_INVOICES_ENDPOINTS } from "../constants/endpoints";
import type {
  CreateSupplierInvoiceDto,
  SupplierInvoiceDto,
} from "@/types/api.types";

class SupplierInvoicesService {
  private readonly apiClient = getApiClient();

  async getSupplierInvoices(): Promise<SupplierInvoiceDto[]> {
    return this.apiClient.get<SupplierInvoiceDto[]>(
      SUPPLIER_INVOICES_ENDPOINTS.BASE
    );
  }

  async getSupplierInvoiceById(id: string): Promise<SupplierInvoiceDto> {
    return this.apiClient.get<SupplierInvoiceDto>(
      SUPPLIER_INVOICES_ENDPOINTS.BY_ID(id)
    );
  }

  async getSupplierInvoicesByPurchaseOrder(
    purchaseOrderId: string
  ): Promise<SupplierInvoiceDto[]> {
    return this.apiClient.get<SupplierInvoiceDto[]>(
      SUPPLIER_INVOICES_ENDPOINTS.BY_PO(purchaseOrderId)
    );
  }

  async createSupplierInvoice(
    data: CreateSupplierInvoiceDto
  ): Promise<SupplierInvoiceDto> {
    return this.apiClient.post<SupplierInvoiceDto>(
      SUPPLIER_INVOICES_ENDPOINTS.BASE,
      data
    );
  }
}

export const supplierInvoicesService = new SupplierInvoicesService();
