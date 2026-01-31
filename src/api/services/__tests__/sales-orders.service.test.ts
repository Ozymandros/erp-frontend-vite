import { describe, it, expect, vi, beforeEach } from "vitest";
import type {
  SalesOrderDto,
  CreateUpdateSalesOrderDto,
  CreateQuoteDto,
  ConfirmQuoteDto,
  ConfirmQuoteResponseDto,
  StockAvailabilityCheckDto,
} from "@/types/api.types";
import { SalesOrderStatus } from "@/types/api.types";

const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

vi.mock("@/api/clients", () => ({
  getApiClient: () => mockApiClient,
}));

// Import after mocking - services will be instantiated with mocked client
const { salesOrdersService } = await import("@/api/services/sales-orders.service");

describe("SalesOrdersService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getSalesOrders", () => {
    it("should fetch all sales orders", async () => {
      const mockOrders: SalesOrderDto[] = [
        {
          id: "1",
          orderNumber: "SO-001",
          customerId: "customer-1",
          status: SalesOrderStatus.Draft,
          orderDate: "2024-01-01",
          totalAmount: 499.95,
          orderLines: [],
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
          createdBy: "user1",
          updatedBy: "user1",
          isQuote: false,
        },
      ];

      mockApiClient.get.mockResolvedValue(mockOrders);

      const result = await salesOrdersService.getSalesOrders();

      expect(mockApiClient.get).toHaveBeenCalledWith("/sales/api/sales/orders");
      expect(result).toEqual(mockOrders);
    });
  });

  describe("createSalesOrder", () => {
    it("should create a new sales order", async () => {
      const newOrder: CreateUpdateSalesOrderDto = {
        customerId: "customer-1",
        orderNumber: "SO-NEW-001",
        orderDate: "2024-01-01",
        orderLines: [
          {
            productId: "product-1",
            quantity: 5,
            unitPrice: 99.99,
          },
        ],
      };

      const mockOrder: SalesOrderDto = {
        id: "1",
        ...newOrder,
        status: SalesOrderStatus.Draft,
        totalAmount: 499.95,
        orderLines: newOrder.orderLines?.map(line => ({
          ...line,
          id: `line-${line.productId}`,
          salesOrderId: "1",
          totalPrice: (line.quantity || 0) * (line.unitPrice || 0),
          lineTotal: (line.quantity || 0) * (line.unitPrice || 0),
        })),
        isQuote: false,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
        createdBy: "user1",
        updatedBy: "user1",
      };

      mockApiClient.post.mockResolvedValue(mockOrder);

      const result = await salesOrdersService.createSalesOrder(newOrder);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/sales/api/sales/orders",
        newOrder
      );
      expect(result).toEqual(mockOrder);
    });
  });

  describe("createQuote", () => {
    it("should create a quote", async () => {
      const quoteData: CreateQuoteDto = {
        customerId: "customer-1",
        orderNumber: "QUOTE-NEW-001",
        orderDate: "2024-01-01",
        orderLines: [
          {
            productId: "product-1",
            quantity: 5,
            unitPrice: 99.99,
          },
        ],
        validityDays: 30,
      };

      const mockOrder: SalesOrderDto = {
        id: "1",
        orderNumber: "QUOTE-001",
        customerId: quoteData.customerId,
        status: SalesOrderStatus.Quote,
        orderDate: "2024-01-01",
        totalAmount: 499.95,
        orderLines: [],
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
        createdBy: "user1",
        updatedBy: "user1",
        isQuote: true,
      };

      mockApiClient.post.mockResolvedValue(mockOrder);

      const result = await salesOrdersService.createQuote(quoteData);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/sales/api/sales/orders/quotes",
        quoteData
      );
      expect(result).toEqual(mockOrder);
    });
  });

  describe("confirmQuote", () => {
    it("should confirm a quote", async () => {
      const confirmData: ConfirmQuoteDto = {
        quoteId: "quote-1",
        warehouseId: "warehouse-1",
      };

      const mockResponse: ConfirmQuoteResponseDto = {
        convertedToOrderId: "order-1",
        salesOrder: {
          id: "order-1",
          orderNumber: "SO-001",
          customerId: "customer-1",
          status: SalesOrderStatus.Confirmed,
          orderDate: "2024-01-01",
          totalAmount: 499.95,
          orderLines: [],
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
          createdBy: "user1",
          updatedBy: "user1",
          isQuote: false,
        },
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await salesOrdersService.confirmQuote("quote-1", confirmData);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/sales/api/sales/orders/quotes/quote-1/confirm",
        confirmData
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("checkStockAvailability", () => {
    it("should check stock availability for order lines", async () => {
      const orderLines = [
        {
          productId: "product-1",
          quantity: 5,
          unitPrice: 99.99,
        },
      ];

      const mockAvailability: StockAvailabilityCheckDto[] = [
        {
          productId: "product-1",
          requestedQuantity: 5,
          availableQuantity: 10,
          isAvailable: true,
          warehouseStock: [
            {
              warehouseId: "warehouse-1",
              warehouseName: "Warehouse 1",
              availableQuantity: 10,
            }
          ]
        },
      ];

      mockApiClient.post.mockResolvedValue(mockAvailability);

      const result = await salesOrdersService.checkStockAvailability(orderLines);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/sales/api/sales/orders/quotes/check-availability",
        orderLines
      );
      expect(result).toEqual(mockAvailability);
    });
  });

  describe("searchSalesOrders", () => {
    it("should search sales orders with query spec", async () => {
      const querySpec: QuerySpec = {
        page: 1,
        pageSize: 10,
        searchTerm: "SO-001",
      };
      const mockResponse: PaginatedResponse<SalesOrderDto> = {
        items: [],
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await salesOrdersService.searchSalesOrders(querySpec);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/sales/api/sales/orders/search",
        { params: querySpec }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getSalesOrderById", () => {
    it("should fetch sales order by ID", async () => {
      const mockOrder: SalesOrderDto = {
        id: "1",
        orderNumber: "SO-001",
        customerId: "customer-1",
        status: SalesOrderStatus.Draft,
        orderDate: "2024-01-01",
        totalAmount: 499.95,
        orderLines: [],
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
        createdBy: "user1",
        updatedBy: "user1",
        isQuote: false,
      };

      mockApiClient.get.mockResolvedValue(mockOrder);

      const result = await salesOrdersService.getSalesOrderById("1");

      expect(mockApiClient.get).toHaveBeenCalledWith("/sales/api/sales/orders/1");
      expect(result).toEqual(mockOrder);
    });
  });

  describe("updateSalesOrder", () => {
    it("should update a sales order", async () => {
      const updateData: CreateUpdateSalesOrderDto = {
        customerId: "customer-2",
        orderDate: "2024-01-02",
        orderLines: [],
      };
      const mockOrder: SalesOrderDto = {
        id: "1",
        ...updateData,
        orderNumber: "SO-001",
        status: SalesOrderStatus.Draft,
        totalAmount: 0,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
        createdBy: "user1",
        updatedBy: "user1",
        isQuote: false,
      };

      mockApiClient.put.mockResolvedValue(mockOrder);

      const result = await salesOrdersService.updateSalesOrder("1", updateData);

      expect(mockApiClient.put).toHaveBeenCalledWith(
        "/sales/api/sales/orders/1",
        updateData
      );
      expect(result).toEqual(mockOrder);
    });
  });

  describe("deleteSalesOrder", () => {
    it("should delete a sales order", async () => {
      mockApiClient.delete.mockResolvedValue(undefined);

      await salesOrdersService.deleteSalesOrder("1");

      expect(mockApiClient.delete).toHaveBeenCalledWith("/sales/api/sales/orders/1");
    });
  });

  describe("exportToXlsx", () => {
    it("should export sales orders to xlsx", async () => {
      const mockBlob = new Blob(["xlsx data"]);
      mockApiClient.get.mockResolvedValue(mockBlob);

      const result = await salesOrdersService.exportToXlsx();

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/sales/api/sales/orders/export-xlsx",
        { responseType: "blob" }
      );
      expect(result).toEqual(mockBlob);
    });
  });

  describe("exportToPdf", () => {
    it("should export sales orders to pdf", async () => {
      const mockBlob = new Blob(["pdf data"]);
      mockApiClient.get.mockResolvedValue(mockBlob);

      const result = await salesOrdersService.exportToPdf();

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/sales/api/sales/orders/export-pdf",
        { responseType: "blob" }
      );
      expect(result).toEqual(mockBlob);
    });
  });
});
