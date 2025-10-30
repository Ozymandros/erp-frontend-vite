import { getApiClient } from "../clients";
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  PaginatedResponse,
  SearchParams,
} from "@/types/api.types";

class UsersService {
  private apiClient = getApiClient();

  async getUsers(): Promise<User[]> {
    return this.apiClient.get<User[]>("/users");
  }

  async getUsersPaginated(
    params?: SearchParams
  ): Promise<PaginatedResponse<User>> {
    return this.apiClient.get<PaginatedResponse<User>>("/users/paginated", {
      params,
    });
  }

  async getUserById(id: string): Promise<User> {
    return this.apiClient.get<User>(`/users/${id}`);
  }

  async createUser(data: CreateUserRequest): Promise<User> {
    return this.apiClient.post<User>("/users", data);
  }

  async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    return this.apiClient.put<User>(`/users/${id}`, data);
  }

  async deleteUser(id: string): Promise<void> {
    return this.apiClient.delete<void>(`/users/${id}`);
  }

  async assignRoles(userId: string, roleIds: string[]): Promise<User> {
    return this.apiClient.post<User>(`/users/${userId}/roles`, { roleIds });
  }
}

export const usersService = new UsersService();
