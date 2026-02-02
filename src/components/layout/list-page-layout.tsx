import React from "react";
import { Plus, Search, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable, Column } from "@/components/ui/data-table";
import { PaginatedResponse, QuerySpec } from "@/types/api.types";

interface ListPageLayoutProps<T> {
  readonly title: string;
  readonly description: string;
  readonly resourceName: string;
  
  // Data State
  readonly data: PaginatedResponse<T> | null;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly querySpec: QuerySpec;
  
  // Handlers
  readonly onSearch: (value: string) => void;
  readonly onSort: (field: string) => void;
  readonly onPageChange: (page: number) => void;
  /** If provided, export buttons will be shown */
  readonly onExport?: (format: "xlsx" | "pdf") => void;
  /** If provided, the "Add" button will be shown */
  readonly onCreateOpen?: () => void;
  
  // Customization
  readonly columns: Column<T>[];
  readonly searchPlaceholder?: string;
  readonly cardTitle: string;
  readonly cardDescription: string;
  readonly extraHeaderActions?: React.ReactNode;
  readonly children?: React.ReactNode; // For dialogs or extra components
}

/**
 * A standardized layout for list pages.
 * Handles search, sorting, pagination, and provides slots for actions.
 */
export function ListPageLayout<T>({
  title,
  description,
  resourceName,
  data,
  isLoading,
  error,
  querySpec,
  onSearch,
  onSort,
  onPageChange,
  onExport,
  onCreateOpen,
  columns,
  searchPlaceholder,
  cardTitle,
  cardDescription,
  extraHeaderActions,
  children,
}: ListPageLayoutProps<T>) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          <p className="text-muted-foreground mt-1">{description}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {onExport && (
            <>
              <Button variant="outline" onClick={() => onExport("xlsx")}>
                <FileDown className="mr-2 h-4 w-4" />
                Export XLSX
              </Button>
              <Button variant="outline" onClick={() => onExport("pdf")}>
                <FileDown className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            </>
          )}
          
          {extraHeaderActions && (
            <div className="flex items-center gap-2">
              {extraHeaderActions}
            </div>
          )}
          
          {onCreateOpen && (
            <Button onClick={onCreateOpen}>
              <Plus className="mr-2 h-4 w-4" />
              Add {resourceName}
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{cardTitle}</CardTitle>
          <CardDescription>{cardDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder || `Search ${resourceName.toLowerCase()}...`}
                value={querySpec.searchTerm || ""}
                onChange={(e) => onSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <DataTable
            columns={columns}
            data={data?.items || []}
            onSort={onSort}
            isLoading={isLoading}
            emptyMessage={`No ${resourceName.toLowerCase()} found.`}
          />

          {error && <div className="text-center py-4 text-destructive">{error}</div>}

          {data && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {((querySpec.page || 1) - 1) * (querySpec.pageSize || 10) + 1} to{" "}
                {Math.min((querySpec.page || 1) * (querySpec.pageSize || 10), data.total)} of{" "}
                {data.total} {resourceName.toLowerCase()}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange((querySpec.page || 1) - 1)}
                  disabled={(querySpec.page || 1) === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-3 text-sm">
                  Page {querySpec.page || 1} of {data.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange((querySpec.page || 1) + 1)}
                  disabled={(querySpec.page || 1) >= data.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {children}
    </div>
  );
}
