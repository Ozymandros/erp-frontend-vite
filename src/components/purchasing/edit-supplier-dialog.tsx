"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { suppliersService } from "@/api/services/suppliers.service";
import type { SupplierDto } from "@/types/api.types";
import {
  UpdateSupplierSchema,
  type UpdateSupplierFormData,
} from "@/lib/validation/purchasing/supplier.schemas";
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

interface EditSupplierDialogProps {
  readonly supplier: SupplierDto;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess: () => void;
}

export function EditSupplierDialog({
  supplier,
  open,
  onOpenChange,
  onSuccess,
}: EditSupplierDialogProps) {
  const [formData, setFormData] = useState<UpdateSupplierFormData>({
    name: supplier.name,
    email: supplier.email,
    phone: supplier.phone ?? "",
    address: supplier.address ?? "",
    city: supplier.city ?? "",
    country: supplier.country ?? "",
    postalCode: supplier.postalCode ?? "",
    isActive: supplier.isActive,
  });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setFormData({
      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone ?? "",
      address: supplier.address ?? "",
      city: supplier.city ?? "",
      country: supplier.country ?? "",
      postalCode: supplier.postalCode ?? "",
      isActive: supplier.isActive,
    });
  }, [supplier]);

  const handleChange = (
    field: keyof UpdateSupplierFormData,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const validation = UpdateSupplierSchema.safeParse(formData);
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
      await suppliersService.updateSupplier(supplier.id, {
        name: validation.data.name,
        email: validation.data.email,
        phone: validation.data.phone || undefined,
        address: validation.data.address || undefined,
        city: validation.data.city || undefined,
        country: validation.data.country || undefined,
        postalCode: validation.data.postalCode || undefined,
        isActive: validation.data.isActive ?? true,
      });
      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to update supplier"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
            <DialogDescription>
              Update supplier information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  disabled={isLoading}
                  className={fieldErrors.email ? "border-red-500" : ""}
                />
                {fieldErrors.email && (
                  <p className="text-sm text-red-500">{fieldErrors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  type="tel"
                  id="edit-phone"
                  value={formData.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  disabled={isLoading}
                  className={fieldErrors.phone ? "border-red-500" : ""}
                />
                {fieldErrors.phone && (
                  <p className="text-sm text-red-500">{fieldErrors.phone}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Textarea
                id="edit-address"
                value={formData.address || ""}
                onChange={(e) => handleChange("address", e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-city">City</Label>
                <Input
                  id="edit-city"
                  value={formData.city || ""}
                  onChange={(e) => handleChange("city", e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-country">Country</Label>
                <Input
                  id="edit-country"
                  value={formData.country || ""}
                  onChange={(e) => handleChange("country", e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-postalCode">Postal Code</Label>
                <Input
                  id="edit-postalCode"
                  value={formData.postalCode || ""}
                  onChange={(e) => handleChange("postalCode", e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  handleChange("isActive", checked === true)
                }
                disabled={isLoading}
              />
              <Label htmlFor="edit-isActive" className="font-normal">
                Active
              </Label>
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
              {isLoading ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
