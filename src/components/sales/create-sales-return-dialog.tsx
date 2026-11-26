import { useEffect, useState, type FormEvent } from "react";
import { salesOrdersService } from "@/api/services/sales-orders.service";
import { warehousesService } from "@/api/services/warehouses.service";
import type { SalesOrderDto, WarehouseDto } from "@/types/api.types";
import {
  CreateSalesReturnSchema,
  type CreateSalesReturnFormData,
} from "@/lib/validation/sales/sales-order.schemas";
import { parseZodErrors } from "@/lib/validation/zod-utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CreateSalesReturnDialogProps {
  readonly open: boolean;
  readonly order: SalesOrderDto;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess: () => void;
}

function buildInitialLines(order: SalesOrderDto): CreateSalesReturnFormData["lines"] {
  return (order.lines ?? []).map((line) => ({
    productId: line.productId,
    quantity: line.quantity,
  }));
}

export function CreateSalesReturnDialog({
  open,
  order,
  onOpenChange,
  onSuccess,
}: CreateSalesReturnDialogProps) {
  const [warehouses, setWarehouses] = useState<WarehouseDto[]>([]);
  const [formData, setFormData] = useState<CreateSalesReturnFormData>({
    warehouseId: "",
    lines: [],
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    setFormData({
      warehouseId: "",
      lines: buildInitialLines(order),
    });
    setFieldErrors({});
    setError(null);

    void warehousesService.getWarehouses().then(setWarehouses).catch(() => {
      setWarehouses([]);
    });
  }, [open, order]);

  const updateLineQuantity = (productId: string, quantity: number) => {
    setFormData((prev) => ({
      ...prev,
      lines: prev.lines.map((line) =>
        line.productId === productId ? { ...line, quantity } : line
      ),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    const validation = CreateSalesReturnSchema.safeParse(formData);
    if (!validation.success) {
      setFieldErrors(parseZodErrors(validation.error));
      setError("Please fix the validation errors.");
      return;
    }

    setIsLoading(true);
    try {
      await salesOrdersService.createReturn(order.id, validation.data);
      onSuccess();
      onOpenChange(false);
    } catch (submitError: unknown) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to create sales return."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Return</DialogTitle>
            <DialogDescription>
              Return items from sales order {order.orderNumber} to a warehouse.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="warehouseId">Warehouse</Label>
              <Select
                value={formData.warehouseId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, warehouseId: value }))
                }
              >
                <SelectTrigger id="warehouseId">
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.warehouseId ? (
                <p className="text-sm text-destructive">{fieldErrors.warehouseId}</p>
              ) : null}
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Return Qty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.lines.map((line) => (
                    <TableRow key={line.productId}>
                      <TableCell>{line.productId}</TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          min={1}
                          className="ml-auto w-24"
                          value={line.quantity}
                          onChange={(event) =>
                            updateLineQuantity(
                              line.productId,
                              Number.parseInt(event.target.value, 10) || 1
                            )
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {fieldErrors.lines ? (
                <p className="p-2 text-sm text-destructive">{fieldErrors.lines}</p>
              ) : null}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Create Return"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
