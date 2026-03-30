"use client";

import { useMemo } from "react";
import type { OpportunityDto, QuerySpec } from "@/types/api.types";
import { crmOpportunitiesService } from "@/api/services/crm-opportunities.service";
import { useDataTable } from "@/hooks/use-data-table";
import { useListActions } from "@/hooks/use-list-actions";
import { useModulePermissions } from "@/hooks/use-permissions";
import { useAuth } from "@/contexts/auth.context";
import { ListPageLayout } from "@/components/layout/list-page-layout";
import { getOpportunityColumns } from "./opportunities.columns";
import { CreateOpportunityDialog } from "@/components/crm/create-opportunity-dialog";

export function OpportunitiesListPage() {
  const fetcher = (qs: QuerySpec) => crmOpportunitiesService.searchOpportunities(qs);

  const {
    data: opportunities,
    isLoading,
    error: dataError,
    querySpec,
    handleSearch,
    handleSort,
    handlePageChange,
    refresh,
  } = useDataTable<OpportunityDto>({
    fetcher,
    initialQuery: {
      searchFields: "name,stage,ownerUsername",
    },
    resourceName: "opportunities",
  });

  const { user } = useAuth();
  const ownerUsername = user?.username ?? "";

  const { canCreate } = useModulePermissions("opportunities");

  const {
    isCreateOpen,
    setIsCreateOpen,
    handleCreated,
  } = useListActions<OpportunityDto>({ refresh });

  const columns = useMemo(() => getOpportunityColumns(), []);

  return (
    <ListPageLayout
      title="CRM Opportunities"
      description="Manage your opportunity pipeline"
      resourceName="Opportunity"
      data={opportunities}
      isLoading={isLoading}
      error={dataError}
      querySpec={querySpec}
      onSearch={handleSearch}
      onSort={handleSort}
      onPageChange={handlePageChange}
      onCreateOpen={canCreate && ownerUsername ? () => setIsCreateOpen(true) : undefined}
      columns={columns}
      searchPlaceholder="Search by name, stage, or owner..."
      cardTitle="All Opportunities"
      cardDescription={
        opportunities ? `${opportunities.total} total opportunities` : "Loading opportunities..."
      }
    >
      <CreateOpportunityDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={handleCreated}
        ownerUsername={ownerUsername}
      />
    </ListPageLayout>
  );
}

