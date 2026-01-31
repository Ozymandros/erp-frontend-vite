"use client";

import { useState } from "react";
import { productsService } from "@/api/services/products.service";
import type { ProductDto, QuerySpec } from "@/types/api.types";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { CreateProductDialog } from "@/components/inventory/create-product-dialog";
import { EditProductDialog } from "@/components/inventory/edit-product-dialog";
import { DeleteProductDialog } from "@/components/inventory/delete-product-dialog";
import { useDataTable } from "@/hooks/use-data-table";
import { useListActions } from "@/hooks/use-list-actions";
import { useModulePermissions } from "@/hooks/use-permissions";
import { useExport } from "@/hooks/use-export";
import { ListPageLayout } from "@/components/layout/list-page-layout";
import { getProductColumns } from "./products.columns";

export function ProductsListPage() {
  const [showLowStock, setShowLowStock] = useState(false);
  
  const fetcher = async (qs: QuerySpec) => {
    if (showLowStock) {
      const items = await productsService.getLowStockProducts();
      return {
        items,
        page: 1,
        pageSize: items.length,
        total: items.length,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };
    }
    return productsService.searchProducts(qs);
  }

  const {
    data: products,
    isLoading,
    error: dataError,
    querySpec,
    handleSearch,
    handleSort,
    handlePageChange,
    refresh,
  } = useDataTable<ProductDto>({
    fetcher,
    initialQuery: {
      searchFields: "sku,name",
    },
    resourceName: "products",
  });

  // Permissions
  const { canCreate, canUpdate, canDelete, canExport } = useModulePermissions("products");

  // Actions
  const {
    isCreateOpen,
    setIsCreateOpen,
    editingItem,
    setEditingItem,
    deletingItem,
    setDeletingItem,
    handleCreated,
    handleUpdated,
    handleDeleted,
  } = useListActions<ProductDto>({ refresh });

  // Export
  const { handleExport, exportError } = useExport({
    resourceName: "Products",
    onExport: (format) =>
      format === "xlsx"
        ? productsService.exportToXlsx()
        : productsService.exportToPdf(),
  });

  const error = dataError || exportError;

  const columns = getProductColumns({
    onEdit: setEditingItem,
    onDelete: setDeletingItem,
    canEdit: canUpdate,
    canDelete: canDelete,
  });

  return (
    <ListPageLayout
      title="Products"
      description="Manage your inventory products"
      resourceName="Product"
      data={products}
      isLoading={isLoading}
      error={error}
      querySpec={querySpec}
      onSearch={handleSearch}
      onSort={handleSort}
      onPageChange={handlePageChange}
      onExport={canExport ? handleExport : undefined}
      onCreateOpen={canCreate ? () => setIsCreateOpen(true) : undefined}
      columns={columns}
      searchPlaceholder="Search by SKU or name..."
      cardTitle="All Products"
      cardDescription={products ? `${products.total} total products` : "Loading..."}
      extraHeaderActions={
        <Button
          variant={showLowStock ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setShowLowStock(!showLowStock);
            handlePageChange(1);
          }}
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          {showLowStock ? "Show All" : "Low Stock"}
        </Button>
      }
    >
      <CreateProductDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={handleCreated}
      />

      {editingItem && (
        <EditProductDialog
          product={editingItem}
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
          onSuccess={handleUpdated}
        />
      )}

      {deletingItem && (
        <DeleteProductDialog
          product={deletingItem}
          open={!!deletingItem}
          onOpenChange={(open) => !open && setDeletingItem(null)}
          onSuccess={handleDeleted}
        />
      )}
    </ListPageLayout>
  );
}
