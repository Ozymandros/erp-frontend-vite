import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { PermissionRoute } from "@/components/auth/permission-route";
import { AppLayout } from "@/components/layout/app-layout";
import { LoginPage } from "@/pages/auth/login";
import { RegisterPage } from "@/pages/auth/register";
import ToastTestPage from "@/pages/debug/toast-test";
import { DashboardPage } from "@/pages/dashboard/dashboard";
import { ProfilePage } from "@/pages/profile/profile";
import { UsersListPage } from "@/pages/users/users-list";
import { UserDetailPage } from "@/pages/users/user-detail";
import { RolesListPage } from "@/pages/roles/roles-list";
import { RoleDetailPage } from "@/pages/roles/role-detail";
import { PermissionsListPage } from "@/pages/permissions/permissions-list";
import { ProductsListPage } from "@/pages/inventory/products-list";
import { ProductDetailPage } from "@/pages/inventory/product-detail";
import { WarehousesListPage } from "@/pages/inventory/warehouses-list";
import { WarehouseDetailPage } from "@/pages/inventory/warehouse-detail";
import { WarehouseStocksListPage } from "@/pages/inventory/warehouse-stocks-list";
import { InventoryTransactionsListPage } from "@/pages/inventory/inventory-transactions-list";
import { StockOperationsPage } from "@/pages/inventory/stock-operations";
import { CustomersListPage } from "@/pages/sales/customers-list";
import { CustomerDetailPage } from "@/pages/sales/customer-detail";
import { SalesOrdersListPage } from "@/pages/sales/sales-orders-list";
import { SalesOrderDetailPage } from "@/pages/sales/sales-order-detail";
import { OrdersListPage } from "@/pages/orders/orders-list";
import { OrderDetailPage } from "@/pages/orders/order-detail";
import { PurchaseOrdersListPage } from "@/pages/purchasing/purchase-orders-list";
import { PurchaseOrderDetailPage } from "@/pages/purchasing/purchase-order-detail";
import { SuppliersListPage } from "@/pages/purchasing/suppliers-list";
import { SupplierDetailPage } from "@/pages/purchasing/supplier-detail";

export interface RouteDefinition {
  path?: string;
  index?: boolean;
  element: ReactNode;
  children?: RouteDefinition[];
}

export const ROUTE_DEFINITIONS: RouteDefinition[] = [
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/debug/toast-test", element: <ToastTestPage /> },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "/", element: <DashboardPage /> },
      { path: "/profile", element: <ProfilePage /> },
      {
        path: "/users",
        element: (
          <PermissionRoute path="/users">
            <UsersListPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/users/:id",
        element: (
          <PermissionRoute path="/users/:id">
            <UserDetailPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/roles",
        element: (
          <PermissionRoute path="/roles">
            <RolesListPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/roles/:id",
        element: (
          <PermissionRoute path="/roles/:id">
            <RoleDetailPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/permissions",
        element: (
          <PermissionRoute path="/permissions">
            <PermissionsListPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/inventory/products",
        element: (
          <PermissionRoute path="/inventory/products">
            <ProductsListPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/inventory/products/:id",
        element: (
          <PermissionRoute path="/inventory/products/:id">
            <ProductDetailPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/inventory/warehouses",
        element: (
          <PermissionRoute path="/inventory/warehouses">
            <WarehousesListPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/inventory/warehouses/:id",
        element: (
          <PermissionRoute path="/inventory/warehouses/:id">
            <WarehouseDetailPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/inventory/warehouse-stocks",
        element: (
          <PermissionRoute path="/inventory/warehouse-stocks">
            <WarehouseStocksListPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/inventory/transactions",
        element: (
          <PermissionRoute path="/inventory/transactions">
            <InventoryTransactionsListPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/inventory/stock-operations",
        element: (
          <PermissionRoute path="/inventory/stock-operations">
            <StockOperationsPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/orders",
        element: (
          <PermissionRoute path="/orders">
            <OrdersListPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/orders/:id",
        element: (
          <PermissionRoute path="/orders/:id">
            <OrderDetailPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/sales/customers",
        element: (
          <PermissionRoute path="/sales/customers">
            <CustomersListPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/sales/customers/:id",
        element: (
          <PermissionRoute path="/sales/customers/:id">
            <CustomerDetailPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/sales/orders",
        element: (
          <PermissionRoute path="/sales/orders">
            <SalesOrdersListPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/sales/orders/:id",
        element: (
          <PermissionRoute path="/sales/orders/:id">
            <SalesOrderDetailPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/purchasing/suppliers",
        element: (
          <PermissionRoute path="/purchasing/suppliers">
            <SuppliersListPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/purchasing/suppliers/:id",
        element: (
          <PermissionRoute path="/purchasing/suppliers/:id">
            <SupplierDetailPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/purchasing/orders",
        element: (
          <PermissionRoute path="/purchasing/orders">
            <PurchaseOrdersListPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/purchasing/orders/:id",
        element: (
          <PermissionRoute path="/purchasing/orders/:id">
            <PurchaseOrderDetailPage />
          </PermissionRoute>
        ),
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
];
