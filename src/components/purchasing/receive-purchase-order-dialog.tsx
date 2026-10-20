import { useEffect, useState, type FormEvent } from "react";
import { purchaseOrdersService } from "@/api/services/purchase-orders.service";
import { warehousesService } from "@/api/services/warehouses.service";
import type { PurchaseOrderDto, WarehouseDto } from "@/types/api.types";
import {
  ReceivePurchaseOrderApiSchema,
  type ReceivePurchaseOrderApiFormData,
} from "@/lib/validation/purchasing/purchase-order.schemas";
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
import { Textarea } from "@/components/ui/textarea";

interface ReceivePurchaseOrderDialogProps {
  readonly open: boolean;
  readonly order: PurchaseOrderDto;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess: () => void;
}

function buildInitialForm(order: PurchaseOrderDto): ReceivePurchaseOrderApiFormData {
  const today = new Date().toISOString().slice(0, 10);
  return {
    warehouseId: "",
    receivedDate: today,
    notes: "",
    lines: (order.orderLines ?? []).map((line) => ({
      purchaseOrderLineId: line.id,
      receivedQuantity: line.quantity,
    })),
  };
}

export function ReceivePurchaseOrderDialog({
  open,
  order,
  onOpenChange,
  onSuccess,
}: ReceivePurchaseOrderDialogProps) {
  const [warehouses, setWarehouses] = useState<WarehouseDto[]>([]);
  const [formData, setFormData] = useState<ReceivePurchaseOrderApiFormData>(
    buildInitialForm(order)
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    setFormData(buildInitialForm(order));
    setFieldErrors({});
    setError(null);

    void warehousesService.getWarehouses().then(setWarehouses).catch(() => {
      setWarehouses([]);
    });
  }, [open, order]);

  const updateLineQuantity = (lineId: string, receivedQuantity: number) => {
    setFormData((prev) => ({
      ...prev,
      lines: prev.lines.map((line) =>
        line.purchaseOrderLineId === lineId
          ? { ...line, receivedQuantity }
          : line
      ),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    const validation = ReceivePurchaseOrderApiSchema.safeParse(formData);
    if (!validation.success) {
      setFieldErrors(parseZodErrors(validation.error));
      setError("Please fix the validation errors.");
      return;
    }

    setIsLoading(true);
    try {
      await purchaseOrdersService.receivePurchaseOrder(order.id, {
        warehouseId: validation.data.warehouseId,
        receivedDate: validation.data.receivedDate,
        notes: validation.data.notes,
        lines: validation.data.lines,
      });
      onSuccess();
      onOpenChange(false);
    } catch (submitError: unknown) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to receive purchase order."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Receive Purchase Order</DialogTitle>
            <DialogDescription>
              Record goods received for {order.orderNumber}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
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

              <div className="space-y-2">
                <Label htmlFor="receivedDate">Received date</Label>
                <Input
                  id="receivedDate"
                  type="date"
                  value={formData.receivedDate}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      receivedDate: event.target.value,
                    }))
                  }
                />
                {fieldErrors.receivedDate ? (
                  <p className="text-sm text-destructive">{fieldErrors.receivedDate}</p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes ?? ""}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, notes: event.target.value }))
                }
              />
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Received Qty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.lines.map((line) => {
                    const orderLine = order.orderLines?.find(
                      (item) => item.id === line.purchaseOrderLineId
                    );
                    return (
                      <TableRow key={line.purchaseOrderLineId}>
                        <TableCell>{orderLine?.productId ?? line.purchaseOrderLineId}</TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            min={1}
                            className="ml-auto w-24"
                            value={line.receivedQuantity}
                            onChange={(event) =>
                              updateLineQuantity(
                                line.purchaseOrderLineId,
                                Number.parseInt(event.target.value, 10) || 1
                              )
                            }
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
              {isLoading ? "Receiving..." : "Receive"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
