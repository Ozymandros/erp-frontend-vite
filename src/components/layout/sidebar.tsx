"use client";

import type React from "react";

import { useState, useMemo, useCallback } from "react";
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
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth.context";
import { NAV_ITEMS_CONFIG, type NavItemConfig } from "@/config/routes.config";

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

const STORAGE_KEY = "sidebar-open-groups";

function getStoredOpenGroups(): Record<string, boolean> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, boolean>;
      return typeof parsed === "object" && parsed !== null ? parsed : {};
    }
  } catch {
    // ignore
  }
  return {};
}

function setStoredOpenGroups(groups: Record<string, boolean>) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  } catch {
    // ignore
  }
}

export function Sidebar() {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, hasPermission } = useAuth();

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const stored = getStoredOpenGroups();
    const defaults: Record<string, boolean> = {};
    NAV_ITEMS_CONFIG.forEach((item) => {
      if (item.children?.length) {
        defaults[item.title] = stored[item.title] ?? true;
      }
    });
    return Object.keys(defaults).length ? defaults : { ...stored };
  });

  const toggleGroup = useCallback((title: string) => {
    setOpenGroups((prev) => {
      const next = { ...prev, [title]: !prev[title] };
      setStoredOpenGroups(next);
      return next;
    });
  }, []);

  const canSeeItem = useCallback(
    (item: NavItemConfig): boolean => {
      if (!user) return false;
      if (!item.permission) return true;
      if (user.isAdmin) return true;
      return hasPermission(item.permission.module, item.permission.action);
    },
    [user, hasPermission]
  );

  const visibleGroups = useMemo(() => {
    if (!user) return [];

    return NAV_ITEMS_CONFIG.filter((item) => {
      if (item.children?.length) {
        const visibleChildren = item.children.filter((child) => canSeeItem(child));
        return visibleChildren.length > 0;
      }
      return canSeeItem(item);
    });
  }, [user, canSeeItem]);

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        ariaLabel={isMobileOpen ? "Close mobile menu" : "Open mobile menu"}
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
          "fixed md:static inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transition-transform duration-300 ease-in-out overscroll-contain",
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
              {visibleGroups.map((item) => {
                const GroupIcon = iconMap[item.icon];

                if (item.children?.length) {
                  const visibleChildren = item.children.filter((child) => canSeeItem(child));
                  if (visibleChildren.length === 0) return null;

                  const isOpen = openGroups[item.title] !== false;
                  return (
                    <li key={item.title}>
                      <button
                        type="button"
                        onClick={() => toggleGroup(item.title)}
                        className={cn(
                          "flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                          "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        {GroupIcon && <GroupIcon className="h-5 w-5 shrink-0" />}
                        <span className="flex-1 text-left">{item.title}</span>
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4 shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 shrink-0" />
                        )}
                      </button>
                      {isOpen && (
                        <ul className="mt-1 space-y-0.5 pl-8">
                          {visibleChildren.map((child) => {
                            const ChildIcon = iconMap[child.icon];
                            const href = child.href ?? "#";
                            const isActive =
                              href !== "#" &&
                              (location.pathname === href ||
                                (child.href &&
                                  location.pathname.startsWith(child.href)));

                            return (
                              <li key={child.href ?? child.title}>
                                <Link
                                  to={href}
                                  onClick={() => setIsMobileOpen(false)}
                                  className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                    isActive
                                      ? "bg-primary text-primary-foreground"
                                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                  )}
                                >
                                  {ChildIcon && (
                                    <ChildIcon className="h-4 w-4 shrink-0" />
                                  )}
                                  {child.title}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                }

                const href = item.href ?? "#";
                const isActive =
                  href !== "#" &&
                  (location.pathname === href ||
                    (item.href && location.pathname.startsWith(item.href)));
                const Icon = iconMap[item.icon];

                return (
                  <li key={item.href ?? item.title}>
                    <Link
                      to={href}
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
