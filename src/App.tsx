import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth.context";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AppLayout } from "@/components/layout/app-layout";
import { LoginPage } from "@/pages/auth/login";
import { RegisterPage } from "@/pages/auth/register";
import { DashboardPage } from "@/pages/dashboard/dashboard";
import { ProfilePage } from "@/pages/profile/profile";
import { UsersListPage } from "@/pages/users/users-list";
import { UserDetailPage } from "@/pages/users/user-detail";
import { RolesListPage } from "@/pages/roles/roles-list";
import { RoleDetailPage } from "@/pages/roles/role-detail";
import { PermissionsListPage } from "@/pages/permissions/permissions-list";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

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
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
