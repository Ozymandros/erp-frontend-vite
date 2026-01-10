import { describe, it, expect } from "vitest";
import {
  AUTH_ENDPOINTS,
  USERS_ENDPOINTS,
  PRODUCTS_ENDPOINTS,
  WAREHOUSES_ENDPOINTS,
  CUSTOMERS_ENDPOINTS,
  SALES_ORDERS_ENDPOINTS,
  PURCHASE_ORDERS_ENDPOINTS,
} from "@/api/constants/endpoints";

describe("API Endpoints Constants", () => {
  describe("AUTH_ENDPOINTS", () => {
    it("should have correct login endpoint", () => {
      expect(AUTH_ENDPOINTS.LOGIN).toBe("/auth/api/auth/login");
    });

    it("should have correct register endpoint", () => {
      expect(AUTH_ENDPOINTS.REGISTER).toBe("/auth/api/auth/register");
    });

    it("should have correct refresh endpoint", () => {
      expect(AUTH_ENDPOINTS.REFRESH).toBe("/auth/api/auth/refresh");
    });

    it("should have correct logout endpoint", () => {
      expect(AUTH_ENDPOINTS.LOGOUT).toBe("/auth/api/auth/logout");
    });
  });

  describe("USERS_ENDPOINTS", () => {
    it("should have correct ME endpoint", () => {
      expect(USERS_ENDPOINTS.ME).toBe("/auth/api/users/me");
    });

    it("should generate correct BY_ID endpoint", () => {
      const id = "user-123";
      expect(USERS_ENDPOINTS.BY_ID(id)).toBe(`/auth/api/users/${id}`);
    });

    it("should have correct CREATE endpoint", () => {
      expect(USERS_ENDPOINTS.CREATE).toBe("/auth/api/users/create");
    });

    it("should have correct SEARCH endpoint", () => {
      expect(USERS_ENDPOINTS.SEARCH).toBe("/auth/api/users/search");
    });
  });

  describe("PRODUCTS_ENDPOINTS", () => {
    it("should have correct base endpoint", () => {
      expect(PRODUCTS_ENDPOINTS.BASE).toBe("/inventory/api/inventory/products");
    });

    it("should generate correct BY_ID endpoint", () => {
      const id = "product-123";
      expect(PRODUCTS_ENDPOINTS.BY_ID(id)).toBe(`/inventory/api/inventory/products/${id}`);
    });

    it("should have correct SEARCH endpoint", () => {
      expect(PRODUCTS_ENDPOINTS.SEARCH).toBe("/inventory/api/inventory/products/search");
    });
  });

  describe("WAREHOUSES_ENDPOINTS", () => {
    it("should have correct base endpoint", () => {
      expect(WAREHOUSES_ENDPOINTS.BASE).toBe("/inventory/api/inventory/warehouses");
    });

    it("should generate correct BY_ID endpoint", () => {
      const id = "warehouse-123";
      expect(WAREHOUSES_ENDPOINTS.BY_ID(id)).toBe(`/inventory/api/inventory/warehouses/${id}`);
    });
  });

  describe("CUSTOMERS_ENDPOINTS", () => {
    it("should have correct base endpoint", () => {
      expect(CUSTOMERS_ENDPOINTS.BASE).toBe("/sales/api/sales/customers");
    });

    it("should generate correct BY_ID endpoint", () => {
      const id = "customer-123";
      expect(CUSTOMERS_ENDPOINTS.BY_ID(id)).toBe(`/sales/api/sales/customers/${id}`);
    });
  });

  describe("SALES_ORDERS_ENDPOINTS", () => {
    it("should have correct base endpoint", () => {
      expect(SALES_ORDERS_ENDPOINTS.BASE).toBe("/sales/api/sales/orders");
    });

    it("should have correct QUOTES endpoint", () => {
      expect(SALES_ORDERS_ENDPOINTS.QUOTES).toBe("/sales/api/sales/orders/quotes");
    });
  });

  describe("PURCHASE_ORDERS_ENDPOINTS", () => {
    it("should have correct base endpoint", () => {
      expect(PURCHASE_ORDERS_ENDPOINTS.BASE).toBe("/purchasing/api/purchasing/orders");
    });

    it("should generate correct BY_ID endpoint", () => {
      const id = "po-123";
      expect(PURCHASE_ORDERS_ENDPOINTS.BY_ID(id)).toBe(`/purchasing/api/purchasing/orders/${id}`);
    });
  });
});
