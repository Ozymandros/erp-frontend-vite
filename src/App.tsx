import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth.context";
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
import { PurchaseOrdersListPage } from "@/pages/purchasing/purchase-orders-list";
import { PurchaseOrderDetailPage } from "@/pages/purchasing/purchase-order-detail";
import { SuppliersListPage } from "@/pages/purchasing/suppliers-list";
import { SupplierDetailPage } from "@/pages/purchasing/supplier-detail";
import { OrderDetailPage } from "@/pages/orders/order-detail";
import { ToastContextProvider } from "@/contexts/toast.context";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastContextProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/debug/toast-test" element={<ToastTestPage />} />

            {/* Protected routes with layout */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              {/* Dashboard and Profile - no specific permission required */}
              <Route path="/" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />

              {/* Users Management */}
              <Route
                path="/users"
                element={
                  <PermissionRoute path="/users">
                    <UsersListPage />
                  </PermissionRoute>
                }
              />
              <Route
                path="/users/:id"
                element={
                  <PermissionRoute path="/users/:id">
                    <UserDetailPage />
                  </PermissionRoute>
                }
              />

              {/* Roles Management */}
              <Route
                path="/roles"
                element={
                  <PermissionRoute path="/roles">
                    <RolesListPage />
                  </PermissionRoute>
                }
              />
              <Route
                path="/roles/:id"
                element={
                  <PermissionRoute path="/roles/:id">
                    <RoleDetailPage />
                  </PermissionRoute>
                }
              />

              {/* Permissions Management */}
              <Route
                path="/permissions"
                element={
                  <PermissionRoute path="/permissions">
                    <PermissionsListPage />
                  </PermissionRoute>
                }
              />

              {/* Inventory Management */}
              <Route
                path="/inventory/products"
                element={
                  <PermissionRoute path="/inventory/products">
                    <ProductsListPage />
                  </PermissionRoute>
                }
              />
              <Route
                path="/inventory/products/:id"
                element={
                  <PermissionRoute path="/inventory/products/:id">
                    <ProductDetailPage />
                  </PermissionRoute>
                }
              />
              <Route
                path="/inventory/warehouses"
                element={
                  <PermissionRoute path="/inventory/warehouses">
                    <WarehousesListPage />
                  </PermissionRoute>
                }
              />
              <Route
                path="/inventory/warehouses/:id"
                element={
                  <PermissionRoute path="/inventory/warehouses/:id">
                    <WarehouseDetailPage />
                  </PermissionRoute>
                }
              />
              <Route
                path="/inventory/warehouse-stocks"
                element={
                  <PermissionRoute path="/inventory/warehouse-stocks">
                    <WarehouseStocksListPage />
                  </PermissionRoute>
                }
              />
              <Route
                path="/inventory/transactions"
                element={
                  <PermissionRoute path="/inventory/transactions">
                    <InventoryTransactionsListPage />
                  </PermissionRoute>
                }
              />
              <Route
                path="/inventory/stock-operations"
                element={
                  <PermissionRoute path="/inventory/stock-operations">
                    <StockOperationsPage />
                  </PermissionRoute>
                }
              />

              {/* Orders Management */}
              <Route
                path="/orders"
                element={
                  <PermissionRoute path="/orders">
                    <OrdersListPage />
                  </PermissionRoute>
                }
              />
              <Route
                path="/orders/:id"
                element={
                  <PermissionRoute path="/orders/:id">
                    <OrderDetailPage />
                  </PermissionRoute>
                }
              />

              {/* Sales Management */}
              <Route
                path="/sales/customers"
                element={
                  <PermissionRoute path="/sales/customers">
                    <CustomersListPage />
                  </PermissionRoute>
                }
              />
              <Route
                path="/sales/customers/:id"
                element={
                  <PermissionRoute path="/sales/customers/:id">
                    <CustomerDetailPage />
                  </PermissionRoute>
                }
              />
              <Route
                path="/sales/orders"
                element={
                  <PermissionRoute path="/sales/orders">
                    <SalesOrdersListPage />
                  </PermissionRoute>
                }
              />
              <Route
                path="/sales/orders/:id"
                element={
                  <PermissionRoute path="/sales/orders/:id">
                    <SalesOrderDetailPage />
                  </PermissionRoute>
                }
              />

              {/* Purchasing Management */}
              <Route
                path="/purchasing/suppliers"
                element={
                  <PermissionRoute path="/purchasing/suppliers">
                    <SuppliersListPage />
                  </PermissionRoute>
                }
              />
              <Route
                path="/purchasing/suppliers/:id"
                element={
                  <PermissionRoute path="/purchasing/suppliers/:id">
                    <SupplierDetailPage />
                  </PermissionRoute>
                }
              />
              <Route
                path="/purchasing/orders"
                element={
                  <PermissionRoute path="/purchasing/orders">
                    <PurchaseOrdersListPage />
                  </PermissionRoute>
                }
              />
              <Route
                path="/purchasing/orders/:id"
                element={
                  <PermissionRoute path="/purchasing/orders/:id">
                    <PurchaseOrderDetailPage />
                  </PermissionRoute>
                }
              />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastContextProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
