import { getApiClient } from "../clients";
import { USERS_ENDPOINTS } from "../constants/endpoints";
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  PaginatedResponse,
  SearchParams,
  QuerySpec,
  Role,
} from "@/types/api.types";

class UsersService {
  private apiClient = getApiClient();

  async getUsers(): Promise<User[]> {
    return this.apiClient.get<User[]>(USERS_ENDPOINTS.BASE);
  }

  async getUsersPaginated(
    params?: SearchParams
  ): Promise<PaginatedResponse<User>> {
    return this.apiClient.get<PaginatedResponse<User>>(
      USERS_ENDPOINTS.PAGINATED,
      {
        params,
      }
    );
  }

  async searchUsers(querySpec: QuerySpec): Promise<PaginatedResponse<User>> {
    return this.apiClient.get<PaginatedResponse<User>>(USERS_ENDPOINTS.SEARCH, {
      params: querySpec,
    });
  }

  async getUserById(id: string): Promise<User> {
    return this.apiClient.get<User>(USERS_ENDPOINTS.BY_ID(id));
  }

  async getUserByEmail(email: string): Promise<User> {
    return this.apiClient.get<User>(USERS_ENDPOINTS.BY_EMAIL(email));
  }

  async getCurrentUser(): Promise<User> {
    return this.apiClient.get<User>(USERS_ENDPOINTS.ME);
  }

  async createUser(data: CreateUserRequest): Promise<User> {
    return this.apiClient.post<User>(USERS_ENDPOINTS.CREATE, data);
  }

  async updateUser(id: string, data: UpdateUserRequest): Promise<void> {
    return this.apiClient.put<void>(USERS_ENDPOINTS.BY_ID(id), data);
  }

  async deleteUser(id: string): Promise<void> {
    return this.apiClient.delete<void>(USERS_ENDPOINTS.BY_ID(id));
  }

  async assignRole(userId: string, roleName: string): Promise<void> {
    return this.apiClient.post<void>(
      USERS_ENDPOINTS.ASSIGN_ROLE(userId, roleName)
    );
  }

  async removeRole(userId: string, roleName: string): Promise<void> {
    return this.apiClient.delete<void>(
      USERS_ENDPOINTS.REMOVE_ROLE(userId, roleName)
    );
  }

  async getUserRoles(userId: string): Promise<Role[]> {
    return this.apiClient.get<Role[]>(USERS_ENDPOINTS.GET_ROLES(userId));
  }

  async exportToXlsx(): Promise<Blob> {
    const response = await fetch(USERS_ENDPOINTS.EXPORT_XLSX, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    if (!response.ok) throw new Error("Failed to export users to XLSX");
    return response.blob();
  }

  async exportToPdf(): Promise<Blob> {
    const response = await fetch(USERS_ENDPOINTS.EXPORT_PDF, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    if (!response.ok) throw new Error("Failed to export users to PDF");
    return response.blob();
  }
}

export const usersService = new UsersService();
