"use client";

import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { warehousesService } from "@/api/services/warehouses.service";
import type { WarehouseDto, PaginatedResponse, QuerySpec } from "@/types/api.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Pencil, Trash2, Eye, ArrowUpDown, FileDown } from "lucide-react";
import { CreateWarehouseDialog } from "@/components/inventory/create-warehouse-dialog";
import { EditWarehouseDialog } from "@/components/inventory/edit-warehouse-dialog";
import { DeleteWarehouseDialog } from "@/components/inventory/delete-warehouse-dialog";
import { handleApiError, isForbiddenError, getForbiddenMessage, getErrorMessage } from "@/lib/error-handling";

export function WarehousesListPage() {
  const [warehouses, setWarehouses] = useState<PaginatedResponse<WarehouseDto> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [querySpec, setQuerySpec] = useState<QuerySpec>({
    page: 1,
    pageSize: 10,
    searchTerm: "",
    searchFields: "name,location",
    sortBy: "createdAt",
    sortDesc: true,
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<WarehouseDto | null>(null);
  const [deletingWarehouse, setDeletingWarehouse] = useState<WarehouseDto | null>(null);

  const fetchWarehouses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await warehousesService.searchWarehouses(querySpec);
      setWarehouses(data);
    } catch (error: unknown) {
      const apiError = handleApiError(error);
      // Handle 403 Forbidden (permission denied) with user-friendly message
      if (isForbiddenError(apiError)) {
        setError(getForbiddenMessage("warehouses"));
      } else {
        setError(getErrorMessage(apiError, "Failed to fetch warehouses"));
      }
    } finally {
      setIsLoading(false);
    }
  }, [querySpec]);

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  const handleSearch = (value: string) => {
    setQuerySpec((prev) => ({ ...prev, searchTerm: value, page: 1 }));
  };

  const handleSort = (field: string) => {
    setQuerySpec((prev) => ({
      ...prev,
      sortBy: field,
      sortDesc: prev.sortBy === field ? !prev.sortDesc : false,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setQuerySpec((prev) => ({ ...prev, page: newPage }));
  };

  const handleWarehouseCreated = () => {
    setIsCreateDialogOpen(false);
    fetchWarehouses();
  };

  const handleWarehouseUpdated = () => {
    setEditingWarehouse(null);
    fetchWarehouses();
  };

  const handleWarehouseDeleted = () => {
    setDeletingWarehouse(null);
    fetchWarehouses();
  };

  const handleExport = async (format: "xlsx" | "pdf") => {
    try {
      const blob =
        format === "xlsx"
          ? await warehousesService.exportToXlsx()
          : await warehousesService.exportToPdf();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Warehouses.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      const apiError = handleApiError(error);
      setError(getErrorMessage(apiError, `Failed to export warehouses to ${format}`));
    }
  };

  const totalPages = warehouses
    ? Math.ceil(warehouses.total / (querySpec.pageSize ?? 20))
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Warehouses</h1>
          <p className="text-muted-foreground mt-1">
            Manage warehouse locations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport("xlsx")}>
            <FileDown className="mr-2 h-4 w-4" />
            Export XLSX
          </Button>
          <Button variant="outline" onClick={() => handleExport("pdf")}>
            <FileDown className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Warehouse
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Warehouses</CardTitle>
          <CardDescription>
            {warehouses ? `${warehouses.total} total warehouses` : "Loading..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or location..."
                className="pl-10"
                value={querySpec.searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-center text-red-500 py-8">
              <p>{error}</p>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading warehouses...</p>
            </div>
          )}

          {!isLoading && warehouses && warehouses.items.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No warehouses found</p>
            </div>
          )}

          {!isLoading && warehouses && warehouses.items.length > 0 && (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <button
                          className="flex items-center hover:text-foreground"
                          onClick={() => handleSort("name")}
                        >
                          Name
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </button>
                      </TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {warehouses.items.map((warehouse) => (
                      <TableRow key={warehouse.id}>
                        <TableCell className="font-medium">
                          {warehouse.name}
                        </TableCell>
                        <TableCell>
                          {warehouse.location || (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/inventory/warehouses/${warehouse.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingWarehouse(warehouse)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeletingWarehouse(warehouse)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {querySpec.page} of {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange((querySpec.page ?? 1) - 1)}
                      disabled={!warehouses.hasPreviousPage}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange((querySpec.page ?? 1) + 1)}
                      disabled={!warehouses.hasNextPage}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <CreateWarehouseDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleWarehouseCreated}
      />

      <EditWarehouseDialog
        warehouse={editingWarehouse}
        open={!!editingWarehouse}
        onOpenChange={(open) => !open && setEditingWarehouse(null)}
        onSuccess={handleWarehouseUpdated}
      />

      <DeleteWarehouseDialog
        warehouse={deletingWarehouse}
        open={!!deletingWarehouse}
        onOpenChange={(open) => !open && setDeletingWarehouse(null)}
        onSuccess={handleWarehouseDeleted}
      />
    </div>
  );
}
