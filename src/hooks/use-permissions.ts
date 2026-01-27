import { useAuth } from "@/contexts/auth.context";
import { useMemo } from "react";

/**
 * Hook to check if the current user has a specific permission.
 */
export function usePermission(module: string, action: string) {
  const { user } = useAuth();

  const hasPermission = useMemo(() => {
    if (!user) return false;
    if (user.isAdmin) return true;

    return user.permissions.some(
      (p) => 
        p.module.toLowerCase() === module.toLowerCase() && 
        p.action.toLowerCase() === action.toLowerCase()
    );
  }, [user, module, action]);

  return hasPermission;
}

/**
 * Hook to check all standard CRUD permissions for a module.
 * Returns an object with booleans for each action.
 */
export function useModulePermissions(module: string) {
  const { user } = useAuth();

  return useMemo(() => {
    const check = (action: string) => {
      if (!user) return false;
      if (user.isAdmin) return true;
      return user.permissions.some(
        (p) =>
          p.module.toLowerCase() === module.toLowerCase() &&
          p.action.toLowerCase() === action.toLowerCase()
      );
    };

    return {
      canCreate: check("create"),
      canRead: true,
      canUpdate: check("update"),
      canDelete: check("delete"),
      canExport: true,
    };
  }, [user, module]);
}

/**
 * Hook to check multiple permissions.
 * Returns true if the user has ALL specified permissions.
 */
export function usePermissions(permissions: Array<{ module: string; action: string }>) {
  const { user } = useAuth();

  const hasAll = useMemo(() => {
    if (!user) return false;
    if (user.isAdmin) return true;

    return permissions.every(({ module, action }) =>
      user.permissions.some(
        (p) =>
          p.module.toLowerCase() === module.toLowerCase() &&
          p.action.toLowerCase() === action.toLowerCase()
      )
    );
  }, [user, permissions]);

  return hasAll;
}
