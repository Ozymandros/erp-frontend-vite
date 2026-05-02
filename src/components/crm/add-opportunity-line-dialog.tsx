"use client";

import { useEffect, useState } from "react";
import type React from "react";
import { productsService } from "@/api/services/products.service";
import { crmOpportunitiesService } from "@/api/services/crm-opportunities.service";
import { parseZodErrors } from "@/lib/validation";
import {
  OpportunityLineSchema,
  type OpportunityLineFormData,
} from "@/lib/validation/crm/opportunity.schemas";
import type { ProductDto } from "@/types/api.types";

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

interface AddOpportunityLineDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess: () => void;
  readonly opportunityId: string;
}

export function AddOpportunityLineDialog({
  open,
  onOpenChange,
  onSuccess,
  opportunityId,
}: AddOpportunityLineDialogProps) {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [formData, setFormData] = useState<OpportunityLineFormData>({
    description: "",
    quantity: 1,
    unitPrice: 0,
    discountPercent: 0,
    productId: undefined,
    sku: undefined,
  });

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setFieldErrors({});
    setFormData({
      description: "",
      quantity: 1,
      unitPrice: 0,
      discountPercent: 0,
      productId: undefined,
      sku: undefined,
    });

    const loadProducts = async () => {
      setLoadingProducts(true);
      try {
        const data = await productsService.getProducts();
        setProducts(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load products");
      } finally {
        setLoadingProducts(false);
      }
    };

    void loadProducts();
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const validation = OpportunityLineSchema.safeParse(formData);
    if (!validation.success) {
      setFieldErrors(parseZodErrors(validation.error));
      setError("Please fix the validation errors");
      return;
    }

    setIsLoading(true);
    try {
      await crmOpportunitiesService.addOpportunityLine(opportunityId, validation.data);
      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add line");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Opportunity Line</DialogTitle>
            <DialogDescription>Attach products or custom descriptions to this opportunity.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="lineDescription">Description *</Label>
              <Input
                id="lineDescription"
                value={formData.description}
                onChange={e =>
                  setFormData(prev => ({ ...prev, description: e.target.value }))
                }
                disabled={isLoading || loadingProducts}
                className={fieldErrors.description ? "border-red-500" : ""}
              />
              {fieldErrors.description && (
                <p className="text-sm text-red-500">{fieldErrors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productId">Product (optional)</Label>
                <select
                  id="productId"
                  value={formData.productId ?? ""}
                  onChange={e => {
                    const nextProductId = e.target.value || undefined;
                    const product = products.find(p => p.id === nextProductId);
                    setFormData(prev => ({
                      ...prev,
                      productId: nextProductId,
                      sku: product?.sku,
                      unitPrice: product ? product.unitPrice : prev.unitPrice,
                    }));
                  }}
                  disabled={isLoading || loadingProducts}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="">No product</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0.0001"
                  step="0.01"
                  value={formData.quantity}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      quantity: Number.parseFloat(e.target.value) || 0,
                    }))
                  }
                  disabled={isLoading || loadingProducts}
                  className={fieldErrors.quantity ? "border-red-500" : ""}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unitPrice">Unit Price *</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      unitPrice: Number.parseFloat(e.target.value) || 0,
                    }))
                  }
                  disabled={isLoading || loadingProducts}
                  className={fieldErrors.unitPrice ? "border-red-500" : ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountPercent">Discount (0-1)</Label>
                <Input
                  id="discountPercent"
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  value={formData.discountPercent ?? 0}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      discountPercent: Number.parseFloat(e.target.value) || 0,
                    }))
                  }
                  disabled={isLoading || loadingProducts}
                  className={fieldErrors.discountPercent ? "border-red-500" : ""}
                />
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
            <Button type="submit" disabled={isLoading || loadingProducts}>
              {isLoading ? "Adding..." : "Add Line"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

