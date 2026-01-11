"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { warehousesService } from "@/api/services/warehouses.service";
import type { WarehouseDto } from "@/types/api.types";
import {
  UpdateWarehouseSchema,
  type UpdateWarehouseFormData,
} from "@/lib/validation/inventory/warehouse.schemas";
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

interface EditWarehouseDialogProps {
  warehouse: WarehouseDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditWarehouseDialog({
  warehouse,
  open,
  onOpenChange,
  onSuccess,
}: EditWarehouseDialogProps) {
  const [formData, setFormData] = useState<UpdateWarehouseFormData>({
    name: "",
    location: "",
    address: "",
    city: "",
    country: "",
    postalCode: "",
    isActive: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (warehouse) {
      setFormData({
        name: warehouse.name,
        location: warehouse.location || "",
        address: warehouse.address || "",
        city: warehouse.city || "",
        country: warehouse.country || "",
        postalCode: warehouse.postalCode || "",
        isActive: warehouse.isActive,
      });
    }
  }, [warehouse]);

  const handleChange = (field: keyof UpdateWarehouseFormData, value: any) => {
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
    if (!warehouse) return;

    setError(null);
    setFieldErrors({});

    const validation = UpdateWarehouseSchema.safeParse(formData);
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
      await warehousesService.updateWarehouse(warehouse.id, {
        ...formData,
        location: formData.location || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        country: formData.country || undefined,
        postalCode: formData.postalCode || undefined,
      });
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Failed to update warehouse");
    } finally {
      setIsLoading(false);
    }
  };

  if (!warehouse) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Warehouse</DialogTitle>
            <DialogDescription>Update warehouse information</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

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

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                disabled={isLoading}
                className={fieldErrors.location ? "border-red-500" : ""}
              />
              {fieldErrors.location && (
                <p className="text-sm text-red-500">{fieldErrors.location}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                disabled={isLoading}
                className={fieldErrors.address ? "border-red-500" : ""}
              />
              {fieldErrors.address && (
                <p className="text-sm text-red-500">{fieldErrors.address}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  disabled={isLoading}
                  className={fieldErrors.city ? "border-red-500" : ""}
                />
                {fieldErrors.city && (
                  <p className="text-sm text-red-500">{fieldErrors.city}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => handleChange("postalCode", e.target.value)}
                  disabled={isLoading}
                  className={fieldErrors.postalCode ? "border-red-500" : ""}
                />
                {fieldErrors.postalCode && (
                  <p className="text-sm text-red-500">{fieldErrors.postalCode}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleChange("country", e.target.value)}
                disabled={isLoading}
                className={fieldErrors.country ? "border-red-500" : ""}
              />
              {fieldErrors.country && (
                <p className="text-sm text-red-500">{fieldErrors.country}</p>
              )}
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
              {isLoading ? "Updating..." : "Update Warehouse"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
