"use client";

import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { inventoryTransactionsService } from "@/api/services/inventory-transactions.service";
import { productsService } from "@/api/services/products.service";
import { warehousesService } from "@/api/services/warehouses.service";
import type {
  InventoryTransactionDto,
  PaginatedResponse,
  QuerySpec,
  TransactionType,
} from "@/types/api.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Search, ArrowUpDown, Package, Warehouse, Eye } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import {
  handleApiError,
  isForbiddenError,
  getForbiddenMessage,
  getErrorMessage,
} from "@/lib/error-handling";

import { TransactionType as TransactionTypeEnum } from "@/types/api.types";

const TRANSACTION_TYPES: { value: TransactionType; label: string }[] = [
  { value: TransactionTypeEnum.Purchase, label: "Purchase" },
  { value: TransactionTypeEnum.Sale, label: "Sale" },
  { value: TransactionTypeEnum.Adjustment, label: "Adjustment" },
  { value: TransactionTypeEnum.Transfer, label: "Transfer" },
  { value: TransactionTypeEnum.Return, label: "Return" },
  { value: TransactionTypeEnum.Damage, label: "Damage" },
  { value: TransactionTypeEnum.Loss, label: "Loss" },
];

export function InventoryTransactionsListPage() {
  const [transactions, setTransactions] =
    useState<PaginatedResponse<InventoryTransactionDto> | null>(null);
  const [products, setProducts] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [warehouses, setWarehouses] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [querySpec, setQuerySpec] = useState<QuerySpec>({
    page: 1,
    pageSize: 20,
    searchTerm: "",
    searchFields: "transactionType",
    sortBy: "transactionDate",
    sortDesc: true,
  });
  const [filterProduct, setFilterProduct] = useState<string>("");
  const [filterWarehouse, setFilterWarehouse] = useState<string>("");
  const [filterType, setFilterType] = useState<TransactionType | "">("");

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

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let data: PaginatedResponse<InventoryTransactionDto>;

      if (filterProduct) {
        const txns =
          await inventoryTransactionsService.getTransactionsByProduct(
            filterProduct
          );
        data = {
          items: txns,
          page: 1,
          pageSize: txns.length,
          total: txns.length,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        };
      } else if (filterWarehouse) {
        const txns =
          await inventoryTransactionsService.getTransactionsByWarehouse(
            filterWarehouse
          );
        data = {
          items: txns,
          page: 1,
          pageSize: txns.length,
          total: txns.length,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        };
      } else if (filterType) {
        const txns = await inventoryTransactionsService.getTransactionsByType(
          filterType as TransactionType
        );
        data = {
          items: txns,
          page: 1,
          pageSize: txns.length,
          total: txns.length,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        };
      } else {
        data = await inventoryTransactionsService.searchTransactions(querySpec);
      }

      setTransactions(data);
    } catch (error: unknown) {
      const apiError = handleApiError(error);
      // Handle 403 Forbidden (permission denied) with user-friendly message
      if (isForbiddenError(apiError)) {
        setError(getForbiddenMessage("inventory transactions"));
      } else {
        setError(
          getErrorMessage(apiError, "Failed to fetch inventory transactions")
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [querySpec, filterProduct, filterWarehouse, filterType]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    fetchProducts();
    fetchWarehouses();
  }, []);

  const handleSearch = (value: string) => {
    setQuerySpec(prev => ({ ...prev, searchTerm: value, page: 1 }));
  };

  const handleSort = (field: string) => {
    setQuerySpec(prev => ({
      ...prev,
      sortBy: field,
      sortDesc: prev.sortBy === field ? !prev.sortDesc : false,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setQuerySpec(prev => ({ ...prev, page: newPage }));
  };

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product?.name || productId;
  };

  const getWarehouseName = (warehouseId: string) => {
    const warehouse = warehouses.find(w => w.id === warehouseId);
    return warehouse?.name || warehouseId;
  };

  const getTypeBadgeVariant = (type: TransactionType) => {
    switch (type) {
      case "Purchase":
      case "Return":
        return "default";
      case "Sale":
      case "Damage":
      case "Loss":
        return "destructive";
      case "Adjustment":
        return "secondary";
      case "Transfer":
        return "outline";
      default:
        return "secondary";
    }
  };

  const totalPages = transactions
    ? Math.ceil(transactions.total / (querySpec.pageSize ?? 20))
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Inventory Transactions
        </h1>
        <p className="text-muted-foreground mt-1">
          View all inventory movement transactions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction Log</CardTitle>
          <CardDescription>
            {transactions
              ? `${transactions.total} total transactions`
              : "Loading..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  className="pl-10"
                  value={querySpec.searchTerm}
                  onChange={e => handleSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex flex-col gap-1">
                  Filter by Product
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={filterProduct}
                    onChange={e => {
                      setFilterProduct(e.target.value);
                      setFilterWarehouse("");
                      setFilterType("");
                    }}
                  >
                    <option value="">All Products</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name}
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
                    value={filterWarehouse}
                    onChange={e => {
                      setFilterWarehouse(e.target.value);
                      setFilterProduct("");
                      setFilterType("");
                    }}
                  >
                    <option value="">All Warehouses</option>
                    {warehouses.map(warehouse => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex flex-col gap-1">
                  Filter by Type
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={filterType}
                    onChange={e => {
                      setFilterType(e.target.value as TransactionType | "");
                      setFilterProduct("");
                      setFilterWarehouse("");
                    }}
                  >
                    <option value="">All Types</option>
                    {TRANSACTION_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          </div>

          {error && (
            <div className="text-center text-red-500 py-8">
              <p>{error}</p>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading transactions...</p>
            </div>
          )}

          {!isLoading && transactions && transactions.items.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No transactions found</p>
            </div>
          )}

          {!isLoading && transactions && transactions.items.length > 0 && (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>
                        <button
                          className="flex items-center hover:text-foreground"
                          onClick={() => handleSort("transactionType")}
                        >
                          Type
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </button>
                      </TableHead>
                      <TableHead>
                        <Package className="h-4 w-4 inline mr-2" />
                        Product
                      </TableHead>
                      <TableHead>
                        <Warehouse className="h-4 w-4 inline mr-2" />
                        Warehouse
                      </TableHead>
                      <TableHead>
                        <button
                          className="flex items-center hover:text-foreground"
                          onClick={() => handleSort("quantity")}
                        >
                          Quantity
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </button>
                      </TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.items.map(transaction => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {formatDateTime(transaction.transactionDate)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getTypeBadgeVariant(
                              transaction.transactionType
                            )}
                          >
                            {TRANSACTION_TYPES.find(
                              t => t.value === transaction.transactionType
                            )?.label || transaction.transactionType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getProductName(transaction.productId)}
                        </TableCell>
                        <TableCell>
                          {getWarehouseName(transaction.warehouseId)}
                        </TableCell>
                        <TableCell
                          className={
                            transaction.quantity > 0
                              ? "text-green-600 font-semibold"
                              : transaction.quantity < 0
                              ? "text-red-600 font-semibold"
                              : ""
                          }
                        >
                          {transaction.quantity > 0 ? "+" : ""}
                          {transaction.quantity}
                        </TableCell>
                        <TableCell>
                          <Link
                            to={`/inventory/transactions/${transaction.id}`}
                          >
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
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
                      onClick={() =>
                        handlePageChange((querySpec.page ?? 1) - 1)
                      }
                      disabled={!transactions.hasPreviousPage}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handlePageChange((querySpec.page ?? 1) + 1)
                      }
                      disabled={!transactions.hasNextPage}
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
    </div>
  );
}
