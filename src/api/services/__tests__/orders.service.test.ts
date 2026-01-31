import { describe, it, expect, vi, beforeEach } from "vitest";
import type {
  OrderDto,
  CreateUpdateOrderDto,
  CreateOrderWithReservationDto,
  FulfillOrderDto,
  CancelOrderDto,
} from "@/types/api.types";

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
const { ordersService } = await import("@/api/services/orders.service");

describe("OrdersService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getOrders", () => {
    it("should fetch all orders", async () => {
      const mockOrders: OrderDto[] = [
        {
          id: "1",
          customerId: "cust1",
        } as OrderDto,
      ];

      mockApiClient.get.mockResolvedValue(mockOrders);

      const result = await ordersService.getOrders();

      expect(mockApiClient.get).toHaveBeenCalledWith("/orders/api/orders");
      expect(result).toEqual(mockOrders);
    });
  });

  describe("getOrderById", () => {
    it("should fetch order by ID", async () => {
      const mockOrder: OrderDto = {
        id: "1",
        customerId: "cust1",
      } as OrderDto;

      mockApiClient.get.mockResolvedValue(mockOrder);

      const result = await ordersService.getOrderById("1");

      expect(mockApiClient.get).toHaveBeenCalledWith("/orders/api/orders/1");
      expect(result).toEqual(mockOrder);
    });
  });

  describe("createOrder", () => {
    it("should create a new order", async () => {
      const newOrder: CreateUpdateOrderDto = {
        customerId: "cust1",
        orderDate: "2024-01-01",
        orderLines: [],
      };

      const mockOrder: OrderDto = {
        id: "2",
        ...newOrder,
      } as OrderDto;

      mockApiClient.post.mockResolvedValue(mockOrder);

      const result = await ordersService.createOrder(newOrder);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/orders/api/orders",
        newOrder
      );
      expect(result).toEqual(mockOrder);
    });
  });

  describe("updateOrder", () => {
    it("should update an existing order", async () => {
      const updateData: CreateUpdateOrderDto = {
        customerId: "cust2",
        orderDate: "2024-01-02",
        orderLines: [],
      };

      mockApiClient.put.mockResolvedValue(undefined);

      await ordersService.updateOrder("1", updateData);

      expect(mockApiClient.put).toHaveBeenCalledWith(
        "/orders/api/orders/1",
        updateData
      );
    });
  });

  describe("deleteOrder", () => {
    it("should delete an order", async () => {
      mockApiClient.delete.mockResolvedValue(undefined);

      await ordersService.deleteOrder("1");

      expect(mockApiClient.delete).toHaveBeenCalledWith("/orders/api/orders/1");
    });
  });

  describe("createOrderWithReservation", () => {
    it("should create order with reservation", async () => {
      const data: CreateOrderWithReservationDto = {
        customerId: "cust1",
        orderDate: "2024-01-01",
        orderLines: [],
      } as CreateOrderWithReservationDto;

      const mockOrder: OrderDto = {
        id: "3",
        customerId: "cust1",
      } as OrderDto;

      mockApiClient.post.mockResolvedValue(mockOrder);

      const result = await ordersService.createOrderWithReservation(data);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/orders/api/orders/with-reservation",
        data
      );
      expect(result).toEqual(mockOrder);
    });
  });

  describe("fulfillOrder", () => {
    it("should fulfill an order", async () => {
      const data: FulfillOrderDto = {
        orderId: "1",
      } as FulfillOrderDto;

      const mockOrder: OrderDto = {
        id: "1",
        customerId: "cust1",
      } as OrderDto;

      mockApiClient.post.mockResolvedValue(mockOrder);

      const result = await ordersService.fulfillOrder(data);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/orders/api/orders/fulfill",
        data
      );
      expect(result).toEqual(mockOrder);
    });
  });

  describe("cancelOrder", () => {
    it("should cancel an order", async () => {
      const data: CancelOrderDto = {
        orderId: "1",
      } as CancelOrderDto;

      mockApiClient.post.mockResolvedValue(undefined);

      await ordersService.cancelOrder(data);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/orders/api/orders/cancel",
        data
      );
    });
  });

  describe("exportToXlsx", () => {
    it("should export orders to xlsx", async () => {
      const mockBlob = new Blob(["xlsx data"]);
      mockApiClient.get.mockResolvedValue(mockBlob);

      const result = await ordersService.exportToXlsx();

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/orders/api/orders/export-xlsx",
        { responseType: "blob" }
      );
      expect(result).toEqual(mockBlob);
    });
  });

  describe("exportToPdf", () => {
    it("should export orders to pdf", async () => {
      const mockBlob = new Blob(["pdf data"]);
      mockApiClient.get.mockResolvedValue(mockBlob);

      const result = await ordersService.exportToPdf();

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/orders/api/orders/export-pdf",
        { responseType: "blob" }
      );
      expect(result).toEqual(mockBlob);
    });
  });
});
