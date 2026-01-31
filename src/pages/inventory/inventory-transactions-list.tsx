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

  const { canExport } = useModulePermissions("inventory");

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

  const getTypeBadgeVariant = (type: TransactionType): "default" | "destructive" | "secondary" | "outline" => {
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

  let cardDescription = "All inventory transactions";
  if (filterProduct) {
    cardDescription = `Transactions for ${getProductName(filterProduct)}`;
  } else if (filterWarehouse) {
    cardDescription = `Transactions in ${getWarehouseName(filterWarehouse)}`;
  } else if (filterType) {
    cardDescription = `Transactions of type ${getTransactionTypeLabel(filterType)}`;
  }

  return (
    <ListPageLayout
      title="Inventory Transactions"
      description="View all inventory movement transactions"
      resourceName="Transaction"
      data={transactions}
      isLoading={isLoading}
      error={error}
      querySpec={querySpec}
      onSearch={handleSearch}
      onSort={handleSort}
      onPageChange={handlePageChange}
      onExport={canExport ? handleExport : undefined}
      columns={columns}
      cardTitle="Transaction Log"
      cardDescription={cardDescription}
      searchPlaceholder="Search transactions..."
      extraHeaderActions={
        <div className="flex flex-wrap gap-4">
          <select
            aria-label="Filter by product"
            className="rounded-md border border-input bg-background px-3 py-1 text-sm"
            value={filterProduct}
            onChange={(e) => {
              setFilterProduct(e.target.value);
              setFilterWarehouse("");
              setFilterType("");
            }}
          >
            <option value="">Filter by Product...</option>
            {products?.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <select
            aria-label="Filter by warehouse"
            className="rounded-md border border-input bg-background px-3 py-1 text-sm"
            value={filterWarehouse}
            onChange={(e) => {
              setFilterWarehouse(e.target.value);
              setFilterProduct("");
              setFilterType("");
            }}
          >
            <option value="">Filter by Warehouse...</option>
            {warehouses?.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
          <select
            aria-label="Filter by type"
            className="rounded-md border border-input bg-background px-3 py-1 text-sm"
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value as TransactionType | "");
              setFilterProduct("");
              setFilterWarehouse("");
            }}
          >
            <option value="">Filter by Type...</option>
            {TRANSACTION_TYPES?.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      }
    />
  );
}
