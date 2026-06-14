import { useCallback } from "react";
import { auditEntityChangesService } from "@/api/services/audit-entity-changes.service";
import type { EntityChangeDto, QuerySpec } from "@/types/api.types";
import { useDataTable } from "@/hooks/use-data-table";
import { ListPageLayout } from "@/components/layout/list-page-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getEntityChangeColumns } from "./entity-changes.columns";

const CHANGE_TYPE_OPTIONS = [
  { label: "All types", value: "" },
  { label: "Created", value: "Created" },
  { label: "Updated", value: "Updated" },
  { label: "Deleted", value: "Deleted" },
] as const;

const MIN_SEARCH_LENGTH = 3;

export function EntityChangesListPage() {
  const fetcher = useCallback(
    (querySpec: QuerySpec) =>
      auditEntityChangesService.searchEntityChanges(querySpec),
    [],
  );

  const {
    data: entityChanges,
    isLoading,
    error: dataError,
    querySpec,
    setQuerySpec,
    handleSearch,
    handleSort,
    handlePageChange,
  } = useDataTable<EntityChangeDto>({
    fetcher,
    initialQuery: {
      pageSize: 20,
      searchFields: "entityName,createdBy",
      sortBy: "createdAt",
      sortDesc: true,
      filters: {},
    },
    resourceName: "audit entries",
  });

  const handleAuditSearch = (value: string) => {
    const trimmed = value.trim();
    if (trimmed.length >= MIN_SEARCH_LENGTH || trimmed.length === 0) {
      handleSearch(trimmed);
    }
  };

  const handleEntityNameFilter = (entityName: string) => {
    setQuerySpec((prev) => ({
      ...prev,
      page: 1,
      filters: {
        ...prev.filters,
        entityName: entityName.trim(),
      },
    }));
  };

  const handleChangeTypeFilter = (changeType: string) => {
    setQuerySpec((prev) => ({
      ...prev,
      page: 1,
      filters: {
        ...prev.filters,
        changeType,
      },
    }));
  };

  const clearFilters = () => {
    setQuerySpec((prev) => ({
      ...prev,
      page: 1,
      searchTerm: "",
      filters: {},
    }));
  };

  const columns = getEntityChangeColumns();

  return (
    <ListPageLayout<EntityChangeDto>
      title="Entity Change Audit Log"
      description="Read-only history of entity modifications across the system."
      resourceName="entry"
      data={entityChanges}
      isLoading={isLoading}
      error={dataError}
      querySpec={querySpec}
      onSearch={handleAuditSearch}
      onSort={handleSort}
      onPageChange={handlePageChange}
      columns={columns}
      cardTitle="Audit entries"
      cardDescription="All recorded entity changes"
      searchPlaceholder="Entity name or changed by (min. 3 characters)…"
      extraHeaderActions={
        <div
          className="flex flex-wrap items-end gap-4 w-full md:w-auto"
          role="search"
          aria-label="Filter audit entries"
        >
          <div className="space-y-1.5">
            <Label htmlFor="audit-filter-entity-name">Entity name</Label>
            <Input
              id="audit-filter-entity-name"
              name="audit-filter-entity-name"
              placeholder="e.g. User, Product…"
              value={querySpec.filters?.entityName ?? ""}
              onChange={(e) => handleEntityNameFilter(e.target.value)}
              className="w-48"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="audit-filter-change-type">Change type</Label>
            <select
              id="audit-filter-change-type"
              aria-label="Filter by change type"
              className="flex h-9 w-40 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm"
              value={querySpec.filters?.changeType ?? ""}
              onChange={(e) => handleChangeTypeFilter(e.target.value)}
            >
              {CHANGE_TYPE_OPTIONS.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={clearFilters}
            aria-label="Clear all filters"
          >
            Clear filters
          </Button>
        </div>
      }
    />
  );
}
