import React, { useState } from "react";
import { Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { stockOperationsService } from "@/api/services/stock-operations.service";
import { handleApiError, getErrorMessage } from "@/lib/error-handling";
import { AdjustmentType } from "@/types/api.types";

interface AdjustStockFormProps {
  products: Array<{ id: string; name: string; sku: string }>;
  warehouses: Array<{ id: string; name: string }>;
}

export function AdjustStockForm({ products, warehouses }: AdjustStockFormProps) {
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
      reason: formData.get("reason") as string,
      adjustmentType: formData.get("adjustmentType") as AdjustmentType,
    };

    try {
      await stockOperationsService.adjustStock(data);
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } catch (err: unknown) {
      const apiError = handleApiError(err);
      setError(getErrorMessage(apiError, "Failed to adjust stock"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium flex flex-col gap-1">
            Product
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
            Warehouse
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
            Quantity
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
            Adjustment Type
            <select
              name="adjustmentType"
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select type...</option>
              <option value="Increase">Increase</option>
              <option value="Decrease">Decrease</option>
              <option value="Found">Found</option>
              <option value="Lost">Lost</option>
              <option value="Damaged">Damaged</option>
            </select>
          </label>
        </div>
        <div className="space-y-2 col-span-2">
          <label className="text-sm font-medium flex flex-col gap-1">
            Reason
            <textarea
              name="reason"
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              rows={3}
            />
          </label>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && (
        <p className="text-green-500 text-sm">Stock adjusted successfully!</p>
      )}

      <Button type="submit" disabled={isLoading}>
        <Minus className="h-4 w-4 mr-2" />
        Adjust Stock
      </Button>
    </form>
  );
}
