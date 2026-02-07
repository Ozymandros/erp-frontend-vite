import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { UsersListPage } from "../users-list";
import { usersService } from "@/api/services/users.service";
import type { User, PaginatedResponse } from "@/types/api.types";

// Mock services
vi.mock("@/api/services/users.service", () => ({
  usersService: {
    searchUsers: vi.fn(),
    exportToXlsx: vi.fn(),
    exportToPdf: vi.fn(),
  },
}));

// Mock permissions
vi.mock("@/hooks/use-permissions", () => ({
  useModulePermissions: vi.fn(() => ({
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    canExport: true,
  })),
}));

// Mock dialogs to avoid complex rendering
interface MockDialogProps {
  open: boolean;
  onSuccess?: () => void;
}

vi.mock("@/components/users/create-user-dialog", () => ({
  CreateUserDialog: ({ open, onSuccess }: MockDialogProps) => 
    open ? <div role="dialog">Create User Dialog <button onClick={() => onSuccess?.()}>Create</button></div> : null,
}));

vi.mock("@/components/users/edit-user-dialog", () => ({
  EditUserDialog: ({ open, onSuccess }: MockDialogProps) => 
    open ? <div role="dialog">Edit User Dialog <button onClick={() => onSuccess?.()}>Save</button></div> : null,
}));

vi.mock("@/components/users/delete-user-dialog", () => ({
  DeleteUserDialog: ({ open, onSuccess }: MockDialogProps) => 
    open ? <div role="dialog">Delete User Dialog <button onClick={() => onSuccess?.()}>Delete</button></div> : null,
}));

// Mock generic components if needed, but DataTable is fine to render if it's just a table
// If DataTable is complex, we might want to mock it, but integration test is better.

const mockUsers: User[] = [
  {
    id: "user-1",
    username: "john.doe",
    email: "john@example.com",
    firstName: "John",
    lastName: "Doe",
    emailConfirmed: true,
    isExternalLogin: false,
    isActive: true,
    isAdmin: true,
    roles: [
      {
        id: "role-1",
        name: "Admin",
        permissions: [],
        createdAt: "2024-01-01T00:00:00Z",
        createdBy: "system",
      },
    ],
    permissions: [],
    createdAt: "2024-01-01T00:00:00Z",
    createdBy: "system",
  },
  {
    id: "user-2",
    username: "jane.smith",
    email: "jane@example.com",
    firstName: "Jane",
    lastName: "Smith",
    emailConfirmed: false,
    isExternalLogin: false,
    isActive: false,
    isAdmin: false,
    roles: [],
    permissions: [],
    createdAt: "2024-01-02T00:00:00Z",
    createdBy: "system",
    updatedAt: "2024-01-02T00:00:00Z",
    updatedBy: "system",
  },
];

const mockResponse: PaginatedResponse<User> = {
  items: mockUsers,
  total: 2,
  page: 1,
  pageSize: 10,
  totalPages: 1,
  hasPreviousPage: false,
  hasNextPage: false,
};

describe("UsersListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render users list correctly", async () => {
    vi.mocked(usersService.searchUsers).mockResolvedValue(mockResponse);

    render(
      <MemoryRouter>
        <UsersListPage />
      </MemoryRouter>
    );

    // Initial loading state might be brief or handled by Suspense/internally
    // We wait for data to appear
    await waitFor(() => {
      expect(screen.getByText("john.doe")).toBeInTheDocument();
      expect(screen.getByText("jane.smith")).toBeInTheDocument();
    });

    // Check for other details
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Inactive")).toBeInTheDocument();
  });

  it("should handle empty state", async () => {
    vi.mocked(usersService.searchUsers).mockResolvedValue({
      ...mockResponse,
      items: [],
      total: 0,
    });

    render(
      <MemoryRouter>
        <UsersListPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("No user found.")).toBeInTheDocument();
    });
  });

  it("should open create dialog when add button is clicked", async () => {
    vi.mocked(usersService.searchUsers).mockResolvedValue(mockResponse);

    render(
      <MemoryRouter>
        <UsersListPage />
      </MemoryRouter>
    );

    const addButton = await screen.findByRole("button", { name: /add user/i });
    expect(addButton).toBeInTheDocument();

    await userEvent.click(addButton);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Create User Dialog")).toBeInTheDocument();
  });

  it("should open edit dialog when edit button is clicked", async () => {
    vi.mocked(usersService.searchUsers).mockResolvedValue(mockResponse);

    render(
      <MemoryRouter>
        <UsersListPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("john.doe")).toBeInTheDocument();
    });

    // Find edit button for first user
    // The columns have "Edit User" title on button
    const editButtons = screen.getAllByTitle("Edit User");
    await userEvent.click(editButtons[0]);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Edit User Dialog")).toBeInTheDocument();
  });

  it("should open delete dialog when delete button is clicked", async () => {
    vi.mocked(usersService.searchUsers).mockResolvedValue(mockResponse);

    render(
      <MemoryRouter>
        <UsersListPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("john.doe")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTitle("Delete User");
    await userEvent.click(deleteButtons[0]);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Delete User Dialog")).toBeInTheDocument();
  });
});
