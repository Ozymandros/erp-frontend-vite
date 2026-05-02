"use client";

import { useMemo } from "react";
import type { AccountDto, QuerySpec } from "@/types/api.types";
import { crmAccountsService } from "@/api/services/crm-accounts.service";
import { useDataTable } from "@/hooks/use-data-table";
import { ListPageLayout } from "@/components/layout/list-page-layout";
import { getAccountColumns } from "./accounts.columns";

export function AccountsListPage() {
  const fetcher = (qs: QuerySpec) => crmAccountsService.searchAccounts(qs);

  const {
    data: accounts,
    isLoading,
    error: dataError,
    querySpec,
    handleSearch,
    handleSort,
    handlePageChange,
  } = useDataTable<AccountDto>({
    fetcher,
    initialQuery: {
      searchFields: "name,customerId,ownerUsername",
    },
    resourceName: "accounts",
  });

  const columns = useMemo(() => getAccountColumns(), []);

  return (
    <ListPageLayout
      title="CRM Accounts"
      description="Manage CRM accounts"
      resourceName="Account"
      data={accounts}
      isLoading={isLoading}
      error={dataError}
      querySpec={querySpec}
      onSearch={handleSearch}
      onSort={handleSort}
      onPageChange={handlePageChange}
      columns={columns}
      searchPlaceholder="Search by name, customer ID, or owner..."
      cardTitle="All Accounts"
      cardDescription={
        accounts ? `${accounts.total} total accounts` : "Loading accounts..."
      }
    />
  );
}

