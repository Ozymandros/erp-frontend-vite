import { describe, it, expect, vi, beforeEach } from "vitest";
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  PaginatedResponse,
  SearchParams,
  QuerySpec,
  Role,
} from "@/types/api.types";

const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

vi.mock("@/api/clients", () => ({
  getApiClient: () => mockApiClient,
}));

// Import after mocking - services will be instantiated with mocked client
const { usersService } = await import("@/api/services/users.service");

describe("UsersService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getUsers", () => {
    it("should fetch all users", async () => {
      const mockUsers: User[] = [
        {
          id: "1",
          email: "user1@example.com",
          username: "user1",
        } as User,
      ];

      mockApiClient.get.mockResolvedValue(mockUsers);

      const result = await usersService.getUsers();

      expect(mockApiClient.get).toHaveBeenCalledWith("/auth/api/users");
      expect(result).toEqual(mockUsers);
    });
  });

  describe("getUsersPaginated", () => {
    it("should fetch paginated users", async () => {
      const params: SearchParams = {
        page: 1,
        pageSize: 10,
      };

      const mockResponse: PaginatedResponse<User> = {
        items: [],
        page: 1,
        pageSize: 10,
        total: 0,
        hasNext: false,
        hasPrevious: false,
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await usersService.getUsersPaginated(params);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/auth/api/users/paginated",
        { params }
      );
      expect(result).toEqual(mockResponse);
    });

    it("should fetch paginated users without params", async () => {
      const mockResponse: PaginatedResponse<User> = {
        items: [],
        page: 1,
        pageSize: 10,
        total: 0,
        hasNext: false,
        hasPrevious: false,
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      await usersService.getUsersPaginated();

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/auth/api/users/paginated",
        { params: undefined }
      );
    });
  });

  describe("searchUsers", () => {
    it("should search users with query spec", async () => {
      const querySpec: QuerySpec = {
        page: 1,
        pageSize: 20,
        searchTerm: "test",
      };

      const mockResponse: PaginatedResponse<User> = {
        items: [],
        page: 1,
        pageSize: 20,
        total: 0,
        hasNext: false,
        hasPrevious: false,
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await usersService.searchUsers(querySpec);

      expect(mockApiClient.get).toHaveBeenCalledWith("/auth/api/users/search", {
        params: querySpec,
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getUserById", () => {
    it("should fetch user by ID", async () => {
      const mockUser: User = {
        id: "1",
        email: "user@example.com",
        username: "user",
      } as User;

      mockApiClient.get.mockResolvedValue(mockUser);

      const result = await usersService.getUserById("1");

      expect(mockApiClient.get).toHaveBeenCalledWith("/auth/api/users/1");
      expect(result).toEqual(mockUser);
    });
  });

  describe("getUserByEmail", () => {
    it("should fetch user by email", async () => {
      const mockUser: User = {
        id: "1",
        email: "user@example.com",
        username: "user",
      } as User;

      mockApiClient.get.mockResolvedValue(mockUser);

      const result = await usersService.getUserByEmail("user@example.com");

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/auth/api/users/email/user@example.com"
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe("getCurrentUser", () => {
    it("should get current user", async () => {
      const mockUser: User = {
        id: "1",
        email: "current@example.com",
        username: "currentuser",
      } as User;

      mockApiClient.get.mockResolvedValue(mockUser);

      const result = await usersService.getCurrentUser();

      expect(mockApiClient.get).toHaveBeenCalledWith("/auth/api/users/me");
      expect(result).toEqual(mockUser);
    });
  });

  describe("createUser", () => {
    it("should create a new user", async () => {
      const newUser: CreateUserRequest = {
        email: "newuser@example.com",
        username: "newuser",
        password: "password123",
      };

      const mockUser: User = {
        id: "2",
        ...newUser,
      } as User;

      mockApiClient.post.mockResolvedValue(mockUser);

      const result = await usersService.createUser(newUser);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/auth/api/users/create",
        newUser
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe("updateUser", () => {
    it("should update an existing user", async () => {
      const updateData: UpdateUserRequest = {
        email: "updated@example.com",
        firstName: "Updated",
      };

      mockApiClient.put.mockResolvedValue(undefined);

      await usersService.updateUser("1", updateData);

      expect(mockApiClient.put).toHaveBeenCalledWith(
        "/auth/api/users/1",
        updateData
      );
    });
  });

  describe("deleteUser", () => {
    it("should delete a user", async () => {
      mockApiClient.delete.mockResolvedValue(undefined);

      await usersService.deleteUser("1");

      expect(mockApiClient.delete).toHaveBeenCalledWith("/auth/api/users/1");
    });
  });

  describe("assignRole", () => {
    it("should assign a role to a user", async () => {
      mockApiClient.post.mockResolvedValue(undefined);

      await usersService.assignRole("1", "admin");

      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/auth/api/users/1/roles/admin"
      );
    });
  });

  describe("removeRole", () => {
    it("should remove a role from a user", async () => {
      mockApiClient.delete.mockResolvedValue(undefined);

      await usersService.removeRole("1", "admin");

      expect(mockApiClient.delete).toHaveBeenCalledWith(
        "/auth/api/users/1/roles/admin"
      );
    });
  });

  describe("getUserRoles", () => {
    it("should get roles for a user", async () => {
      const mockRoles: Role[] = [
        {
          id: "1",
          name: "admin",
        } as Role,
      ];

      mockApiClient.get.mockResolvedValue(mockRoles);

      const result = await usersService.getUserRoles("1");

      expect(mockApiClient.get).toHaveBeenCalledWith("/auth/api/users/1/roles");
      expect(result).toEqual(mockRoles);
    });
  });
});
