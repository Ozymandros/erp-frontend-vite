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
});
