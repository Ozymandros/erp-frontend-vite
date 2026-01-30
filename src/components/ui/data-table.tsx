import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

export interface Column<T> {
  readonly header: string | React.ReactNode;
  readonly accessor: keyof T | ((item: T) => React.ReactNode);
  readonly sortable?: boolean;
  readonly sortField?: string;
  readonly className?: string;
}

interface DataTableProps<T> {
  readonly columns: readonly Column<T>[];
  readonly data: readonly T[];
  readonly onSort?: (field: string) => void;
  readonly isLoading?: boolean;
  readonly emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  data,
  onSort,
  isLoading,
  emptyMessage = "No data found.",
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => {
              const columnKey = typeof column.header === "string" 
                ? column.header 
                : (column.sortField || index.toString());
              
              return (
                <TableHead key={columnKey} className={column.className}>
                  {column.sortable && onSort ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSort(column.sortField || (column.accessor as string))}
                      className="-ml-2 h-8 px-2"
                    >
                      {column.header}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, rowIndex) => (
            <TableRow key={(item as { id?: string; code?: string }).id || (item as { id?: string; code?: string }).code || rowIndex}>
              {columns.map((column, colIndex) => {
                const columnKey = typeof column.header === "string" 
                  ? column.header 
                  : (column.sortField || colIndex.toString());
                
                return (
                  <TableCell key={columnKey} className={column.className}>
                    {typeof column.accessor === "function"
                      ? column.accessor(item)
                      : (item[column.accessor] as React.ReactNode)}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
