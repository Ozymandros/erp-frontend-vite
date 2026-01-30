import React, { useState } from "react";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { stockOperationsService } from "@/api/services/stock-operations.service";
import { handleApiError, getErrorMessage } from "@/lib/error-handling";
import type { OrderDto } from "@/types/api.types";

interface ReserveStockFormProps {
  readonly products: Array<{ readonly id: string; readonly name: string; readonly sku: string }>;
  readonly warehouses: Array<{ readonly id: string; readonly name: string }>;
  readonly orders: readonly OrderDto[];
}

export function ReserveStockForm({ products, warehouses, orders }: ReserveStockFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const data = {
      productId: formData.get("productId") as string,
      warehouseId: formData.get("warehouseId") as string,
      quantity: Number.parseInt(formData.get("quantity") as string),
      orderId: formData.get("orderId") as string,
      expiresAt: (formData.get("expiresAt") as string) || undefined,
    };

    try {
      await stockOperationsService.reserveStock(data);
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } catch (err: unknown) {
      const apiError = handleApiError(err);
      setError(getErrorMessage(apiError, "Failed to reserve stock"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium flex flex-col gap-1">
            <span>Product</span>
            <select
              name="productId"
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select a product...</option>
              {products?.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.sku})
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium flex flex-col gap-1">
            <span>Warehouse</span>
            <select
              name="warehouseId"
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select a warehouse...</option>
              {warehouses?.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium flex flex-col gap-1">
            <span>Quantity</span>
            <input
              name="quantity"
              type="number"
              required
              min={1}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </label>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium flex flex-col gap-1">
            <span>Order</span>
            <select
              name="orderId"
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select an order...</option>
              {orders?.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.orderNumber} ({order.status})
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium flex flex-col gap-1">
            <span>Expires At (optional)</span>
            <input
              name="expiresAt"
              type="datetime-local"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </label>
        </div>
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
