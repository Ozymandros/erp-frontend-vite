import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { stockOperationsService } from "@/api/services/stock-operations.service";
import { useStockOperationForm } from "@/hooks/use-stock-operation-form";

interface TransferStockFormProps {
  readonly products: Array<{ readonly id: string; readonly name: string; readonly sku: string }>;
  readonly warehouses: Array<{ readonly id: string; readonly name: string }>;
}

interface TransferStockData {
  productId: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  quantity: number;
  reason: string;
}

export function TransferStockForm({ products, warehouses }: TransferStockFormProps) {
  const { isLoading, error, success, handleSubmit } = useStockOperationForm<TransferStockData>(
    {
      onSubmit: (data) => stockOperationsService.transferStock(data),
      successMessage: "Stock transferred successfully!",
      defaultErrorMessage: "Failed to transfer stock",
    },
    (formData) => ({
      productId: formData.get("productId") as string,
      fromWarehouseId: formData.get("fromWarehouseId") as string,
      toWarehouseId: formData.get("toWarehouseId") as string,
      quantity: Number.parseInt(formData.get("quantity") as string),
      reason: formData.get("reason") as string,
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

        <FormField label="Quantity" name="quantity" type="number" required min={1} />

        <FormField label="From Warehouse" name="fromWarehouseId" type="select" required>
          <option value="">Select source warehouse...</option>
          {warehouses?.map((warehouse) => (
            <option key={warehouse.id} value={warehouse.id}>
              {warehouse.name}
            </option>
          ))}
        </FormField>

        <FormField label="To Warehouse" name="toWarehouseId" type="select" required>
          <option value="">Select destination warehouse...</option>
          {warehouses?.map((warehouse) => (
            <option key={warehouse.id} value={warehouse.id}>
              {warehouse.name}
            </option>
          ))}
        </FormField>

        <FormField label="Reason" name="reason" type="textarea" required className="col-span-2" rows={3} />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && (
        <p className="text-green-500 text-sm">
          Stock transferred successfully!
        </p>
      )}

      <Button type="submit" disabled={isLoading}>
        <ArrowRight className="h-4 w-4 mr-2" />
        Transfer Stock
      </Button>
    </form>
  );
}
