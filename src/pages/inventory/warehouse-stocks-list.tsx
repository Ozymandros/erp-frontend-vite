"use client";

import { useState, useEffect } from "react";
import { warehouseStocksService } from "@/api/services/warehouse-stocks.service";
import { productsService } from "@/api/services/products.service";
import { warehousesService } from "@/api/services/warehouses.service";
import type {
  WarehouseStockDto,
  ProductDto,
  WarehouseDto,
  QuerySpec,
} from "@/types/api.types";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useDataTable } from "@/hooks/use-data-table";
import { useModulePermissions } from "@/hooks/use-permissions";
import { useExport } from "@/hooks/use-export";
import { ListPageLayout } from "@/components/layout/list-page-layout";
import { getWarehouseStockColumns } from "./warehouse-stocks.columns";

export function WarehouseStocksListPage() {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseDto[]>([]);
  const [filterType, setFilterType] = useState<"all" | "product" | "warehouse" | "low">("low");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("");

  const fetcher = async (_qs: QuerySpec) => {
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
  };

  const {
    data: stocks,
    isLoading,
    error: dataError,
    querySpec,
    handleSearch,
    handleSort,
    handlePageChange,
    refresh,
  } = useDataTable<WarehouseStockDto>({
    fetcher,
    resourceName: "warehouse stocks",
  });

  // Permissions
  const { canExport } = useModulePermissions("inventory");

  // Export
  const { handleExport, exportError } = useExport({
    resourceName: "WarehouseStocks",
    onExport: (format) =>
      format === "xlsx"
        ? warehouseStocksService.exportToXlsx()
        : warehouseStocksService.exportToPdf(),
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

  const error = dataError || exportError;
  const columns = getWarehouseStockColumns({ getProductName, getWarehouseName });

  let cardDescription = "All warehouse stocks";
  if (filterType === "low") {
    cardDescription = "Products with low stock levels";
  } else if (filterType === "product") {
    cardDescription = `Stock for ${getProductName(selectedProductId)}`;
  } else if (filterType === "warehouse") {
    cardDescription = `Stock in ${getWarehouseName(selectedWarehouseId)}`;
  }

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
      onExport={canExport ? handleExport : undefined}
      columns={columns}
      cardTitle="Stock Levels"
      cardDescription={cardDescription}
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
