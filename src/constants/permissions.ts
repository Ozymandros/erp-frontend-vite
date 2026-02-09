/**
 * Permission constants to avoid hardcoded string values throughout the application.
 * These match the backend permission module and action names.
 */

// Permission Modules
export const PERMISSION_MODULES = {
  USERS: "Users",
  ROLES: "Roles",
  PERMISSIONS: "Permissions",
  INVENTORY: "Inventory",
  ORDERS: "Orders",
  SALES: "Sales",
  PURCHASING: "Purchasing",
} as const;

// Permission Actions
export const PERMISSION_ACTIONS = {
  READ: "Read",
  CREATE: "Create",
  UPDATE: "Update",
  DELETE: "Delete",
  EXPORT: "Export",
} as const;

// Type helpers for type safety
export type PermissionModule = typeof PERMISSION_MODULES[keyof typeof PERMISSION_MODULES];
export type PermissionAction = typeof PERMISSION_ACTIONS[keyof typeof PERMISSION_ACTIONS];

/**
 * Helper function to create a permission object with type safety
 */
export function createPermission(module: PermissionModule, action: PermissionAction) {
  return { module, action };
}
