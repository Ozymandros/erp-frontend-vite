"use client";

import { useMemo } from "react";
import type { LeadDto, QuerySpec } from "@/types/api.types";
import { leadsService } from "@/api/services/leads.service";
import { useDataTable } from "@/hooks/use-data-table";
import { useListActions } from "@/hooks/use-list-actions";
import { useModulePermissions } from "@/hooks/use-permissions";
import { useAuth } from "@/contexts/auth.context";
import { ListPageLayout } from "@/components/layout/list-page-layout";
import { getLeadColumns } from "./leads.columns";
import { CreateLeadDialog } from "@/components/crm/create-lead-dialog";

export function LeadsListPage() {
  const fetcher = (qs: QuerySpec) => leadsService.searchLeads(qs);

  const {
    data: leads,
    isLoading,
    error: dataError,
    querySpec,
    handleSearch,
    handleSort,
    handlePageChange,
    refresh,
  } = useDataTable<LeadDto>({
    fetcher,
    initialQuery: {
      searchFields: "title,contactName,status",
    },
    resourceName: "leads",
  });

  const { user } = useAuth();
  const ownerUsername = user?.username ?? "";

  const { canCreate } = useModulePermissions("leads");

  const {
    isCreateOpen,
    setIsCreateOpen,
    handleCreated,
  } = useListActions<LeadDto>({ refresh });

  const columns = useMemo(() => getLeadColumns(), []);

  return (
    <ListPageLayout
      title="CRM Leads"
      description="Manage and qualify sales leads"
      resourceName="Lead"
      data={leads}
      isLoading={isLoading}
      error={dataError}
      querySpec={querySpec}
      onSearch={handleSearch}
      onSort={handleSort}
      onPageChange={handlePageChange}
      onCreateOpen={canCreate && ownerUsername ? () => setIsCreateOpen(true) : undefined}
      columns={columns}
      searchPlaceholder="Search by title, contact name, or status..."
      cardTitle="All Leads"
      cardDescription={
        leads ? `${leads.total} total leads` : "Loading leads..."
      }
    >
      <CreateLeadDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={handleCreated}
        ownerUsername={ownerUsername}
      />
    </ListPageLayout>
  );
}

