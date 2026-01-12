import { describe, it, expect, vi, beforeEach } from "vitest";
import type {
  PurchaseOrderDto,
  ApprovePurchaseOrderDto,
  ReceivePurchaseOrderDto,
} from "@/types/api.types";

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

// Import after mocking - services will be instantiated with mocked client
const { purchaseOrdersService } = await import("@/api/services/purchase-orders.service");

describe("PurchaseOrdersService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPurchaseOrders", () => {
    it("should fetch all purchase orders", async () => {
      const mockOrders: PurchaseOrderDto[] = [
        {
          id: "1",
          orderNumber: "PO-001",
          supplierId: "supplier-1",
          status: "Draft",
          orderDate: "2024-01-01",
          totalAmount: 499.90,
          orderLines: [],
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
          createdBy: "user1",
          updatedBy: "user1",
        },
      ];

      mockApiClient.get.mockResolvedValue(mockOrders);

      const result = await purchaseOrdersService.getPurchaseOrders();

      expect(mockApiClient.get).toHaveBeenCalledWith("/purchasing/api/purchasing/orders");
      expect(result).toEqual(mockOrders);
    });
  });

  describe("approvePurchaseOrder", () => {
    it("should approve a purchase order", async () => {
      const approvalData: ApprovePurchaseOrderDto = {
        purchaseOrderId: "po-1",
        approvedBy: "user-1",
        approvalDate: "2024-01-01",
      };

      const mockOrder: PurchaseOrderDto = {
        id: "po-1",
        orderNumber: "PO-001",
        supplierId: "supplier-1",
        status: "Approved",
        orderDate: "2024-01-01",
        totalAmount: 499.90,
        orderLines: [],
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
        createdBy: "user1",
        updatedBy: "user1",
      };

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
        receivedItems: [
          {
            productId: "product-1",
            quantity: 10,
            warehouseId: "warehouse-1",
          },
        ],
      };

      const mockOrder: PurchaseOrderDto = {
        id: "po-1",
        orderNumber: "PO-001",
        supplierId: "supplier-1",
        status: "Received",
        orderDate: "2024-01-01",
        totalAmount: 499.90,
        orderLines: [],
        createdAt: "2024-01-01",
        updatedAt: "2024-01-15",
        createdBy: "user1",
        updatedBy: "user1",
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
});
