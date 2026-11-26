import { describe, it, expect } from "vitest";
import {
  AUTH_ENDPOINTS,
  USERS_ENDPOINTS,
  ROLES_ENDPOINTS,
  PERMISSIONS_ENDPOINTS,
  PRODUCTS_ENDPOINTS,
  WAREHOUSES_ENDPOINTS,
  WAREHOUSE_STOCKS_ENDPOINTS,
  STOCK_OPERATIONS_ENDPOINTS,
  INVENTORY_TRANSACTIONS_ENDPOINTS,
  ORDERS_ENDPOINTS,
  CUSTOMERS_ENDPOINTS,
  SALES_ORDERS_ENDPOINTS,
  PURCHASE_ORDERS_ENDPOINTS,
  SUPPLIERS_ENDPOINTS,
  CRM_SERVICE_BASE,
  LEADS_ENDPOINTS,
  ACCOUNTS_ENDPOINTS,
  CONTACTS_ENDPOINTS,
  ACTIVITIES_ENDPOINTS,
  OPPORTUNITIES_ENDPOINTS,
  INVOICES_ENDPOINTS,
  PAYMENTS_ENDPOINTS,
  CREDIT_NOTES_ENDPOINTS,
  SUPPLIER_INVOICES_ENDPOINTS,
  AUDIT_ENDPOINTS,
  PROJECTS_SERVICE_BASE,
  PROJECTS_ENDPOINTS,
  PROJECT_RESOURCES_ENDPOINTS,
  PROJECT_RESOURCE_GROUPS_ENDPOINTS,
  PROJECT_CURRENCIES_ENDPOINTS,
  projectTasksEndpoints,
  projectPlanningLinesEndpoints,
  projectPostingEndpoints,
} from "@/api/constants/endpoints";

describe("API Endpoints Constants", () => {
  describe("AUTH_ENDPOINTS", () => {
    it("should build EXTERNAL_LOGIN path", () => {
      expect(AUTH_ENDPOINTS.EXTERNAL_LOGIN("google")).toBe("/auth/api/auth/external-login/google");
    });

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

    it("should build dynamic user paths", () => {
      expect(USERS_ENDPOINTS.BY_EMAIL("u@x.com")).toBe("/auth/api/users/email/u@x.com");
      expect(USERS_ENDPOINTS.ASSIGN_ROLE("u1", "admin")).toBe(
        "/auth/api/users/u1/roles/admin",
      );
      expect(USERS_ENDPOINTS.REMOVE_ROLE("u1", "admin")).toBe(
        "/auth/api/users/u1/roles/admin",
      );
      expect(USERS_ENDPOINTS.GET_ROLES("u1")).toBe("/auth/api/users/u1/roles");
    });
  });

  describe("ROLES_ENDPOINTS", () => {
    it("should build dynamic role paths", () => {
      expect(ROLES_ENDPOINTS.BY_NAME("Auditor")).toBe("/auth/api/roles/name/Auditor");
      expect(ROLES_ENDPOINTS.USERS_IN_ROLE("auditor")).toBe(
        "/auth/api/roles/auditor/users",
      );
      expect(ROLES_ENDPOINTS.PERMISSIONS("r1")).toBe("/auth/api/roles/r1/permissions");
      expect(ROLES_ENDPOINTS.ADD_PERMISSION("r1")).toBe("/auth/api/roles/r1/permissions");
      expect(ROLES_ENDPOINTS.REMOVE_PERMISSION("r1", "p9")).toBe(
        "/auth/api/roles/r1/permissions/p9",
      );
    });
  });

  describe("PERMISSIONS_ENDPOINTS", () => {
    it("should build BY_ID", () => {
      expect(PERMISSIONS_ENDPOINTS.BY_ID("perm-1")).toBe("/auth/api/permissions/perm-1");
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

    it("should build BY_SKU", () => {
      expect(PRODUCTS_ENDPOINTS.BY_SKU("SKU-1")).toBe(
        "/inventory/api/inventory/products/sku/SKU-1",
      );
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

  describe("WAREHOUSE_STOCKS_ENDPOINTS", () => {
    it("should build filter paths", () => {
      expect(WAREHOUSE_STOCKS_ENDPOINTS.BY_PRODUCT("p1")).toContain("/product/p1");
      expect(WAREHOUSE_STOCKS_ENDPOINTS.BY_WAREHOUSE("w1")).toContain("/warehouse/w1");
      expect(WAREHOUSE_STOCKS_ENDPOINTS.BY_PRODUCT_AND_WAREHOUSE("p1", "w1")).toContain(
        "p1/w1",
      );
      expect(WAREHOUSE_STOCKS_ENDPOINTS.AVAILABILITY("p1")).toContain("/availability/p1");
    });
  });

  describe("STOCK_OPERATIONS_ENDPOINTS", () => {
    it("should build RELEASE_RESERVATION", () => {
      expect(STOCK_OPERATIONS_ENDPOINTS.RELEASE_RESERVATION("res-1")).toContain(
        "reservations/res-1",
      );
    });
  });

  describe("INVENTORY_TRANSACTIONS_ENDPOINTS", () => {
    it("should build dynamic paths", () => {
      expect(INVENTORY_TRANSACTIONS_ENDPOINTS.BY_PRODUCT("p1")).toContain(
        "/product/p1",
      );
      expect(INVENTORY_TRANSACTIONS_ENDPOINTS.BY_WAREHOUSE("w1")).toContain(
        "/warehouse/w1",
      );
      expect(INVENTORY_TRANSACTIONS_ENDPOINTS.BY_TYPE("ADJUST")).toContain(
        "/type/ADJUST",
      );
    });
  });

  describe("ORDERS_ENDPOINTS", () => {
    it("should build BY_ID", () => {
      expect(ORDERS_ENDPOINTS.BY_ID("o1")).toBe("/orders/api/orders/o1");
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

    it("should generate CREATE_RETURN endpoint", () => {
      expect(SALES_ORDERS_ENDPOINTS.CREATE_RETURN("so-1")).toBe(
        "/sales/api/sales/orders/so-1/returns"
      );
    });

    it("should generate CONFIRM_QUOTE endpoint", () => {
      expect(SALES_ORDERS_ENDPOINTS.CONFIRM_QUOTE("q1")).toBe(
        "/sales/api/sales/orders/quotes/q1/confirm",
      );
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

    it("should generate MATCH endpoint", () => {
      expect(PURCHASE_ORDERS_ENDPOINTS.MATCH("po-123")).toBe(
        "/purchasing/api/purchasing/orders/po-123/match"
      );
    });

    it("should build supplier and status routes", () => {
      expect(PURCHASE_ORDERS_ENDPOINTS.BY_SUPPLIER("s1")).toContain("/supplier/s1");
      expect(PURCHASE_ORDERS_ENDPOINTS.BY_STATUS("OPEN")).toContain("/status/OPEN");
      expect(PURCHASE_ORDERS_ENDPOINTS.UPDATE_STATUS("po1", "DONE")).toContain(
        "po1/status/DONE",
      );
      expect(PURCHASE_ORDERS_ENDPOINTS.APPROVE("po1")).toContain("/approve");
      expect(PURCHASE_ORDERS_ENDPOINTS.RECEIVE("po1")).toContain("/receive");
    });
  });

  describe("SUPPLIERS_ENDPOINTS", () => {
    it("should build dynamic supplier paths", () => {
      expect(SUPPLIERS_ENDPOINTS.BY_EMAIL("a@b.c")).toContain("/email/a@b.c");
      expect(SUPPLIERS_ENDPOINTS.SEARCH_BY_NAME("Acme")).toContain("/search/Acme");
    });
  });

  describe("SUPPLIER_INVOICES_ENDPOINTS", () => {
    it("should have correct base endpoint", () => {
      expect(SUPPLIER_INVOICES_ENDPOINTS.BASE).toBe(
        "/billing/api/billing/supplier-invoices"
      );
    });

    it("should generate BY_PO endpoint", () => {
      expect(SUPPLIER_INVOICES_ENDPOINTS.BY_PO("po-1")).toBe(
        "/billing/api/billing/supplier-invoices/by-purchase-order/po-1"
      );
    });

    it("should generate BY_ID endpoint", () => {
      expect(SUPPLIER_INVOICES_ENDPOINTS.BY_ID("si-1")).toContain("supplier-invoices/si-1");
    });
  });

  describe("CRM endpoints", () => {
    it("should have correct CRM service base", () => {
      expect(CRM_SERVICE_BASE).toBe("/crm/api/crm");
    });

    it("should have correct leads base endpoint", () => {
      expect(LEADS_ENDPOINTS.BASE).toBe("/crm/api/crm/leads");
    });

    it("should generate correct leads QUALIFY endpoint", () => {
      const id = "lead-123";
      expect(LEADS_ENDPOINTS.QUALIFY(id)).toBe(
        `/crm/api/crm/leads/${id}/qualify`
      );
    });

    it("should have correct opportunities forecast endpoint", () => {
      expect(OPPORTUNITIES_ENDPOINTS.FORECAST).toBe(
        "/crm/api/crm/opportunities/forecast"
      );
    });

    it("should build accounts paths", () => {
      expect(ACCOUNTS_ENDPOINTS.BY_ID("a1")).toContain("/accounts/a1");
      expect(ACCOUNTS_ENDPOINTS.UPDATE_OWNER("a1")).toContain("/owner");
    });

    it("should build contacts paths", () => {
      expect(CONTACTS_ENDPOINTS.BY_ACCOUNT("acc1")).toContain("/accounts/acc1/contacts");
      expect(CONTACTS_ENDPOINTS.SET_PRIMARY("acc1", "c1")).toContain(
        "contacts/c1/set-primary",
      );
    });

    it("should build activities paths", () => {
      expect(ACTIVITIES_ENDPOINTS.COMPLETE("act1")).toContain("/complete");
    });

    it("should build opportunities action paths", () => {
      expect(OPPORTUNITIES_ENDPOINTS.UPDATE_FORECAST("o1")).toContain("/forecast");
      expect(OPPORTUNITIES_ENDPOINTS.MOVE_STAGE("o1")).toContain("/move-stage");
      expect(OPPORTUNITIES_ENDPOINTS.MARK_WON("o1")).toContain("/mark-won");
      expect(OPPORTUNITIES_ENDPOINTS.MARK_LOST("o1")).toContain("/mark-lost");
      expect(OPPORTUNITIES_ENDPOINTS.LINES_BASE("o1")).toContain("/lines");
      expect(OPPORTUNITIES_ENDPOINTS.LINE_BY_ID("o1", "l1")).toContain(
        "opportunities/o1/lines/l1",
      );
    });
  });

  describe("Billing endpoints", () => {
    it("should build invoice and payment paths", () => {
      expect(INVOICES_ENDPOINTS.BY_CUSTOMER("cust1")).toContain("/customer/cust1");
      expect(INVOICES_ENDPOINTS.BY_ORDER("ord1")).toContain("/order/ord1");
      expect(INVOICES_ENDPOINTS.ISSUE("inv1")).toContain("/issue");
      expect(INVOICES_ENDPOINTS.PAYMENTS("inv1")).toContain("/payments");
      expect(INVOICES_ENDPOINTS.CANCEL("inv1")).toContain("/cancel");
      expect(INVOICES_ENDPOINTS.CREDIT_NOTES("inv1")).toContain("/credit-notes");
      expect(PAYMENTS_ENDPOINTS.BY_INVOICE("inv1")).toContain("/payments/invoice/");
      expect(CREDIT_NOTES_ENDPOINTS.BY_INVOICE("inv1")).toContain("/credit-notes/invoice/");
    });
  });

  describe("AUDIT_ENDPOINTS", () => {
    it("should build BY_ENTITY", () => {
      expect(AUDIT_ENDPOINTS.BY_ENTITY("User", "u1")).toContain(
        "by-entity/User/u1",
      );
    });
  });

  describe("Projects endpoints", () => {
    it("should have correct projects service base", () => {
      expect(PROJECTS_SERVICE_BASE).toBe("/projects/api/projects");
    });

    it("should have correct projects list endpoint", () => {
      expect(PROJECTS_ENDPOINTS.BASE).toBe("/projects/api/projects");
    });

    it("should generate project statistics endpoint", () => {
      expect(PROJECTS_ENDPOINTS.STATISTICS("p1")).toBe(
        "/projects/api/projects/p1/statistics"
      );
    });

    it("should have resources endpoint", () => {
      expect(PROJECT_RESOURCES_ENDPOINTS.BASE).toBe(
        "/projects/api/projects/resources"
      );
    });

    it("should generate currency by code endpoint", () => {
      expect(PROJECT_CURRENCIES_ENDPOINTS.BY_CODE("USD")).toBe(
        "/projects/api/projects/currencies/USD"
      );
    });

    it("should build project id helpers", () => {
      expect(PROJECTS_ENDPOINTS.BY_NUMBER("P-100")).toContain("/number/P-100");
      expect(PROJECTS_ENDPOINTS.STATUS("p1")).toContain("/p1/status");
      expect(PROJECTS_ENDPOINTS.COPY("p1")).toContain("/copy");
    });

    it("should build nested project task and planning paths", () => {
      const tasks = projectTasksEndpoints("proj-1");
      expect(tasks.BY_ID("t1")).toContain("/proj-1/tasks/t1");
      expect(tasks.MOVE("t1")).toContain("/t1/move");

      const lines = projectPlanningLinesEndpoints("proj-1");
      expect(lines.BY_ID("line-1")).toContain("/planning-lines/line-1");
    });

    it("should expose posting routes", () => {
      const posting = projectPostingEndpoints("proj-1");
      expect(posting.LEDGER).toContain("ledger-entries");
      expect(posting.USAGE).toContain("/usage");
    });

    it("should build resource group BY_ID", () => {
      expect(PROJECT_RESOURCE_GROUPS_ENDPOINTS.BY_ID("g1")).toContain("resource-groups/g1");
    });

    it("should build currency rate paths", () => {
      expect(PROJECT_CURRENCIES_ENDPOINTS.RATE("EUR")).toContain("/EUR/rate");
      expect(PROJECT_CURRENCIES_ENDPOINTS.EXCHANGE_RATES("EUR")).toContain(
        "/EUR/exchange-rates",
      );
      expect(PROJECT_CURRENCIES_ENDPOINTS.EXCHANGE_RATE_BY_ID("EUR", "r1")).toContain(
        "/EUR/exchange-rates/r1",
      );
    });
  });
});
