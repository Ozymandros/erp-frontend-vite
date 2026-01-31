"use client";

import React from "react";

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth.context";

interface ProtectedRouteProps {
  readonly children: React.ReactNode;
  readonly requiredResource?: string;
  readonly requiredAction?: string;
}

/**
 * Route guard component that protects routes based on permissions.
 *
 * IMPORTANT: This component is the ONLY place that should call the backend /permissions/check endpoint.
 *
 * Flow:
 * 1. User navigates to a protected route
 * 2. ProtectedRoute calls checkPermission() which makes API call to /permissions/check endpoint
 * 3. Backend validates the permission and returns allowed: true/false
 * 4. Route access is granted or denied based on backend response
 *
 * This is different from usePermission hook which:
 * - Uses cached user.permissions from login response
 * - Does NOT make API calls
 * - Used for sidebar/UI visibility only
 */
export function ProtectedRoute({
  children,
  requiredResource,
  requiredAction,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, checkApiPermission } = useAuth();
  const location = useLocation();
  const [hasPermission, setHasPermission] = React.useState<boolean | null>(
    null,
  );

  React.useEffect(() => {
    const verifyPermission = async () => {
      if (requiredResource && requiredAction) {
        // Call backend /permissions/check endpoint for route authorization
        // This is the ONLY place where the endpoint should be called
        const allowed = await checkApiPermission(
          requiredResource,
          requiredAction,
        );
        setHasPermission(allowed);
      } else {
        setHasPermission(true);
      }
    };

    if (isAuthenticated && !isLoading) {
      verifyPermission();
    }
  }, [
    isAuthenticated,
    isLoading,
    requiredResource,
    requiredAction,
    checkApiPermission,
  ]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredResource && requiredAction && hasPermission === false) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-destructive mb-2">
            Access Denied
          </h1>
          <p className="text-muted-foreground">
            You don't have permission to access this module. Please contact your
            administrator.
          </p>
        </div>
      </div>
    );
  }

  if (hasPermission === null && requiredResource && requiredAction) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying permissions...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
