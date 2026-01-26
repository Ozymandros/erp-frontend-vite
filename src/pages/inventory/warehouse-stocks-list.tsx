"use client";

import { useState, useEffect, useCallback } from "react";
import { warehouseStocksService } from "@/api/services/warehouse-stocks.service";
import { productsService } from "@/api/services/products.service";
import { warehousesService } from "@/api/services/warehouses.service";
import type {
  WarehouseStockDto,
  ProductDto,
  WarehouseDto,
} from "@/types/api.types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle, Package, Warehouse, FileDown } from "lucide-react";
import {
  handleApiError,
  isForbiddenError,
  getForbiddenMessage,
  getErrorMessage,
} from "@/lib/error-handling";

export function WarehouseStocksListPage() {
  const [stocks, setStocks] = useState<WarehouseStockDto[]>([]);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<
    "all" | "product" | "warehouse" | "low"
  >("all");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("");

  const fetchProducts = async () => {
    try {
      const data = await productsService.getProducts();
      setProducts(data);
    } catch (error: unknown) {
      // Handle 403 Forbidden (permission denied) gracefully - don't show error for dropdowns
      const apiError = handleApiError(error);
      if (!isForbiddenError(apiError)) {
        console.error("Failed to fetch products", apiError);
      }
      // If 403, just leave products list empty - the user doesn't have permission to view it
    }
  };

  const fetchWarehouses = async () => {
    try {
      const data = await warehousesService.getWarehouses();
      setWarehouses(data);
    } catch (error: unknown) {
      // Handle 403 Forbidden (permission denied) gracefully - don't show error for dropdowns
      const apiError = handleApiError(error);
      if (!isForbiddenError(apiError)) {
        console.error("Failed to fetch warehouses", apiError);
      }
      // If 403, just leave warehouses list empty - the user doesn't have permission to view it
    }
  };

  const fetchStocks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let data: WarehouseStockDto[] = [];

      if (filterType === "low") {
        data = await warehouseStocksService.getLowStocks();
      } else if (filterType === "product" && selectedProductId) {
        data = await warehouseStocksService.getStocksByProduct(
          selectedProductId
        );
      } else if (filterType === "warehouse" && selectedWarehouseId) {
        data = await warehouseStocksService.getStocksByWarehouse(
          selectedWarehouseId
        );
      } else {
        // For "all", we'd need to fetch from all products/warehouses
        // Since there's no "get all" endpoint, show low stock by default
        data = await warehouseStocksService.getLowStocks();
        setFilterType("low");
      }

      setStocks(data);
    } catch (error: unknown) {
      const apiError = handleApiError(error);
      // Handle 403 Forbidden (permission denied) with user-friendly message
      if (isForbiddenError(apiError)) {
        setError(getForbiddenMessage("warehouse stocks"));
      } else {
        setError(getErrorMessage(apiError, "Failed to fetch warehouse stocks"));
      }
    } finally {
      setIsLoading(false);
    }
  }, [filterType, selectedProductId, selectedWarehouseId]);

  useEffect(() => {
    fetchProducts();
    fetchWarehouses();
  }, []);

  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product?.name || productId;
  };

  const getWarehouseName = (warehouseId: string) => {
    const warehouse = warehouses.find(w => w.id === warehouseId);
    return warehouse?.name || warehouseId;
  };

  const availableQuantity = (stock: WarehouseStockDto) =>
    stock.quantity - stock.reservedQuantity;

  const isLowStock = (stock: WarehouseStockDto) =>
    availableQuantity(stock) <= stock.reorderLevel;

  const handleExport = async (format: "xlsx" | "pdf") => {
    try {
      const blob =
        format === "xlsx"
          ? await warehouseStocksService.exportToXlsx()
          : await warehouseStocksService.exportToPdf();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `WarehouseStocks.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      const apiError = handleApiError(error);
      setError(getErrorMessage(apiError, `Failed to export stocks to ${format}`));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Warehouse Stocks
          </h1>
          <p className="text-muted-foreground mt-1">
            View inventory stock levels across warehouses
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
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stock Levels</CardTitle>
          <CardDescription>
            {filterType === "low"
              ? "Products with low stock levels"
              : filterType === "product"
              ? `Stock for ${getProductName(selectedProductId)}`
              : filterType === "warehouse"
              ? `Stock in ${getWarehouseName(selectedWarehouseId)}`
              : "All warehouse stocks"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
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
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium flex flex-col gap-1">
                Filter by Product
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={selectedProductId}
                  onChange={e => {
                    setSelectedProductId(e.target.value);
                    if (e.target.value) {
                      setFilterType("product");
                      setSelectedWarehouseId("");
                    }
                  }}
                >
                  <option value="">Select a product...</option>
                  {products?.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex flex-col gap-1">
                Filter by Warehouse
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={selectedWarehouseId}
                  onChange={e => {
                    setSelectedWarehouseId(e.target.value);
                    if (e.target.value) {
                      setFilterType("warehouse");
                      setSelectedProductId("");
                    }
                  }}
                >
                  <option value="">Select a warehouse...</option>
                  {warehouses?.map(warehouse => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {error && (
            <div className="text-center text-red-500 py-8">
              <p>{error}</p>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading stocks...</p>
            </div>
          )}

          {!isLoading && stocks.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No stock records found</p>
            </div>
          )}

          {!isLoading && stocks.length > 0 && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Package className="h-4 w-4 inline mr-2" />
                      Product
                    </TableHead>
                    <TableHead>
                      <Warehouse className="h-4 w-4 inline mr-2" />
                      Warehouse
                    </TableHead>
                    <TableHead>Total Quantity</TableHead>
                    <TableHead>Reserved</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Reorder Level</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stocks?.map(stock => {
                    const available = availableQuantity(stock);
                    const low = isLowStock(stock);
                    return (
                      <TableRow key={`${stock.productId}-${stock.warehouseId}`}>
                        <TableCell className="font-medium">
                          {getProductName(stock.productId)}
                        </TableCell>
                        <TableCell>
                          {getWarehouseName(stock.warehouseId)}
                        </TableCell>
                        <TableCell>{stock.quantity}</TableCell>
                        <TableCell className="text-orange-600">
                          {stock.reservedQuantity}
                        </TableCell>
                        <TableCell
                          className={
                            low
                              ? "text-red-600 font-semibold"
                              : available > 0
                              ? "text-green-600"
                              : ""
                          }
                        >
                          {available}
                        </TableCell>
                        <TableCell>{stock.reorderLevel}</TableCell>
                        <TableCell>
                          {low ? (
                            <Badge variant="destructive">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Low Stock
                            </Badge>
                          ) : available > 0 ? (
                            <Badge variant="default">In Stock</Badge>
                          ) : (
                            <Badge variant="secondary">Out of Stock</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
