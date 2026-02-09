import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { User } from "@/types/api.types";

vi.mock("@/api/services/users.service", () => ({
  usersService: {
    getUserById: vi.fn(),
    assignRolesToUser: vi.fn(),
  },
}));

vi.mock("@/hooks/use-permissions", () => ({
  usePermission: vi.fn(() => true),
}));

vi.mock("@/components/users/role-selector", () => ({
  RoleSelector: vi.fn(() => null),
}));

vi.mock("@/components/users/edit-user-dialog", () => ({
  EditUserDialog: vi.fn(() => null),
}));

vi.mock("@/components/users/delete-user-dialog", () => ({
  DeleteUserDialog: vi.fn(() => null),
}));

import { UserDetailPage } from "../user-detail";
import { usersService } from "@/api/services/users.service";

const mockUser: User = {
  id: "user-1",
  username: "johndoe",
  email: "john@example.com",
  firstName: "John",
  lastName: "Doe",
  isActive: true,
  roles: [],
  emailConfirmed: true,
  isExternalLogin: false,
  isAdmin: false,
  permissions: [],
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-02T00:00:00Z",
  createdBy: "admin",
  updatedBy: "admin",
};

function TestWrapper({ userId = "user-1" }: { userId?: string }) {
  return (
    <MemoryRouter initialEntries={[`/users/${userId}`]}>
      <Routes>
        <Route path="/users/:id" element={<UserDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("UserDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading state initially", () => {
    vi.mocked(usersService.getUserById).mockImplementation(() => new Promise(() => {}));

    const { container } = render(<TestWrapper />);

    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("should display user details after loading", async () => {
    vi.mocked(usersService.getUserById).mockResolvedValue(mockUser);

    render(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "johndoe" })).toBeInTheDocument();
    });

    expect(screen.getAllByText("john@example.com").length).toBeGreaterThanOrEqual(1);
  });

  it("should handle error when user not found", async () => {
    vi.mocked(usersService.getUserById).mockRejectedValue(new Error("User not found"));

    render(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByText(/user not found/i)).toBeInTheDocument();
    });
  });
});
