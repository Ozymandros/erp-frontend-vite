"use client";

import React, { useState, useEffect } from "react";
import { warehouseStocksService } from "@/api/services/warehouse-stocks.service";
import { productsService } from "@/api/services/products.service";
import { warehousesService } from "@/api/services/warehouses.service";
import type {
  WarehouseStockDto,
  ProductDto,
  WarehouseDto,
} from "@/types/api.types";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { handleApiError, getErrorMessage } from "@/lib/error-handling";
import { useDataTable } from "@/hooks/use-data-table";
import { ListPageLayout } from "@/components/layout/list-page-layout";
import { getWarehouseStockColumns } from "./warehouse-stocks.columns";
import { downloadBlob } from "@/lib/export.utils";

export function WarehouseStocksListPage() {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseDto[]>([]);
  const [filterType, setFilterType] = useState<"all" | "product" | "warehouse" | "low">("low");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("");

  const {
    data: stocks,
    isLoading,
    error,
    querySpec,
    handleSearch,
    handleSort,
    handlePageChange,
    setError,
    refresh,
  } = useDataTable<WarehouseStockDto>({
    fetcher: async () => {
      let data: WarehouseStockDto[] = [];
      if (filterType === "low") {
        data = await warehouseStocksService.getLowStocks();
      } else if (filterType === "product" && selectedProductId) {
        data = await warehouseStocksService.getStocksByProduct(selectedProductId);
      } else if (filterType === "warehouse" && selectedWarehouseId) {
        data = await warehouseStocksService.getStocksByWarehouse(selectedWarehouseId);
      } else {
        data = await warehouseStocksService.getLowStocks();
        if (filterType === "all") setFilterType("low");
      }
      return {
        items: data,
        page: 1,
        pageSize: data.length,
        total: data.length,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };
    },
    resourceName: "warehouse stocks",
  });

  const fetchProducts = async () => {
    try {
      const data = await productsService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products", error);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const data = await warehousesService.getWarehouses();
      setWarehouses(data);
    } catch (error) {
      console.error("Failed to fetch warehouses", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchWarehouses();
  }, []);

  useEffect(() => {
    refresh();
  }, [filterType, selectedProductId, selectedWarehouseId, refresh]);

  const getProductName = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    return product?.name || productId;
  };

  const getWarehouseName = (warehouseId: string) => {
    const warehouse = warehouses.find((w) => w.id === warehouseId);
    return warehouse?.name || warehouseId;
  };

  const handleExport = async (format: "xlsx" | "pdf") => {
    try {
      const blob =
        format === "xlsx"
          ? await warehouseStocksService.exportToXlsx()
          : await warehouseStocksService.exportToPdf();

      await downloadBlob(blob, `WarehouseStocks.${format}`);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(getErrorMessage(apiError, `Failed to export stocks to ${format}`));
    }
  };

  const columns = getWarehouseStockColumns({ getProductName, getWarehouseName });

  return (
    <ListPageLayout
      title="Warehouse Stocks"
      description="View inventory stock levels across warehouses"
      resourceName="Stock"
      data={stocks}
      isLoading={isLoading}
      error={error}
      querySpec={querySpec}
      onSearch={handleSearch}
      onSort={handleSort}
      onPageChange={handlePageChange}
      onExport={handleExport}
      onCreateOpen={() => {}} // Disabled as there's no manual record creation
      columns={columns}
      cardTitle="Stock Levels"
      cardDescription={
        filterType === "low"
          ? "Products with low stock levels"
          : filterType === "product"
          ? `Stock for ${getProductName(selectedProductId)}`
          : filterType === "warehouse"
          ? `Stock in ${getWarehouseName(selectedWarehouseId)}`
          : "All warehouse stocks"
      }
      extraHeaderActions={
        <div className="flex flex-wrap gap-4">
          <Button
            variant={filterType === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setFilterType("all");
              setSelectedProductId("");
              setSelectedWarehouseId("");
            }}
          >
            All Stocks
          </Button>
          <Button
            variant={filterType === "low" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setFilterType("low");
              setSelectedProductId("");
              setSelectedWarehouseId("");
            }}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Low Stock
          </Button>
          <div className="flex gap-2">
            <select
              className="rounded-md border border-input bg-background px-3 py-1 text-sm"
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                if (e.target.value) {
                  setFilterType("product");
                  setSelectedWarehouseId("");
                }
              }}
            >
              <option value="">Filter by Product...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <select
              className="rounded-md border border-input bg-background px-3 py-1 text-sm"
              value={selectedWarehouseId}
              onChange={(e) => {
                setSelectedWarehouseId(e.target.value);
                if (e.target.value) {
                  setFilterType("warehouse");
                  setSelectedProductId("");
                }
              }}
            >
              <option value="">Filter by Warehouse...</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
        </div>
      }
    />
  );
}
