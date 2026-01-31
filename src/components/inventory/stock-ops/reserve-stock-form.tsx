import React from "react";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { stockOperationsService } from "@/api/services/stock-operations.service";
import type { OrderDto } from "@/types/api.types";
import { useStockOperationForm } from "@/hooks/use-stock-operation-form";

interface ReserveStockFormProps {
  readonly products: Array<{ readonly id: string; readonly name: string; readonly sku: string }>;
  readonly warehouses: Array<{ readonly id: string; readonly name: string }>;
  readonly orders: readonly OrderDto[];
}

interface ReserveStockData {
  productId: string;
  warehouseId: string;
  quantity: number;
  orderId: string;
  expiresAt?: string;
}

export function ReserveStockForm({ products, warehouses, orders }: ReserveStockFormProps) {
  const { isLoading, error, success, handleSubmit } = useStockOperationForm<ReserveStockData>(
    {
      onSubmit: (data) => stockOperationsService.reserveStock(data),
      successMessage: "Stock reserved successfully!",
      defaultErrorMessage: "Failed to reserve stock",
    },
    (formData) => ({
      productId: formData.get("productId") as string,
      warehouseId: formData.get("warehouseId") as string,
      quantity: Number.parseInt(formData.get("quantity") as string),
      orderId: formData.get("orderId") as string,
      expiresAt: (formData.get("expiresAt") as string) || undefined,
    })
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Product" name="productId" type="select" required>
          <option value="">Select a product...</option>
          {products?.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} ({product.sku})
            </option>
          ))}
        </FormField>

        <FormField label="Warehouse" name="warehouseId" type="select" required>
          <option value="">Select a warehouse...</option>
          {warehouses?.map((warehouse) => (
            <option key={warehouse.id} value={warehouse.id}>
              {warehouse.name}
            </option>
          ))}
        </FormField>

        <FormField label="Quantity" name="quantity" type="number" required min={1} />

        <FormField label="Order" name="orderId" type="select" required>
          <option value="">Select an order...</option>
          {orders?.map((order) => (
            <option key={order.id} value={order.id}>
              {order.orderNumber} ({order.status})
            </option>
          ))}
        </FormField>

        <FormField label="Expires At (optional)" name="expiresAt" type="datetime-local" />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && (
        <p className="text-green-500 text-sm">Stock reserved successfully!</p>
      )}

      <Button type="submit" disabled={isLoading}>
        <Package className="h-4 w-4 mr-2" />
        Reserve Stock
      </Button>
    </form>
  );
}
