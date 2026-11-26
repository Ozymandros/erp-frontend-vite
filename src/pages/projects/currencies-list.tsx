import { useCallback } from "react";
import { projectCurrenciesService } from "@/api/services/project-currencies.service";
import type { ProjectCurrencyDto, QuerySpec } from "@/types/api.types";
import { paginateArray } from "@/lib/projects/array-pagination";
import { CreateCurrencyDialog } from "@/components/projects/create-currency-dialog";
import { useDataTable } from "@/hooks/use-data-table";
import { useListActions } from "@/hooks/use-list-actions";
import { useModulePermissions } from "@/hooks/use-permissions";
import { ListPageLayout } from "@/components/layout/list-page-layout";
import { Link } from "react-router-dom";
import { Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";

export function CurrenciesListPage() {
  const fetcher = useCallback(async (qs: QuerySpec) => {
    const all = await projectCurrenciesService.getCurrencies();
    return paginateArray(all, qs, (item, term) =>
      `${item.code} ${item.description}`.toLowerCase().includes(term)
    );
  }, []);

  const table = useDataTable<ProjectCurrencyDto>({
    fetcher,
    resourceName: "currencies",
  });

  const { canCreate } = useModulePermissions("projects");
  const actions = useListActions<ProjectCurrencyDto>({ refresh: table.refresh });

  const columns: Column<ProjectCurrencyDto>[] = [
    {
      header: "Code",
      accessor: (c) => (
        <Link
          to={`/projects/currencies/${c.code}`}
          className="font-medium text-primary hover:underline"
        >
          {c.code}
        </Link>
      ),
    },
    { header: "Description", accessor: (c) => c.description },
    {
      header: "Local",
      accessor: (c) =>
        c.isLocalCurrency ? <Badge>Local</Badge> : <span className="text-muted-foreground">—</span>,
    },
  ];

  return (
    <ListPageLayout
      title="Currencies"
      description="Project currencies and exchange rates"
      resourceName="Currency"
      data={table.data}
      isLoading={table.isLoading}
      error={table.error}
      querySpec={table.querySpec}
      onSearch={table.handleSearch}
      onSort={table.handleSort}
      onPageChange={table.handlePageChange}
      onCreateOpen={canCreate ? () => actions.setIsCreateOpen(true) : undefined}
      columns={columns}
      searchPlaceholder="Search currencies…"
      cardTitle="Currencies"
      cardDescription={
        table.data ? `${table.data.total} currencies` : "Loading..."
      }
    >
      <CreateCurrencyDialog
        open={actions.isCreateOpen}
        onOpenChange={actions.setIsCreateOpen}
        onSuccess={actions.handleCreated}
      />
    </ListPageLayout>
  );
}
