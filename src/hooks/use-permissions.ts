import { useAuth } from "@/contexts/auth.context";
import { useMemo } from "react";
import { PERMISSION_ACTIONS } from "@/constants/permissions";

/**
 * Hook to check if the current user has a specific permission.
 * 
 * IMPORTANT: This performs a CLIENT-SIDE check against the cached user.permissions array
 * from the login response. This does NOT make any API calls.
 * 
 * Use this for:
 * - Sidebar navigation filtering (showing/hiding menu items)
 * - UI element visibility (buttons, links, etc.)
 * 
 * DO NOT use this for route authorization - use ProtectedRoute component instead,
 * which calls the backend /permissions/check endpoint.
 * 
 * The user.permissions array is:
 * - Populated from login response (response.user.permissions)
 * - Derived from user's roles on the backend
 * - Cached in AuthContext.user state
 * - Used here for client-side permission checks (NO API calls)
 */
export function usePermission(module: string, action: string) {
  const { user, permissions } = useAuth();

  const hasPermission = useMemo(() => {
    if (!user) return false;
    if (user.isAdmin) return true;

    // Check against cached permissions from context
    // This is a client-side check - NO API call is made
    return permissions.some(
      (p) => 
        p.module.toLowerCase() === module.toLowerCase() && 
        p.action.toLowerCase() === action.toLowerCase()
    );
  }, [user, permissions, module, action]);

  return hasPermission;
}

/**
 * Hook to check all standard CRUD permissions for a module.
 * Returns an object with booleans for each action.
 * 
 * WARNING: This hook makes API calls to /permissions/check endpoint.
 * Only use this hook within components that are already protected by route guards.
 * For UI visibility checks (sidebar, buttons), use usePermission hook instead (uses cached permissions).
 */
export function useModulePermissions(module: string) {
  const { user } = useAuth();
  
  const permissions = useMemo(() => {
    // Default permissions when not logged in or loading
    // We return false for security, though components usually handle auth state
    if (!user) {
      return {
        canCreate: false,
        canRead: false,
        canUpdate: false,
        canDelete: false,
        canExport: false,
      };
    }

    // Admin has full access
    if (user.isAdmin) {
      return {
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: true,
        canExport: true,
      };
    }

    // Check against cached permissions from login response
    // This uses the client-side cache and avoids API calls
    const hasPerm = (action: string) => 
      user.permissions.some(
        (p) => 
          p.module.toLowerCase() === module.toLowerCase() && 
          p.action.toLowerCase() === action.toLowerCase()
      );

    return {
      canCreate: hasPerm(PERMISSION_ACTIONS.CREATE),
      canRead: true, // Default to true as per user preference (usually covered by route guard)
      canUpdate: hasPerm(PERMISSION_ACTIONS.UPDATE),
      canDelete: hasPerm(PERMISSION_ACTIONS.DELETE),
      canExport: true, // Default to true as per user preference
    };
  }, [user, module]);

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
