import { describe, it, expect, vi, beforeEach } from "vitest";
import type {
  PurchaseOrderDto,
  CreateUpdatePurchaseOrderDto,
  ApprovePurchaseOrderDto,
  ReceivePurchaseOrderDto,
  PaginatedResponse,
  QuerySpec,
} from "@/types/api.types";
import { PurchaseOrderStatus } from "@/types/api.types";

const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
};

vi.mock("@/api/clients", () => ({
  getApiClient: () => mockApiClient,
}));

const baseMockOrder: PurchaseOrderDto = {
  id: "1",
  orderNumber: "PO-001",
  supplierId: "supplier-1",
  status: PurchaseOrderStatus.Draft,
  orderDate: "2024-01-01",
  totalAmount: 499.9,
  orderLines: [],
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
  createdBy: "user1",
  updatedBy: "user1",
};

// Import after mocking - services will be instantiated with mocked client
const { purchaseOrdersService } = await import("@/api/services/purchase-orders.service");

describe("PurchaseOrdersService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPurchaseOrders", () => {
    it("should fetch all purchase orders", async () => {
      const mockOrders: PurchaseOrderDto[] = [baseMockOrder];
      mockApiClient.get.mockResolvedValue(mockOrders);

      const result = await purchaseOrdersService.getPurchaseOrders();

      expect(mockApiClient.get).toHaveBeenCalledWith("/purchasing/api/purchasing/orders");
      expect(result).toEqual(mockOrders);
    });
  });

  describe("getPurchaseOrderById", () => {
    it("should fetch purchase order by ID", async () => {
      mockApiClient.get.mockResolvedValue(baseMockOrder);

      const result = await purchaseOrdersService.getPurchaseOrderById("po-1");

      expect(mockApiClient.get).toHaveBeenCalledWith("/purchasing/api/purchasing/orders/po-1");
      expect(result).toEqual(baseMockOrder);
    });
  });

  describe("searchPurchaseOrders", () => {
    it("should search purchase orders with query spec", async () => {
      const querySpec: QuerySpec = { page: 1, pageSize: 20, searchTerm: "PO-001" };
      const mockResponse: PaginatedResponse<PurchaseOrderDto> = {
        items: [baseMockOrder],
        page: 1,
        pageSize: 20,
        total: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await purchaseOrdersService.searchPurchaseOrders(querySpec);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/purchasing/api/purchasing/orders/search",
        { params: querySpec }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getPurchaseOrdersBySupplier", () => {
    it("should fetch purchase orders by supplier ID", async () => {
      const mockOrders: PurchaseOrderDto[] = [baseMockOrder];
      mockApiClient.get.mockResolvedValue(mockOrders);

      const result = await purchaseOrdersService.getPurchaseOrdersBySupplier("supplier-1");

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/purchasing/api/purchasing/orders/supplier/supplier-1"
      );
      expect(result).toEqual(mockOrders);
    });
  });

  describe("getPurchaseOrdersByStatus", () => {
    it("should fetch purchase orders by status", async () => {
      const mockOrders: PurchaseOrderDto[] = [
        { ...baseMockOrder, status: PurchaseOrderStatus.Approved },
      ];
      mockApiClient.get.mockResolvedValue(mockOrders);

      const result = await purchaseOrdersService.getPurchaseOrdersByStatus(
        PurchaseOrderStatus.Approved
      );

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/purchasing/api/purchasing/orders/status/Approved"
      );
      expect(result).toEqual(mockOrders);
    });
  });

  describe("createPurchaseOrder", () => {
    it("should create a new purchase order", async () => {
      const newOrder: CreateUpdatePurchaseOrderDto = {
        orderNumber: "PO-NEW-001",
        supplierId: "supplier-1",
        orderDate: "2024-01-15",
        orderLines: [{ productId: "p1", quantity: 10, unitPrice: 99.99 }],
      };
      const createdOrder: PurchaseOrderDto = { ...baseMockOrder, ...newOrder };
      mockApiClient.post.mockResolvedValue(createdOrder);

      const result = await purchaseOrdersService.createPurchaseOrder(newOrder);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/purchasing/api/purchasing/orders",
        newOrder
      );
      expect(result).toEqual(createdOrder);
    });
  });

  describe("updatePurchaseOrder", () => {
    it("should update a purchase order", async () => {
      const updateData: CreateUpdatePurchaseOrderDto = {
        orderNumber: "PO-001",
        supplierId: "supplier-1",
        orderDate: "2024-01-20",
        orderLines: [],
      };
      const updatedOrder: PurchaseOrderDto = { ...baseMockOrder, ...updateData };
      mockApiClient.put.mockResolvedValue(updatedOrder);

      const result = await purchaseOrdersService.updatePurchaseOrder("po-1", updateData);

      expect(mockApiClient.put).toHaveBeenCalledWith(
        "/purchasing/api/purchasing/orders/po-1",
        updateData
      );
      expect(result).toEqual(updatedOrder);
    });
  });

  describe("updatePurchaseOrderStatus", () => {
    it("should update purchase order status", async () => {
      const updatedOrder = { ...baseMockOrder, status: PurchaseOrderStatus.Approved };
      mockApiClient.patch.mockResolvedValue(updatedOrder);

      const result = await purchaseOrdersService.updatePurchaseOrderStatus(
        "po-1",
        PurchaseOrderStatus.Approved
      );

      expect(mockApiClient.patch).toHaveBeenCalledWith(
        "/purchasing/api/purchasing/orders/po-1/status/Approved"
      );
      expect(result).toEqual(updatedOrder);
    });
  });

  describe("deletePurchaseOrder", () => {
    it("should delete a purchase order", async () => {
      mockApiClient.delete.mockResolvedValue(undefined);

      await purchaseOrdersService.deletePurchaseOrder("po-1");

      expect(mockApiClient.delete).toHaveBeenCalledWith(
        "/purchasing/api/purchasing/orders/po-1"
      );
    });
  });

  describe("approvePurchaseOrder", () => {
    it("should approve a purchase order", async () => {
      const approvalData: ApprovePurchaseOrderDto = {
        purchaseOrderId: "po-1",
        notes: "Approved",
      };
      const mockOrder: PurchaseOrderDto = { ...baseMockOrder, id: "po-1", status: PurchaseOrderStatus.Approved };
      mockApiClient.post.mockResolvedValue(mockOrder);

      const result = await purchaseOrdersService.approvePurchaseOrder("po-1", approvalData);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/purchasing/api/purchasing/orders/po-1/approve",
        approvalData
      );
      expect(result).toEqual(mockOrder);
    });
  });

  describe("receivePurchaseOrder", () => {
    it("should receive a purchase order", async () => {
      const receiveData: ReceivePurchaseOrderDto = {
        purchaseOrderId: "po-1",
        warehouseId: "warehouse-1",
        receivedDate: "2024-01-15",
        lines: [{ purchaseOrderLineId: "line-1", receivedQuantity: 10 }],
      };
      const mockOrder: PurchaseOrderDto = {
        ...baseMockOrder,
        id: "po-1",
        status: PurchaseOrderStatus.Received,
        updatedAt: "2024-01-15",
      };
      mockApiClient.post.mockResolvedValue(mockOrder);

      const result = await purchaseOrdersService.receivePurchaseOrder("po-1", receiveData);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/purchasing/api/purchasing/orders/po-1/receive",
        receiveData
      );
      expect(result).toEqual(mockOrder);
    });
  });

  describe("exportToXlsx", () => {
    it("should export purchase orders to XLSX", async () => {
      const mockBlob = new Blob(["xlsx"], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      mockApiClient.get.mockResolvedValue(mockBlob);

      const result = await purchaseOrdersService.exportToXlsx();

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/purchasing/api/purchasing/orders/export-xlsx",
        { responseType: "blob" }
      );
      expect(result).toBe(mockBlob);
    });
  });

  describe("exportToPdf", () => {
    it("should export purchase orders to PDF", async () => {
      const mockBlob = new Blob(["pdf"], { type: "application/pdf" });
      mockApiClient.get.mockResolvedValue(mockBlob);

      const result = await purchaseOrdersService.exportToPdf();

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/purchasing/api/purchasing/orders/export-pdf",
        { responseType: "blob" }
      );
      expect(result).toBe(mockBlob);
    });
  });
});
