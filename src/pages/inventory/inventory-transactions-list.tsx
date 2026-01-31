"use client";

import { useState, useEffect } from "react";
import { inventoryTransactionsService } from "@/api/services/inventory-transactions.service";
import { productsService } from "@/api/services/products.service";
import { warehousesService } from "@/api/services/warehouses.service";
import type {
  InventoryTransactionDto,
  TransactionType,
  QuerySpec,
} from "@/types/api.types";
import { useDataTable } from "@/hooks/use-data-table";
import { useModulePermissions } from "@/hooks/use-permissions";
import { useExport } from "@/hooks/use-export";
import { ListPageLayout } from "@/components/layout/list-page-layout";
import { getInventoryTransactionColumns } from "./inventory-transactions.columns";
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
  const [products, setProducts] = useState<Array<{ id: string; name: string }>>([]);
  const [warehouses, setWarehouses] = useState<Array<{ id: string; name: string }>>([]);
  const [filterProduct, setFilterProduct] = useState<string>("");
  const [filterWarehouse, setFilterWarehouse] = useState<string>("");
  const [filterType, setFilterType] = useState<TransactionType | "">("");

  const wrapItems = (items: InventoryTransactionDto[]) => ({
    items,
    page: 1,
    pageSize: items.length,
    total: items.length,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const fetcher = async (qs: QuerySpec) => {
    if (filterProduct) {
      const txns = await inventoryTransactionsService.getTransactionsByProduct(filterProduct);
      return wrapItems(txns);
    } else if (filterWarehouse) {
      const txns = await inventoryTransactionsService.getTransactionsByWarehouse(filterWarehouse);
      return wrapItems(txns);
    } else if (filterType) {
      const txns = await inventoryTransactionsService.getTransactionsByType(filterType as TransactionType);
      return wrapItems(txns);
    }
    return inventoryTransactionsService.searchTransactions(qs);
  };

  const {
    data: transactions,
    isLoading,
    error: dataError,
    querySpec,
    handleSearch,
    handleSort,
    handlePageChange,
    refresh,
  } = useDataTable<InventoryTransactionDto>({
    fetcher,
    initialQuery: {
      pageSize: 20,
      searchFields: "transactionType",
      sortBy: "transactionDate",
      sortDesc: true,
    },
    resourceName: "inventory transactions",
  });

  // Permissions
  const { canExport } = useModulePermissions("inventory");

  // Export
  const { handleExport, exportError } = useExport({
    resourceName: "InventoryTransactions",
    onExport: (format) =>
      format === "xlsx"
        ? inventoryTransactionsService.exportToXlsx()
        : inventoryTransactionsService.exportToPdf(),
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
  }, [filterProduct, filterWarehouse, filterType, refresh]);

  const getProductName = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    return product?.name || productId;
  };

  const getWarehouseName = (warehouseId: string) => {
    const warehouse = warehouses.find((w) => w.id === warehouseId);
    return warehouse?.name || warehouseId;
  };

  const getTypeBadgeVariant = (type: TransactionType) => {
    switch (type) {
      case TransactionTypeEnum.Purchase:
      case TransactionTypeEnum.Return:
        return "default";
      case TransactionTypeEnum.Sale:
      case TransactionTypeEnum.Damage:
      case TransactionTypeEnum.Loss:
        return "destructive";
      case TransactionTypeEnum.Adjustment:
        return "secondary";
      case TransactionTypeEnum.Transfer:
        return "outline";
      default:
        return "secondary";
    }
  };

  const getTransactionTypeLabel = (type: TransactionType) => {
    return TRANSACTION_TYPES.find((t) => t.value === type)?.label || type;
  };

  const error = dataError || exportError;
  const columns = getInventoryTransactionColumns({
    getProductName,
    getWarehouseName,
    getTypeBadgeVariant,
    getTransactionTypeLabel,
  });

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
                    {products?.map(product => (
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
                    {warehouses?.map(warehouse => (
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
                    {TRANSACTION_TYPES?.map(type => (
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
                    {transactions.items?.map(transaction => (
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
