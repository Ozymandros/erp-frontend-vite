import { describe, it, expect, vi, beforeEach } from "vitest";
import type {
  InventoryTransactionDto,
  CreateUpdateInventoryTransactionDto,
  PaginatedResponse,
  QuerySpec,
  TransactionType,
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
const { inventoryTransactionsService } = await import(
  "@/api/services/inventory-transactions.service"
);

describe("InventoryTransactionsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getTransactions", () => {
    it("should fetch all transactions", async () => {
      const mockTransactions: InventoryTransactionDto[] = [
        {
          id: "1",
          productId: "prod1",
        } as InventoryTransactionDto,
      ];

      mockApiClient.get.mockResolvedValue(mockTransactions);

      const result = await inventoryTransactionsService.getTransactions();

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/inventory/api/inventory/transactions"
      );
      expect(result).toEqual(mockTransactions);
    });
  });

  describe("getTransactionsPaginated", () => {
    it("should fetch paginated transactions", async () => {
      const mockResponse: PaginatedResponse<InventoryTransactionDto> = {
        items: [],
        page: 1,
        pageSize: 10,
        total: 0,
        hasNext: false,
        hasPrevious: false,
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await inventoryTransactionsService.getTransactionsPaginated(
        1,
        10
      );

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/inventory/api/inventory/transactions/paginated",
        { params: { page: 1, pageSize: 10 } }
      );
      expect(result).toEqual(mockResponse);
    });

    it("should use default pagination parameters", async () => {
      const mockResponse: PaginatedResponse<InventoryTransactionDto> = {
        items: [],
        page: 1,
        pageSize: 10,
        total: 0,
        hasNext: false,
        hasPrevious: false,
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      await inventoryTransactionsService.getTransactionsPaginated();

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/inventory/api/inventory/transactions/paginated",
        { params: { page: 1, pageSize: 10 } }
      );
    });
  });

  describe("searchTransactions", () => {
    it("should search transactions with query spec", async () => {
      const querySpec: QuerySpec = {
        page: 1,
        pageSize: 20,
        searchTerm: "test",
      };

      const mockResponse: PaginatedResponse<InventoryTransactionDto> = {
        items: [],
        page: 1,
        pageSize: 20,
        total: 0,
        hasNext: false,
        hasPrevious: false,
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await inventoryTransactionsService.searchTransactions(
        querySpec
      );

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/inventory/api/inventory/transactions/search",
        { params: querySpec }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getTransactionById", () => {
    it("should fetch transaction by ID", async () => {
      const mockTransaction: InventoryTransactionDto = {
        id: "1",
        productId: "prod1",
      } as InventoryTransactionDto;

      mockApiClient.get.mockResolvedValue(mockTransaction);

      const result = await inventoryTransactionsService.getTransactionById("1");

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/inventory/api/inventory/transactions/1"
      );
      expect(result).toEqual(mockTransaction);
    });
  });

  describe("getTransactionsByProduct", () => {
    it("should fetch transactions by product ID", async () => {
      const mockTransactions: InventoryTransactionDto[] = [
        {
          id: "1",
          productId: "prod1",
        } as InventoryTransactionDto,
      ];

      mockApiClient.get.mockResolvedValue(mockTransactions);

      const result =
        await inventoryTransactionsService.getTransactionsByProduct("prod1");

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/inventory/api/inventory/transactions/product/prod1"
      );
      expect(result).toEqual(mockTransactions);
    });
  });

  describe("getTransactionsByWarehouse", () => {
    it("should fetch transactions by warehouse ID", async () => {
      const mockTransactions: InventoryTransactionDto[] = [
        {
          id: "1",
          warehouseId: "wh1",
        } as InventoryTransactionDto,
      ];

      mockApiClient.get.mockResolvedValue(mockTransactions);

      const result =
        await inventoryTransactionsService.getTransactionsByWarehouse("wh1");

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/inventory/api/inventory/transactions/warehouse/wh1"
      );
      expect(result).toEqual(mockTransactions);
    });
  });

  describe("getTransactionsByType", () => {
    it("should fetch transactions by type", async () => {
      const mockTransactions: InventoryTransactionDto[] = [
        {
          id: "1",
          type: "In" as TransactionType,
        } as InventoryTransactionDto,
      ];

      mockApiClient.get.mockResolvedValue(mockTransactions);

      const result = await inventoryTransactionsService.getTransactionsByType(
        "In"
      );

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/inventory/api/inventory/transactions/type/In"
      );
      expect(result).toEqual(mockTransactions);
    });
  });

  describe("createTransaction", () => {
    it("should create a new transaction", async () => {
      const newTransaction: CreateUpdateInventoryTransactionDto = {
        productId: "prod1",
        warehouseId: "wh1",
        quantity: 10,
        type: "In" as TransactionType,
      } as CreateUpdateInventoryTransactionDto;

      const mockTransaction: InventoryTransactionDto = {
        id: "2",
        ...newTransaction,
      } as InventoryTransactionDto;

      mockApiClient.post.mockResolvedValue(mockTransaction);

      const result =
        await inventoryTransactionsService.createTransaction(newTransaction);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/inventory/api/inventory/transactions",
        newTransaction
      );
      expect(result).toEqual(mockTransaction);
    });
  });

  describe("updateTransaction", () => {
    it("should update an existing transaction", async () => {
      const updateData: CreateUpdateInventoryTransactionDto = {
        quantity: 20,
      } as CreateUpdateInventoryTransactionDto;

      const mockTransaction: InventoryTransactionDto = {
        id: "1",
        quantity: 20,
      } as InventoryTransactionDto;

      mockApiClient.put.mockResolvedValue(mockTransaction);

      const result = await inventoryTransactionsService.updateTransaction(
        "1",
        updateData
      );

      expect(mockApiClient.put).toHaveBeenCalledWith(
        "/inventory/api/inventory/transactions/1",
        updateData
      );
      expect(result).toEqual(mockTransaction);
    });
  });

  describe("deleteTransaction", () => {
    it("should delete a transaction", async () => {
      mockApiClient.delete.mockResolvedValue(undefined);

      await inventoryTransactionsService.deleteTransaction("1");

      expect(mockApiClient.delete).toHaveBeenCalledWith(
        "/inventory/api/inventory/transactions/1"
      );
    });
  });
});
