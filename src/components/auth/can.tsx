import React from "react";
import { usePermission } from "@/hooks/use-permissions";

interface CanProps {
  module: string;
  action: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component for declarative permission checking.
 * Renders children only if the user has the specified permission.
 */
export function Can({ module, action, children, fallback = null }: CanProps) {
  const hasPermission = usePermission(module, action);

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
