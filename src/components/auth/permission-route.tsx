"use client";

import React from "react";
import { useLocation } from "react-router-dom";
import { ProtectedRoute } from "./protected-route";
import { getRoutePermission } from "@/config/routes.config";

interface PermissionRouteProps {
  readonly children: React.ReactNode;
  readonly path: string; // Route template path (e.g., "/users/:id")
}

/**
 * Component that wraps a route with permission checking.
 * Automatically extracts the required permission from the route configuration.
 * Uses the actual URL pathname for permission lookup to handle dynamic routes correctly.
 */
export function PermissionRoute({ children, path }: PermissionRouteProps) {
  const location = useLocation();
  
  // Try to get permission from the actual pathname first (handles dynamic routes)
  // Fall back to the route template path if needed
  const permission = getRoutePermission(location.pathname) || getRoutePermission(path);

  return (
    <ProtectedRoute
      requiredResource={permission?.module}
      requiredAction={permission?.action}
    >
      {children}
    </ProtectedRoute>
  );
}
