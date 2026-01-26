"use client";

import React, { useState } from "react";
import { productsService } from "@/api/services/products.service";
import type { ProductDto } from "@/types/api.types";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { CreateProductDialog } from "@/components/inventory/create-product-dialog";
import { EditProductDialog } from "@/components/inventory/edit-product-dialog";
import { DeleteProductDialog } from "@/components/inventory/delete-product-dialog";
import { handleApiError, getErrorMessage } from "@/lib/error-handling";
import { useDataTable } from "@/hooks/use-data-table";
import { useListActions } from "@/hooks/use-list-actions";
import { ListPageLayout } from "@/components/layout/list-page-layout";
import { getProductColumns } from "./products.columns";
import { downloadBlob } from "@/lib/export.utils";

export function ProductsListPage() {
  const [showLowStock, setShowLowStock] = useState(false);

  const {
    data: products,
    isLoading,
    error,
    querySpec,
    handleSearch,
    handleSort,
    handlePageChange,
    setError,
    refresh,
  } = useDataTable<ProductDto>({
    fetcher: async (qs) => {
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
    },
    initialQuery: {
      searchFields: "sku,name",
    },
    resourceName: "products",
  });

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

  const handleExport = async (format: "xlsx" | "pdf") => {
    try {
      const blob =
        format === "xlsx"
          ? await productsService.exportToXlsx()
          : await productsService.exportToPdf();

      await downloadBlob(blob, `Products.${format}`);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(getErrorMessage(apiError, `Failed to export products to ${format}`));
    }
  };

  const columns = getProductColumns({
    onEdit: setEditingItem,
    onDelete: setDeletingItem,
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
      onExport={handleExport}
      onCreateOpen={() => setIsCreateOpen(true)}
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
