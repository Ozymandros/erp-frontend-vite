"use client";

import { useEffect, useState, type FormEvent } from "react";
import { customersService } from "@/api/services/customers.service";
import { invoicesService } from "@/api/services/invoices.service";
import { ordersService } from "@/api/services/orders.service";
import {
  CreateInvoiceSchema,
  type CreateInvoiceFormData,
} from "@/lib/validation/billing/invoice.schemas";
import { parseZodErrors } from "@/lib/validation/zod-utils";
import type { CustomerDto, OrderDto } from "@/types/api.types";
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

interface CreateInvoiceDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess: () => void;
}

type InvoiceLineInput = CreateInvoiceFormData["lines"][number];

const DEFAULT_LINE: InvoiceLineInput = {
  description: "",
  quantity: 1,
  unitPrice: 0,
  taxRate: 0,
  discount: 0,
};

const DEFAULT_FORM: CreateInvoiceFormData = {
  invoiceNumber: "",
  customerId: "",
  orderId: undefined,
  currency: "EUR",
  paymentTermsDays: 30,
  lines: [],
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const normalizeCustomers = (payload: unknown): CustomerDto[] => {
  if (Array.isArray(payload)) {
    return payload as CustomerDto[];
  }

  if (!isRecord(payload)) {
    return [];
  }

  const items = payload.items;
  if (Array.isArray(items)) {
    return items as CustomerDto[];
  }

  const value = payload.value;
  if (Array.isArray(value)) {
    return value as CustomerDto[];
  }

  return [];
};

export function CreateInvoiceDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateInvoiceDialogProps) {
  const [formData, setFormData] = useState<CreateInvoiceFormData>(DEFAULT_FORM);
  const [lineInput, setLineInput] = useState<InvoiceLineInput>(DEFAULT_LINE);
  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    setFormData(DEFAULT_FORM);
    setLineInput(DEFAULT_LINE);
    setError(null);
    setFieldErrors({});

    const loadDependencies = async () => {
      try {
        const [customersData, ordersData] = await Promise.all([
          customersService.getCustomers(),
          ordersService.getOrders(),
        ]);
        setCustomers(normalizeCustomers(customersData));
        setOrders(ordersData);
      } catch {
        setError("Failed to load customers or orders.");
      }
    };

    void loadDependencies();
  }, [open]);

  const handleAddLine = () => {
    if (!lineInput.description.trim()) {
      return;
    }

    setFormData(prev => ({
      ...prev,
      lines: [...prev.lines, lineInput],
    }));
    setLineInput(DEFAULT_LINE);
  };

  const handleRemoveLine = (index: number) => {
    setFormData(prev => ({
      ...prev,
      lines: prev.lines.filter((_, lineIndex) => lineIndex !== index),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    const validation = CreateInvoiceSchema.safeParse(formData);
    if (!validation.success) {
      setError("Please fix the validation errors.");
      setFieldErrors(parseZodErrors(validation.error));
      return;
    }

    setIsLoading(true);
    try {
      await invoicesService.createInvoice(validation.data);
      onSuccess();
      onOpenChange(false);
    } catch (submitError: unknown) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to create invoice.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Invoice</DialogTitle>
            <DialogDescription>
              Create a draft invoice and add billable lines.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Invoice Number</Label>
                <Input
                  id="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={event =>
                    setFormData(prev => ({
                      ...prev,
                      invoiceNumber: event.target.value,
                    }))
                  }
                  disabled={isLoading}
                />
                {fieldErrors.invoiceNumber && (
                  <p className="text-sm text-red-500">
                    {fieldErrors.invoiceNumber}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerId">Customer</Label>
                <select
                  id="customerId"
                  title="Customer"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.customerId}
                  onChange={event =>
                    setFormData(prev => ({
                      ...prev,
                      customerId: event.target.value,
                    }))
                  }
                  disabled={isLoading}
                >
                  <option value="">Select customer...</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
                {fieldErrors.customerId && (
                  <p className="text-sm text-red-500">
                    {fieldErrors.customerId}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="orderId">Source Order (Optional)</Label>
                <select
                  id="orderId"
                  title="Source Order"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.orderId ?? ""}
                  onChange={event =>
                    setFormData(prev => ({
                      ...prev,
                      orderId: event.target.value || undefined,
                    }))
                  }
                  disabled={isLoading}
                >
                  <option value="">No linked order</option>
                  {orders.map(order => (
                    <option key={order.id} value={order.id}>
                      {order.orderNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  value={formData.currency}
                  onChange={event =>
                    setFormData(prev => ({
                      ...prev,
                      currency: event.target.value,
                    }))
                  }
                  disabled={isLoading}
                />
                {fieldErrors.currency && (
                  <p className="text-sm text-red-500">{fieldErrors.currency}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentTermsDays">Payment Terms (Days)</Label>
                <Input
                  id="paymentTermsDays"
                  type="number"
                  min={0}
                  value={formData.paymentTermsDays ?? 30}
                  onChange={event =>
                    setFormData(prev => ({
                      ...prev,
                      paymentTermsDays: Number(event.target.value),
                    }))
                  }
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-3 rounded-md border p-4">
              <p className="font-medium">Invoice Lines</p>
              <div className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-4 space-y-1">
                  <Label htmlFor="description" className="text-xs">
                    Description
                  </Label>
                  <Input
                    id="description"
                    value={lineInput.description}
                    onChange={event =>
                      setLineInput(prev => ({
                        ...prev,
                        description: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label htmlFor="quantity" className="text-xs">
                    Qty
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min={1}
                    value={lineInput.quantity}
                    onChange={event =>
                      setLineInput(prev => ({
                        ...prev,
                        quantity: Number(event.target.value),
                      }))
                    }
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label htmlFor="unitPrice" className="text-xs">
                    Unit Price
                  </Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    step="0.01"
                    min={0}
                    value={lineInput.unitPrice}
                    onChange={event =>
                      setLineInput(prev => ({
                        ...prev,
                        unitPrice: Number(event.target.value),
                      }))
                    }
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label htmlFor="taxRate" className="text-xs">
                    Tax Rate
                  </Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.01"
                    min={0}
                    value={lineInput.taxRate}
                    onChange={event =>
                      setLineInput(prev => ({
                        ...prev,
                        taxRate: Number(event.target.value),
                      }))
                    }
                  />
                </div>
                <div className="col-span-1">
                  <Button
                    type="button"
                    size="icon"
                    onClick={handleAddLine}
                    aria-label="Add line"
                  >
                    <Plus className="h-4 w-4" />
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
                      <TableHead className="text-right">Tax</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.lines.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-muted-foreground"
                        >
                          No lines added.
                        </TableCell>
                      </TableRow>
                    ) : (
                      formData.lines.map((line, index) => (
                        <TableRow key={`${line.description}-${index}`}>
                          <TableCell>{line.description}</TableCell>
                          <TableCell className="text-right">
                            {line.quantity}
                          </TableCell>
                          <TableCell className="text-right">
                            {line.unitPrice.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            {line.taxRate.toFixed(2)}%
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-red-500"
                              onClick={() => handleRemoveLine(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              {fieldErrors.lines && (
                <p className="text-sm text-red-500">{fieldErrors.lines}</p>
              )}
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
            <Button
              type="submit"
              disabled={isLoading || formData.lines.length === 0}
            >
              {isLoading ? "Creating..." : "Create Invoice"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
