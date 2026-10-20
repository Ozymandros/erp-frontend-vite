import { useEffect, useState, type FormEvent } from "react";
import { supplierInvoicesService } from "@/api/services/supplier-invoices.service";
import { productsService } from "@/api/services/products.service";
import type {
  ProductDto,
  PurchaseOrderDto,
  PurchaseOrderLineDto,
} from "@/types/api.types";
import {
  CreateSupplierInvoiceSchema,
  type CreateSupplierInvoiceFormData,
  type SupplierInvoiceLineFormData,
} from "@/lib/validation/billing/supplier-invoice.schemas";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";

interface CreateSupplierInvoiceDialogProps {
  readonly open: boolean;
  readonly order: PurchaseOrderDto;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess: () => void;
}

const DEFAULT_LINE: SupplierInvoiceLineFormData = {
  description: "",
  quantity: 1,
  unitPrice: 0,
};

function productLineDescription(
  line: PurchaseOrderLineDto,
  productsById: Map<string, ProductDto>
): string {
  const product = productsById.get(line.productId);
  if (product?.name) {
    return product.sku ? `${product.name} (${product.sku})` : product.name;
  }
  return line.productId;
}

function linesFromPurchaseOrder(
  order: PurchaseOrderDto,
  productsById: Map<string, ProductDto>
): SupplierInvoiceLineFormData[] {
  return (order.orderLines ?? []).map((line) => ({
    description: productLineDescription(line, productsById),
    quantity: line.quantity,
    unitPrice: line.unitPrice,
  }));
}

export function CreateSupplierInvoiceDialog({
  open,
  order,
  onOpenChange,
  onSuccess,
}: CreateSupplierInvoiceDialogProps) {
  const [formData, setFormData] = useState<CreateSupplierInvoiceFormData>({
    invoiceNumber: "",
    invoiceDate: new Date().toISOString().slice(0, 10),
    currency: "USD",
    lines: [],
  });
  const [lineInput, setLineInput] = useState<SupplierInvoiceLineFormData>(DEFAULT_LINE);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    setLineInput(DEFAULT_LINE);
    setFieldErrors({});
    setError(null);

    void productsService
      .getProducts()
      .then((products) => {
        const productsById = new Map(products.map((product) => [product.id, product]));
        setFormData({
          invoiceNumber: "",
          invoiceDate: new Date().toISOString().slice(0, 10),
          currency: "USD",
          lines: linesFromPurchaseOrder(order, productsById),
        });
      })
      .catch(() => {
        setFormData({
          invoiceNumber: "",
          invoiceDate: new Date().toISOString().slice(0, 10),
          currency: "USD",
          lines: linesFromPurchaseOrder(order, new Map()),
        });
      });
  }, [open, order]);

  const handleAddLine = () => {
    if (!lineInput.description.trim()) return;
    setFormData((prev) => ({
      ...prev,
      lines: [...prev.lines, lineInput],
    }));
    setLineInput(DEFAULT_LINE);
  };

  const handleRemoveLine = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      lines: prev.lines.filter((_, lineIndex) => lineIndex !== index),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    const validation = CreateSupplierInvoiceSchema.safeParse(formData);
    if (!validation.success) {
      setFieldErrors(parseZodErrors(validation.error));
      setError("Please fix the validation errors.");
      return;
    }

    setIsLoading(true);
    try {
      await supplierInvoicesService.createSupplierInvoice({
        purchaseOrderId: order.id,
        supplierId: order.supplierId,
        invoiceNumber: validation.data.invoiceNumber,
        invoiceDate: validation.data.invoiceDate,
        currency: validation.data.currency,
        lines: validation.data.lines,
      });
      onSuccess();
      onOpenChange(false);
    } catch (submitError: unknown) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to create supplier invoice."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Supplier Invoice</DialogTitle>
            <DialogDescription>
              Register a supplier invoice for purchase order {order.orderNumber}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Invoice number</Label>
                <Input
                  id="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      invoiceNumber: event.target.value,
                    }))
                  }
                />
                {fieldErrors.invoiceNumber ? (
                  <p className="text-sm text-destructive">{fieldErrors.invoiceNumber}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoiceDate">Invoice date</Label>
                <Input
                  id="invoiceDate"
                  type="date"
                  value={formData.invoiceDate}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      invoiceDate: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  value={formData.currency}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, currency: event.target.value }))
                  }
                />
              </div>
            </div>

            <div className="rounded-md border p-4 space-y-3">
              <p className="text-sm font-medium">Add line</p>
              <div className="grid gap-2 sm:grid-cols-4">
                <Input
                  placeholder="Description"
                  value={lineInput.description}
                  onChange={(event) =>
                    setLineInput((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                />
                <Input
                  type="number"
                  min={1}
                  placeholder="Qty"
                  value={lineInput.quantity}
                  onChange={(event) =>
                    setLineInput((prev) => ({
                      ...prev,
                      quantity: Number.parseInt(event.target.value, 10) || 1,
                    }))
                  }
                />
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="Unit price"
                  value={lineInput.unitPrice}
                  onChange={(event) =>
                    setLineInput((prev) => ({
                      ...prev,
                      unitPrice: Number.parseFloat(event.target.value) || 0,
                    }))
                  }
                />
                <Button type="button" variant="outline" onClick={handleAddLine}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add
                </Button>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit</TableHead>
                    <TableHead className="w-[60px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.lines.map((line, index) => (
                    <TableRow key={`${line.description}-${index}`}>
                      <TableCell>{line.description}</TableCell>
                      <TableCell className="text-right">{line.quantity}</TableCell>
                      <TableCell className="text-right">{line.unitPrice}</TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveLine(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
              {isLoading ? "Saving..." : "Create Invoice"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
