"use client";

import React, { useState, useEffect } from "react";
import { ordersService } from "@/api/services/orders.service";
import { customersService } from "@/api/services/customers.service";
import { productsService } from "@/api/services/products.service";
import {
  CreateOrderSchema,
  type CreateOrderFormData,
} from "@/lib/validation/orders/order.schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, CalendarIcon } from "lucide-react";
import { formatCurrency, getDefaultDateTimeLocal } from "@/lib/utils";
import type { CustomerDto, ProductDto } from "@/types/api.types";

interface CreateOrderDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess: () => void;
}

export function CreateOrderDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateOrderDialogProps) {
  const [formData, setFormData] = useState<CreateOrderFormData>({
    customerId: "",
    orderDate: getDefaultDateTimeLocal(),
    orderLines: [],
  });
  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // New line state
  const [newLine, setNewLine] = useState({
    productId: "",
    quantity: 1,
    unitPrice: 0,
  });

  useEffect(() => {
    if (open) {
      loadData();
      // Reset form on open
      setFormData({
        customerId: "",
        orderDate: getDefaultDateTimeLocal(),
        orderLines: [],
      });
      setNewLine({ productId: "", quantity: 1, unitPrice: 0 });
      setError(null);
      setFieldErrors({});
    }
  }, [open]);

  const loadData = async () => {
    try {
      const [customersData, productsData] = await Promise.all([
        customersService.getCustomers(),
        productsService.getProducts(),
      ]);
      setCustomers(customersData);
      setProducts(productsData);
    } catch (err) {
      console.error("Failed to load dependency data", err);
      setError("Failed to load customers or products");
    }
  };

  const handleNewLineChange = (
    field: keyof typeof newLine,
    value: string | number
  ) => {
    if (field === "productId") {
      const product = products.find((p) => p.id === value);
      setNewLine((prev) => ({
        ...prev,
        productId: value as string,
        unitPrice: product ? product.unitPrice : 0,
      }));
    } else {
      setNewLine((prev) => ({ ...prev, [field]: value }));
    }
  };

  const addLine = () => {
    if (!newLine.productId) return;
    if (newLine.quantity <= 0) return;

    setFormData((prev) => ({
      ...prev,
      orderLines: [...prev.orderLines, { ...newLine }],
    }));

    // Reset new line, keep unitPrice 0 until product selected
    setNewLine({ productId: "", quantity: 1, unitPrice: 0 });
  };

  const removeLine = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      orderLines: prev.orderLines.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const validation = CreateOrderSchema.safeParse(formData);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        if (err.path[0]) errors[err.path[0].toString()] = err.message;
      });
      setFieldErrors(errors);
      setError("Please fix the validation errors");
      return;
    }

    setIsLoading(true);
    try {
      await ordersService.createOrder(validation.data);
      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to create order"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getTotal = () => {
    return formData.orderLines.reduce(
      (sum, line) => sum + line.quantity * line.unitPrice,
      0
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Fulfillment Order</DialogTitle>
            <DialogDescription>
              Create a new general fulfillment order
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerId">Customer</Label>
                  <select
                    id="customerId"
                    aria-label="Customer"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.customerId}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        customerId: e.target.value,
                      }))
                    }
                    disabled={isLoading}
                  >
                    <option value="">Select Customer...</option>
                    {customers?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
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
                  <Label htmlFor="orderDate">Order Date</Label>
                  <div className="relative">
                    <Input
                      id="orderDate"
                      type="datetime-local"
                      value={formData.orderDate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          orderDate: e.target.value,
                        }))
                      }
                      disabled={isLoading}
                    />
                    <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                  {fieldErrors.orderDate && (
                    <p className="text-sm text-red-500">
                      {fieldErrors.orderDate}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="border rounded-md p-4 space-y-4">
              <h4 className="font-medium">Order Lines</h4>

              {/* Add Line Form */}
              <div className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-6 space-y-1">
                  <Label htmlFor="productId" className="text-xs">
                    Product
                  </Label>
                  <select
                    id="productId"
                    aria-label="Product"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                    value={newLine.productId}
                    onChange={(e) =>
                      handleNewLineChange("productId", e.target.value)
                    }
                  >
                    <option value="">Select Product...</option>
                    {products?.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({formatCurrency(p.unitPrice)})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2 space-y-1">
                  <Label htmlFor="quantity" className="text-xs">
                    Qty
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min={1}
                    className="h-9"
                    value={newLine.quantity}
                    onChange={(e) =>
                      handleNewLineChange(
                        "quantity",
                        Number.parseInt(e.target.value) || 0
                      )
                    }
                  />
                </div>
                <div className="col-span-3 space-y-1">
                  <Label htmlFor="unitPrice" className="text-xs">
                    Price
                  </Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    min={0}
                    step="0.01"
                    className="h-9"
                    value={newLine.unitPrice}
                    onChange={(e) =>
                      handleNewLineChange(
                        "unitPrice",
                        Number.parseFloat(e.target.value) || 0
                      )
                    }
                  />
                </div>
                <div className="col-span-1">
                  <Button
                    type="button"
                    size="sm"
                    className="w-full"
                    onClick={addLine}
                    disabled={!newLine.productId}
                    aria-label="Add item"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Lines List */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.orderLines.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-muted-foreground"
                        >
                          No items added. Add items above.
                        </TableCell>
                      </TableRow>
                    ) : (
                      formData.orderLines?.map((line, index) => {
                        const product = products.find(
                          (p) => p.id === line.productId
                        );
                        return (
                          <TableRow key={index}>
                            <TableCell>
                              {product?.name || line.productId}
                            </TableCell>
                            <TableCell className="text-right">
                              {line.quantity}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(line.unitPrice)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(line.quantity * line.unitPrice)}
                            </TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500"
                                onClick={() => removeLine(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end gap-2 text-lg font-semibold">
                <span>Total:</span>
                <span>{formatCurrency(getTotal())}</span>
              </div>
              {fieldErrors.orderLines && (
                <p className="text-sm text-red-500 text-right">
                  {fieldErrors.orderLines}
                </p>
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
              disabled={isLoading || formData.orderLines.length === 0}
            >
              {isLoading ? "Creating…" : "Create Order"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
