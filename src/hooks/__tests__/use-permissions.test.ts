import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { usePermission, useModulePermissions, usePermissions } from "../use-permissions";
import { useAuth } from "@/contexts/auth.context";

// Mock useAuth
vi.mock("@/contexts/auth.context", () => ({
  useAuth: vi.fn(),
}));

describe("Permissions Hooks", () => {
  const mockPermissions = [
    { module: "Users", action: "CREATE" },
    { module: "Users", action: "READ" },
  ];

  describe("usePermission", () => {
    it("should return false when no user is logged in", () => {
      vi.mocked(useAuth).mockReturnValue({ user: null, permissions: [] } as never);
      const { result } = renderHook(() => usePermission("Users", "CREATE"));
      expect(result.current).toBe(false);
    });

    it("should return true for admin users", () => {
      vi.mocked(useAuth).mockReturnValue({ user: { isAdmin: true }, permissions: [] } as never);
      const { result } = renderHook(() => usePermission("Users", "CREATE"));
      expect(result.current).toBe(true);
    });

    it("should return true when user has permission", () => {
      vi.mocked(useAuth).mockReturnValue({
        user: { isAdmin: false },
        permissions: mockPermissions,
      } as never);
      const { result } = renderHook(() => usePermission("Users", "CREATE"));
      expect(result.current).toBe(true);
    });
  });

  describe("useModulePermissions", () => {
    it("should return all false when no user is logged in", () => {
      vi.mocked(useAuth).mockReturnValue({ user: null } as never);
      const { result } = renderHook(() => useModulePermissions("Users"));
      expect(result.current.canCreate).toBe(false);
    });

    it("should return all true for admin users", () => {
      vi.mocked(useAuth).mockReturnValue({ user: { isAdmin: true } } as never);
      const { result } = renderHook(() => useModulePermissions("Users"));
      expect(result.current.canCreate).toBe(true);
      expect(result.current.canDelete).toBe(true);
    });

    it("should check specific permissions for non-admin users", () => {
      vi.mocked(useAuth).mockReturnValue({
        user: {
          isAdmin: false,
          permissions: [{ module: "Users", action: "CREATE" }],
        },
      } as never);
      const { result } = renderHook(() => useModulePermissions("Users"));
      expect(result.current.canCreate).toBe(true);
      expect(result.current.canDelete).toBe(false);
    });
  });

  describe("usePermissions", () => {
    it("should return true if user has all listed permissions", () => {
      vi.mocked(useAuth).mockReturnValue({
        user: {
          isAdmin: false,
          permissions: mockPermissions,
        },
      } as never);
      const { result } = renderHook(() =>
        usePermissions([
          { module: "Users", action: "CREATE" },
          { module: "Users", action: "READ" },
        ])
      );
      expect(result.current).toBe(true);
    });

    it("should return false if user is missing any permission", () => {
      vi.mocked(useAuth).mockReturnValue({
        user: {
          isAdmin: false,
          permissions: [{ module: "Users", action: "CREATE" }],
        },
      } as never);
      const { result } = renderHook(() =>
        usePermissions([
          { module: "Users", action: "CREATE" },
          { module: "Users", action: "DELETE" },
        ])
      );
      expect(result.current).toBe(false);
    });

    it("should return true for admin user regardless of specific permissions", () => {
      vi.mocked(useAuth).mockReturnValue({
        user: { isAdmin: true, permissions: [] },
      } as never);

      const { result } = renderHook(() =>
        usePermissions([{ module: "Users", action: "CREATE" }])
      );
      expect(result.current).toBe(true);
    });
  });
});
