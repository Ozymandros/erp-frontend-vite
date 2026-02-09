import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { Role } from "@/types/api.types";

vi.mock("@/hooks/use-permissions", () => ({
  usePermission: vi.fn(() => true),
}));

vi.mock("@/components/roles/edit-role-dialog", () => ({
  EditRoleDialog: vi.fn(() => null),
}));

vi.mock("@/components/roles/delete-role-dialog", () => ({
  DeleteRoleDialog: vi.fn(() => null),
}));

vi.mock("@/components/roles/permission-selector", () => ({
  PermissionSelector: vi.fn(() => null),
}));

vi.mock("@/api/services/roles.service", () => ({
  rolesService: {
    getRoleById: vi.fn(),
    getUsersInRole: vi.fn(() => Promise.resolve([])),
  },
}));

import { RoleDetailPage } from "../role-detail";
import { rolesService } from "@/api/services/roles.service";

const mockRole: Role = {
  id: "role-1",
  name: "Administrator",
  description: "Full system access",
  permissions: [],
  createdAt: "2024-01-01T00:00:00Z",
  createdBy: "admin",
};

function TestWrapper({ roleId = "role-1" }: { roleId?: string }) {
  return (
    <MemoryRouter initialEntries={[`/roles/${roleId}`]}>
      <Routes>
        <Route path="/roles/:id" element={<RoleDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("RoleDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading state initially", () => {
    vi.mocked(rolesService.getRoleById).mockImplementation(() => new Promise(() => {}));

    const { container } = render(<TestWrapper />);

    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("should display role details after loading", async () => {
    vi.mocked(rolesService.getRoleById).mockResolvedValue(mockRole);

    render(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Administrator" })).toBeInTheDocument();
    });

    // Check for card title which is actually rendered
    expect(screen.getByText("Role Information")).toBeInTheDocument();
  });

  it("should handle error when role not found", async () => {
    vi.mocked(rolesService.getRoleById).mockRejectedValue(new Error("Role not found"));

    render(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByText(/role not found/i)).toBeInTheDocument();
    });
  });
});
