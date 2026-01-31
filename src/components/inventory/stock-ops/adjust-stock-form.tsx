import { Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { stockOperationsService } from "@/api/services/stock-operations.service";
import { AdjustmentType } from "@/types/api.types";
import { useStockOperationForm } from "@/hooks/use-stock-operation-form";

interface AdjustStockFormProps {
  readonly products: Array<{ readonly id: string; readonly name: string; readonly sku: string }>;
  readonly warehouses: Array<{ readonly id: string; readonly name: string }>;
}

interface AdjustStockData {
  productId: string;
  warehouseId: string;
  quantity: number;
  reason: string;
  adjustmentType: AdjustmentType;
}

export function AdjustStockForm({ products, warehouses }: AdjustStockFormProps) {
  const { isLoading, error, success, handleSubmit } = useStockOperationForm<AdjustStockData>(
    {
      onSubmit: (data) => stockOperationsService.adjustStock(data),
      successMessage: "Stock adjusted successfully!",
      defaultErrorMessage: "Failed to adjust stock",
    },
    (formData) => ({
      productId: formData.get("productId") as string,
      warehouseId: formData.get("warehouseId") as string,
      quantity: Number.parseInt(formData.get("quantity") as string),
      reason: formData.get("reason") as string,
      adjustmentType: formData.get("adjustmentType") as AdjustmentType,
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

        <FormField label="Adjustment Type" name="adjustmentType" type="select" required>
          <option value="">Select type...</option>
          <option value="Increase">Increase</option>
          <option value="Decrease">Decrease</option>
          <option value="Found">Found</option>
          <option value="Lost">Lost</option>
          <option value="Damaged">Damaged</option>
        </FormField>

        <FormField label="Reason" name="reason" type="textarea" required className="col-span-2" rows={3} />
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
