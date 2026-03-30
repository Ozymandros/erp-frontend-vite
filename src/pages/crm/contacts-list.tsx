"use client";

import { useMemo } from "react";
import type { ContactDto, QuerySpec } from "@/types/api.types";
import { crmContactsService } from "@/api/services/crm-contacts.service";
import { useDataTable } from "@/hooks/use-data-table";
import { useListActions } from "@/hooks/use-list-actions";
import { useModulePermissions } from "@/hooks/use-permissions";
import { ListPageLayout } from "@/components/layout/list-page-layout";
import { getContactColumns } from "./contacts.columns";
import { CreateContactDialog } from "@/components/crm/create-contact-dialog";

export function ContactsListPage() {
  const fetcher = (qs: QuerySpec) => crmContactsService.searchContacts(qs);

  const {
    data: contacts,
    isLoading,
    error: dataError,
    querySpec,
    handleSearch,
    handleSort,
    handlePageChange,
    refresh,
  } = useDataTable<ContactDto>({
    fetcher,
    initialQuery: {
      searchFields: "fullName,accountId,email",
    },
    resourceName: "contacts",
  });

  const { canCreate } = useModulePermissions("contacts");

  const {
    isCreateOpen,
    setIsCreateOpen,
    handleCreated,
  } = useListActions<ContactDto>({ refresh });

  const columns = useMemo(() => getContactColumns(), []);

  return (
    <ListPageLayout
      title="CRM Contacts"
      description="Manage contacts for your accounts"
      resourceName="Contact"
      data={contacts}
      isLoading={isLoading}
      error={dataError}
      querySpec={querySpec}
      onSearch={handleSearch}
      onSort={handleSort}
      onPageChange={handlePageChange}
      onCreateOpen={canCreate ? () => setIsCreateOpen(true) : undefined}
      columns={columns}
      searchPlaceholder="Search by name, account ID, or email..."
      cardTitle="All Contacts"
      cardDescription={
        contacts ? `${contacts.total} total contacts` : "Loading contacts..."
      }
    >
      <CreateContactDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={handleCreated}
      />
    </ListPageLayout>
  );
}

