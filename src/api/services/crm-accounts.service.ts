import { getApiClient } from "../clients";
import { ACCOUNTS_ENDPOINTS } from "../constants/endpoints";
import type {
  AccountDto,
  UpdateAccountOwnerDto,
  PaginatedResponse,
  QuerySpec,
} from "@/types/api.types";

class CrmAccountsService {
  private readonly apiClient = getApiClient();

  async searchAccounts(
    querySpec: QuerySpec,
  ): Promise<PaginatedResponse<AccountDto>> {
    return this.apiClient.get<PaginatedResponse<AccountDto>>(
      ACCOUNTS_ENDPOINTS.BASE,
      { params: querySpec },
    );
  }

  async getAccountById(id: string): Promise<AccountDto> {
    return this.apiClient.get<AccountDto>(ACCOUNTS_ENDPOINTS.BY_ID(id));
  }

  // MVP action: update owner only (backend exposes PUT {id}/owner)
  async updateAccountOwner(
    id: string,
    data: UpdateAccountOwnerDto,
  ): Promise<AccountDto> {
    return this.apiClient.put<AccountDto>(ACCOUNTS_ENDPOINTS.UPDATE_OWNER(id), data);
  }
}

export const crmAccountsService = new CrmAccountsService();

