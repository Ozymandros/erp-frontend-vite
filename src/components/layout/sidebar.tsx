"use client";

import type React from "react";

import { useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Users,
  Shield,
  Key,
  Menu,
  X,
  Package,
  Warehouse,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  FileText,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth.context";
import { NAV_ITEMS_CONFIG } from "@/config/routes.config";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: { module: string; action: string };
}

// Map icon names to components
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Users,
  Shield,
  Key,
  Package,
  Warehouse,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  FileText,
  ShoppingBag,
};

  export function Sidebar() {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, hasPermission } = useAuth();

  // Filter navigation items based on user permissions
  const visibleNavItems = useMemo(() => {
    if (!user) return [];

    return NAV_ITEMS_CONFIG.filter((item) => {
      // If no permission required, show the item
      if (!item.permission) return true;

      // Admin has full access
      if (user.isAdmin) return true;

      // Check against cached permissions from context
      return hasPermission(item.permission.module, item.permission.action);
    });
  }, [user, hasPermission]);

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </Button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-label="Close mobile menu overlay"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:static inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transition-transform duration-300 ease-in-out",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-border">
            <h1 className="text-xl font-bold text-foreground">ERP Admin</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {visibleNavItems.map((item) => {
                const Icon = iconMap[item.icon];
                const isActive = location.pathname.startsWith(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      {Icon && <Icon className="h-5 w-5" />}
                      {item.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              ERP Admin Portal v1.0
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
