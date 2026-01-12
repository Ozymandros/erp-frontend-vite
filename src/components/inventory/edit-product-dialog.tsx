"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { productsService } from "@/api/services/products.service";
import type { ProductDto } from "@/types/api.types";
import {
  UpdateProductSchema,
  type UpdateProductFormData,
} from "@/lib/validation/inventory/product.schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EditProductDialogProps {
  product: ProductDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditProductDialog({
  product,
  open,
  onOpenChange,
  onSuccess,
}: EditProductDialogProps) {
  const [formData, setFormData] = useState<UpdateProductFormData>({
    sku: "",
    name: "",
    description: "",
    category: "",
    unitPrice: 0,
    reorderLevel: 0,
    isActive: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        sku: product.sku,
        name: product.name,
        description: product.description || "",
        category: product.category || "",
        unitPrice: product.unitPrice,
        reorderLevel: product.reorderLevel,
        isActive: product.isActive,
      });
    }
  }, [product]);

  const handleChange = (field: keyof UpdateProductFormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setError(null);
    setFieldErrors({});

    const validation = UpdateProductSchema.safeParse(formData);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
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
      await productsService.updateProduct(product.id, {
        ...formData,
        description: formData.description || undefined,
        category: formData.category || undefined,
      });
      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update product");
    } finally {
      setIsLoading(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update product information</DialogDescription>
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
                  onChange={(e) => handleChange("sku", e.target.value)}
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
                  onChange={(e) => handleChange("name", e.target.value)}
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
                onChange={(e) => handleChange("description", e.target.value)}
                disabled={isLoading}
                className={fieldErrors.description ? "border-red-500" : ""}
              />
              {fieldErrors.description && (
                <p className="text-sm text-red-500">{fieldErrors.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value)}
                disabled={isLoading}
                className={fieldErrors.category ? "border-red-500" : ""}
              />
              {fieldErrors.category && (
                <p className="text-sm text-red-500">{fieldErrors.category}</p>
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
                  onChange={(e) =>
                    handleChange("unitPrice", parseFloat(e.target.value) || 0)
                  }
                  required
                  disabled={isLoading}
                  className={fieldErrors.unitPrice ? "border-red-500" : ""}
                />
                {fieldErrors.unitPrice && (
                  <p className="text-sm text-red-500">{fieldErrors.unitPrice}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reorderLevel">Reorder Level *</Label>
                <Input
                  id="reorderLevel"
                  type="number"
                  min="0"
                  value={formData.reorderLevel}
                  onChange={(e) =>
                    handleChange("reorderLevel", parseInt(e.target.value) || 0)
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

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleChange("isActive", checked)}
                disabled={isLoading}
              />
              <Label htmlFor="isActive">Active</Label>
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
              {isLoading ? "Updating..." : "Update Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
