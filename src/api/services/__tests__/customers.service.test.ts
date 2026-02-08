import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CustomerDto, PaginatedResponse, QuerySpec } from "@/types/api.types";

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
const { customersService } = await import("@/api/services/customers.service");

describe("CustomersService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCustomers", () => {
    it("should fetch all customers", async () => {
      const mockCustomers: CustomerDto[] = [
        {
          id: "1",
          name: "Test Customer",
          email: "customer@example.com",
          phoneNumber: "123-456-7890",
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
          createdBy: "user1",
          updatedBy: "user1",
        },
      ];

      mockApiClient.get.mockResolvedValue(mockCustomers);

      const result = await customersService.getCustomers();

      expect(mockApiClient.get).toHaveBeenCalledWith("/sales/api/sales/customers");
      expect(result).toEqual(mockCustomers);
    });
  });

  describe("searchCustomers", () => {
    it("should search customers with query spec", async () => {
      const querySpec: QuerySpec = {
        page: 1,
        pageSize: 20,
        searchTerm: "test",
      };

      const mockResponse: PaginatedResponse<CustomerDto> = {
        items: [],
        page: 1,
        pageSize: 20,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await customersService.searchCustomers(querySpec);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/sales/api/sales/customers/search",
        { params: querySpec }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("createCustomer", () => {
    it("should create a new customer", async () => {
      const newCustomer: CustomerDto = {
        id: "2",
        name: "New Customer",
        email: "new@example.com",
        phoneNumber: "555-1234",
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
        createdBy: "user1",
        updatedBy: "user1",
      };

      mockApiClient.post.mockResolvedValue(newCustomer);

      const result = await customersService.createCustomer(newCustomer);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/sales/api/sales/customers",
        newCustomer
      );
      expect(result).toEqual(newCustomer);
    });
  });

  describe("getCustomerById", () => {
    it("should fetch customer by ID", async () => {
      const mockCustomer: CustomerDto = {
        id: "1",
        name: "Test Customer",
        email: "customer@example.com",
        phoneNumber: "123-456-7890",
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
        createdBy: "user1",
        updatedBy: "user1",
      };

      mockApiClient.get.mockResolvedValue(mockCustomer);

      const result = await customersService.getCustomerById("1");

      expect(mockApiClient.get).toHaveBeenCalledWith("/sales/api/sales/customers/1");
      expect(result).toEqual(mockCustomer);
    });
  });

  describe("updateCustomer", () => {
    it("should update an existing customer", async () => {
      const updateData = {
        name: "Updated Customer",
        email: "updated@example.com",
      };
      const mockCustomer: CustomerDto = {
        id: "1",
        ...updateData,
        phoneNumber: "123-456-7890",
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
        createdBy: "user1",
        updatedBy: "user1",
      };

      mockApiClient.put.mockResolvedValue(mockCustomer);

      const result = await customersService.updateCustomer("1", updateData);

      expect(mockApiClient.put).toHaveBeenCalledWith(
        "/sales/api/sales/customers/1",
        updateData
      );
      expect(result).toEqual(mockCustomer);
    });
  });

  describe("deleteCustomer", () => {
    it("should delete a customer", async () => {
      mockApiClient.delete.mockResolvedValue(undefined);

      await customersService.deleteCustomer("1");

      expect(mockApiClient.delete).toHaveBeenCalledWith("/sales/api/sales/customers/1");
    });
  });

  describe("exportToXlsx", () => {
    it("should export customers to xlsx", async () => {
      const mockBlob = new Blob(["xlsx data"]);
      mockApiClient.get.mockResolvedValue(mockBlob);

      const result = await customersService.exportToXlsx();

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/sales/api/sales/customers/export-xlsx",
        { responseType: "blob" }
      );
      expect(result).toEqual(mockBlob);
    });
  });

  describe("exportToPdf", () => {
    it("should export customers to pdf", async () => {
      const mockBlob = new Blob(["pdf data"]);
      mockApiClient.get.mockResolvedValue(mockBlob);

      const result = await customersService.exportToPdf();

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/sales/api/sales/customers/export-pdf",
        { responseType: "blob" }
      );
      expect(result).toEqual(mockBlob);
    });
  });
});
