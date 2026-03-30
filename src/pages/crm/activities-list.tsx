"use client";

import { useMemo } from "react";
import type { ActivityDto, QuerySpec } from "@/types/api.types";
import { crmActivitiesService } from "@/api/services/crm-activities.service";
import { useDataTable } from "@/hooks/use-data-table";
import { useListActions } from "@/hooks/use-list-actions";
import { useModulePermissions } from "@/hooks/use-permissions";
import { ListPageLayout } from "@/components/layout/list-page-layout";
import { getActivityColumns } from "./activities.columns";
import { CreateActivityDialog } from "@/components/crm/create-activity-dialog";

export function ActivitiesListPage() {
  const fetcher = (qs: QuerySpec) => crmActivitiesService.searchActivities(qs);

  const {
    data: activities,
    isLoading,
    error: dataError,
    querySpec,
    handleSearch,
    handleSort,
    handlePageChange,
    refresh,
  } = useDataTable<ActivityDto>({
    fetcher,
    initialQuery: {
      searchFields: "subject,type,status",
    },
    resourceName: "activities",
  });

  const { canCreate } = useModulePermissions("activities");

  const {
    isCreateOpen,
    setIsCreateOpen,
    handleCreated,
  } = useListActions<ActivityDto>({ refresh });

  const columns = useMemo(() => getActivityColumns(), []);

  return (
    <ListPageLayout
      title="CRM Activities"
      description="Manage CRM activities"
      resourceName="Activity"
      data={activities}
      isLoading={isLoading}
      error={dataError}
      querySpec={querySpec}
      onSearch={handleSearch}
      onSort={handleSort}
      onPageChange={handlePageChange}
      onCreateOpen={canCreate ? () => setIsCreateOpen(true) : undefined}
      columns={columns}
      searchPlaceholder="Search by subject, type, or status..."
      cardTitle="All Activities"
      cardDescription={
        activities ? `${activities.total} total activities` : "Loading activities..."
      }
    >
      <CreateActivityDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={handleCreated}
      />
    </ListPageLayout>
  );
}

