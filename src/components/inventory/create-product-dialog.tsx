"use client";

import type React from "react";

import { useState } from "react";
import { productsService } from "@/api/services/products.service";
import {
  CreateProductSchema,
  type CreateProductFormData,
} from "@/lib/validation/inventory/product.schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CreateProductDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess: () => void;
}

export function CreateProductDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateProductDialogProps) {
  const [formData, setFormData] = useState<CreateProductFormData>({
    sku: "",
    name: "",
    description: "",
    unitPrice: 0,
    reorderLevel: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    field: keyof CreateProductFormData,
    value: string | number | boolean
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const validation = CreateProductSchema.safeParse(formData);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.issues.forEach(err => {
        if (err.path[0]) {
          errors[err.path[0].toString()] = err.message;
        }
      });
      setFieldErrors(errors);
      setError("Please fix the validation errors");
      return;
    }

    setIsLoading(true);

    try {
      // Schema already handles empty strings -> undefined transformation
      await productsService.createProduct(validation.data);
      onSuccess();
      setFormData({
        sku: "",
        name: "",
        description: "",
        unitPrice: 0,
        reorderLevel: 0,
      });
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create product");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Product</DialogTitle>
            <DialogDescription>
              Add a new product to the inventory
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={e => handleChange("sku", e.target.value)}
                  required
                  disabled={isLoading}
                  className={fieldErrors.sku ? "border-red-500" : ""}
                />
                {fieldErrors.sku && (
                  <p className="text-sm text-red-500">{fieldErrors.sku}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e => handleChange("name", e.target.value)}
                  required
                  disabled={isLoading}
                  className={fieldErrors.name ? "border-red-500" : ""}
                />
                {fieldErrors.name && (
                  <p className="text-sm text-red-500">{fieldErrors.name}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={e => handleChange("description", e.target.value)}
                disabled={isLoading}
                className={fieldErrors.description ? "border-red-500" : ""}
              />
              {fieldErrors.description && (
                <p className="text-sm text-red-500">
                  {fieldErrors.description}
                </p>
              )}
            </div>



            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unitPrice">Unit Price *</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.unitPrice}
                  onChange={e =>
                    handleChange(
                      "unitPrice",
                      Number.parseFloat(e.target.value) || 0
                    )
                  }
                  required
                  disabled={isLoading}
                  className={fieldErrors.unitPrice ? "border-red-500" : ""}
                />
                {fieldErrors.unitPrice && (
                  <p className="text-sm text-red-500">
                    {fieldErrors.unitPrice}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reorderLevel">Reorder Level *</Label>
                <Input
                  id="reorderLevel"
                  type="number"
                  min="0"
                  value={formData.reorderLevel}
                  onChange={e =>
                    handleChange(
                      "reorderLevel",
                      Number.parseInt(e.target.value) || 0
                    )
                  }
                  required
                  disabled={isLoading}
                  className={fieldErrors.reorderLevel ? "border-red-500" : ""}
                />
                {fieldErrors.reorderLevel && (
                  <p className="text-sm text-red-500">
                    {fieldErrors.reorderLevel}
                  </p>
                )}
              </div>
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
              {isLoading ? "Creating…" : "Create Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
