/**
 * Route configuration mapping routes to their required permissions.
 * This matches the backend pattern: [HasPermission("Module", "Action")]
 */

import { PERMISSION_MODULES, PERMISSION_ACTIONS, createPermission, type PermissionModule, type PermissionAction } from "@/constants/permissions";

export interface RoutePermission {
  module: PermissionModule;
  action: PermissionAction;
}

export interface RouteConfig {
  path: string;
  permission?: RoutePermission;
}

/**
 * Route permissions configuration.
 * Maps each route to its required permission (module, action).
 * Routes without permission are accessible to all authenticated users.
 */
export const ROUTE_PERMISSIONS: Record<string, RoutePermission> = {
  // Users Management
  "/users": createPermission(PERMISSION_MODULES.USERS, PERMISSION_ACTIONS.READ),
  "/users/:id": createPermission(PERMISSION_MODULES.USERS, PERMISSION_ACTIONS.READ),

  // Roles Management
  "/roles": createPermission(PERMISSION_MODULES.ROLES, PERMISSION_ACTIONS.READ),
  "/roles/:id": createPermission(PERMISSION_MODULES.ROLES, PERMISSION_ACTIONS.READ),

  // Permissions Management
  "/permissions": createPermission(PERMISSION_MODULES.PERMISSIONS, PERMISSION_ACTIONS.READ),

  // Inventory Management
  "/inventory/products": createPermission(PERMISSION_MODULES.INVENTORY, PERMISSION_ACTIONS.READ),
  "/inventory/products/:id": createPermission(PERMISSION_MODULES.INVENTORY, PERMISSION_ACTIONS.READ),
  "/inventory/warehouses": createPermission(PERMISSION_MODULES.INVENTORY, PERMISSION_ACTIONS.READ),
  "/inventory/warehouses/:id": createPermission(PERMISSION_MODULES.INVENTORY, PERMISSION_ACTIONS.READ),
  "/inventory/warehouse-stocks": createPermission(PERMISSION_MODULES.INVENTORY, PERMISSION_ACTIONS.READ),
  "/inventory/transactions": createPermission(PERMISSION_MODULES.INVENTORY, PERMISSION_ACTIONS.READ),
  "/inventory/stock-operations": createPermission(PERMISSION_MODULES.INVENTORY, PERMISSION_ACTIONS.READ),

  // Orders Management
  "/orders": createPermission(PERMISSION_MODULES.ORDERS, PERMISSION_ACTIONS.READ),
  "/orders/:id": createPermission(PERMISSION_MODULES.ORDERS, PERMISSION_ACTIONS.READ),

  // Sales Management
  "/sales/customers": createPermission(PERMISSION_MODULES.SALES, PERMISSION_ACTIONS.READ),
  "/sales/customers/:id": createPermission(PERMISSION_MODULES.SALES, PERMISSION_ACTIONS.READ),
  "/sales/orders": createPermission(PERMISSION_MODULES.SALES, PERMISSION_ACTIONS.READ),
  "/sales/orders/:id": createPermission(PERMISSION_MODULES.SALES, PERMISSION_ACTIONS.READ),

  // Purchasing Management
  "/purchasing/orders": createPermission(PERMISSION_MODULES.PURCHASING, PERMISSION_ACTIONS.READ),
  "/purchasing/orders/:id": createPermission(PERMISSION_MODULES.PURCHASING, PERMISSION_ACTIONS.READ),
};

/**
 * Navigation items configuration with permissions.
 * Used by the Sidebar component to filter visible navigation items.
 */
export interface NavItemConfig {
  title: string;
  href: string;
  icon: string; // Icon component name (for reference)
  permission?: RoutePermission;
}

export const NAV_ITEMS_CONFIG: NavItemConfig[] = [
  {
    title: "Users",
    href: "/users",
    icon: "Users",
    permission: createPermission(PERMISSION_MODULES.USERS, PERMISSION_ACTIONS.READ),
  },
  {
    title: "Roles",
    href: "/roles",
    icon: "Shield",
    permission: createPermission(PERMISSION_MODULES.ROLES, PERMISSION_ACTIONS.READ),
  },
  {
    title: "Permissions",
    href: "/permissions",
    icon: "Key",
    permission: createPermission(PERMISSION_MODULES.PERMISSIONS, PERMISSION_ACTIONS.READ),
  },
  {
    title: "Products",
    href: "/inventory/products",
    icon: "Package",
    permission: createPermission(PERMISSION_MODULES.INVENTORY, PERMISSION_ACTIONS.READ),
  },
  {
    title: "Warehouses",
    href: "/inventory/warehouses",
    icon: "Warehouse",
    permission: createPermission(PERMISSION_MODULES.INVENTORY, PERMISSION_ACTIONS.READ),
  },
  {
    title: "Customers",
    href: "/sales/customers",
    icon: "DollarSign",
    permission: createPermission(PERMISSION_MODULES.SALES, PERMISSION_ACTIONS.READ),
  },
  {
    title: "Sales Orders",
    href: "/sales/orders",
    icon: "ShoppingCart",
    permission: createPermission(PERMISSION_MODULES.SALES, PERMISSION_ACTIONS.READ),
  },
  {
    title: "Purchase Orders",
    href: "/purchasing/orders",
    icon: "ShoppingBag",
    permission: createPermission(PERMISSION_MODULES.PURCHASING, PERMISSION_ACTIONS.READ),
  },
  {
    title: "Warehouse Stocks",
    href: "/inventory/warehouse-stocks",
    icon: "TrendingUp",
    permission: createPermission(PERMISSION_MODULES.INVENTORY, PERMISSION_ACTIONS.READ),
  },
  {
    title: "Transactions",
    href: "/inventory/transactions",
    icon: "FileText",
    permission: createPermission(PERMISSION_MODULES.INVENTORY, PERMISSION_ACTIONS.READ),
  },
  {
    title: "Stock Operations",
    href: "/inventory/stock-operations",
    icon: "TrendingUp",
    permission: createPermission(PERMISSION_MODULES.INVENTORY, PERMISSION_ACTIONS.READ),
  },
  {
    title: "Orders",
    href: "/orders",
    icon: "ShoppingCart",
    permission: createPermission(PERMISSION_MODULES.ORDERS, PERMISSION_ACTIONS.READ),
  },
];

/**
 * Get permission for a route path.
 * Handles dynamic routes by matching the base path.
 */
export function getRoutePermission(path: string): RoutePermission | undefined {
  // Try exact match first
  if (ROUTE_PERMISSIONS[path]) {
    return ROUTE_PERMISSIONS[path];
  }

  // Try matching dynamic routes (e.g., /users/:id -> /users)
  for (const [routePath, permission] of Object.entries(ROUTE_PERMISSIONS)) {
    if (routePath.includes(":id")) {
      const basePath = routePath.split("/:id")[0];
      if (path.startsWith(basePath + "/")) {
        return permission;
      }
    }
  }

  return undefined;
}
