import { getApiClient } from "../clients";
import { CONTACTS_ENDPOINTS } from "../constants/endpoints";
import type {
  ContactDto,
  CreateContactDto,
  UpdateContactDto,
  SetPrimaryContactDto,
  PaginatedResponse,
  QuerySpec,
} from "@/types/api.types";

class CrmContactsService {
  private readonly apiClient = getApiClient();

  async searchContacts(
    querySpec: QuerySpec,
  ): Promise<PaginatedResponse<ContactDto>> {
    return this.apiClient.get<PaginatedResponse<ContactDto>>(
      CONTACTS_ENDPOINTS.BASE,
      { params: querySpec },
    );
  }

  async getContactById(id: string): Promise<ContactDto> {
    return this.apiClient.get<ContactDto>(CONTACTS_ENDPOINTS.BY_ID(id));
  }

  async getContactsByAccount(
    accountId: string,
  ): Promise<ContactDto[]> {
    // Backend route returns a plain list for account-scoped contacts.
    return this.apiClient.get<ContactDto[]>(
      CONTACTS_ENDPOINTS.BY_ACCOUNT(accountId),
    );
  }

  async createContact(data: CreateContactDto): Promise<ContactDto> {
    return this.apiClient.post<ContactDto>(CONTACTS_ENDPOINTS.BASE, data);
  }

  async updateContact(
    id: string,
    data: UpdateContactDto,
  ): Promise<ContactDto> {
    return this.apiClient.put<ContactDto>(CONTACTS_ENDPOINTS.BY_ID(id), data);
  }

  async setPrimaryContact(
    accountId: string,
    data: SetPrimaryContactDto,
  ): Promise<void> {
    return this.apiClient.post<void>(
      CONTACTS_ENDPOINTS.SET_PRIMARY(accountId, data.contactId),
      undefined,
    );
  }

  async deactivateContact(id: string): Promise<void> {
    return this.apiClient.delete<void>(CONTACTS_ENDPOINTS.BY_ID(id));
  }
}

export const crmContactsService = new CrmContactsService();

