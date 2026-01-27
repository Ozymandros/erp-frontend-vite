import { useAuth } from "@/contexts/auth.context";
import { useMemo, useState, useEffect } from "react";

/**
 * Hook to check if the current user has a specific permission.
 * Performs a local check against the user's permissions array.
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
 * Trigger real backend calls via checkPermission.
 */
export function useModulePermissions(module: string) {
  const { user, checkPermission } = useAuth();
  const [permissions, setPermissions] = useState({
    canCreate: false,
    canRead: true, // Default to true as per user preference
    canUpdate: false,
    canDelete: false,
    canExport: true, // Default to true as per user preference
  });

  useEffect(() => {
    if (!user) return;
    if (user.isAdmin) {
      setPermissions({
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: true,
        canExport: true,
      });
      return;
    }

    const checkAll = async () => {
      // In a real app we might want to batch these, but for now we follow the "see calls" requirement
      const [create, update, del] = await Promise.all([
        checkPermission(module, "create"),
        checkPermission(module, "update"),
        checkPermission(module, "delete"),
      ]);

      setPermissions({
        canCreate: create,
        canRead: true,
        canUpdate: update,
        canDelete: del,
        canExport: true,
      });
    };

    checkAll();
  }, [module, user, checkPermission]);

  return permissions;
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
