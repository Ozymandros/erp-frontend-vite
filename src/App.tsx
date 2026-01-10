import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth.context";
import { ProtectedRoute } from "@/components/auth/protected-route";
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
import { CustomersListPage } from "@/pages/sales/customers-list";
import { CustomerDetailPage } from "@/pages/sales/customer-detail";
import { OrdersListPage } from "@/pages/orders/orders-list";
import { ToastContextProvider } from "./contexts/toast.context";

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
              <Route path="/" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />

              {/* Users Management */}
              <Route path="/users" element={<UsersListPage />} />
              <Route path="/users/:id" element={<UserDetailPage />} />

              {/* Roles Management */}
              <Route path="/roles" element={<RolesListPage />} />
              <Route path="/roles/:id" element={<RoleDetailPage />} />

              {/* Permissions Management */}
              <Route path="/permissions" element={<PermissionsListPage />} />

              {/* Inventory Management */}
              <Route path="/inventory/products" element={<ProductsListPage />} />
              <Route path="/inventory/products/:id" element={<ProductDetailPage />} />
              <Route path="/inventory/warehouses" element={<WarehousesListPage />} />
              <Route path="/inventory/warehouses/:id" element={<WarehouseDetailPage />} />
              <Route path="/inventory/warehouse-stocks" element={<WarehouseStocksListPage />} />
              <Route path="/inventory/transactions" element={<InventoryTransactionsListPage />} />

              {/* Orders Management */}
              <Route path="/orders" element={<OrdersListPage />} />

              {/* Sales Management */}
              <Route path="/sales/customers" element={<CustomersListPage />} />
              <Route path="/sales/customers/:id" element={<CustomerDetailPage />} />
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
