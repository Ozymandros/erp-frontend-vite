"use client";

import type React from "react";
import { useState } from "react";
import { customersService } from "@/api/services/customers.service";
import { CreateCustomerSchema, type CreateCustomerFormData } from "@/lib/validation/sales/customer.schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CreateCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateCustomerDialog({ open, onOpenChange, onSuccess }: CreateCustomerDialogProps) {
  const [formData, setFormData] = useState<CreateCustomerFormData>({
    name: "", email: "", phone: "", address: "", city: "", country: "", postalCode: "", isActive: true
  });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: keyof CreateCustomerFormData, value: string | number | boolean) => {
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
    setError(null);
    setFieldErrors({});

    const validation = CreateCustomerSchema.safeParse(formData);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) errors[err.path[0].toString()] = err.message;
      });
      setFieldErrors(errors);
      setError("Please fix the validation errors");
      return;
    }

    setIsLoading(true);
    try {
      await customersService.createCustomer({ ...formData, email: formData.email || undefined, phone: formData.phone || undefined, address: formData.address || undefined, city: formData.city || undefined, country: formData.country || undefined, postalCode: formData.postalCode || undefined });
      onSuccess();
      setFormData({ name: "", email: "", phone: "", address: "", city: "", country: "", postalCode: "", isActive: true });
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create customer");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Customer</DialogTitle>
            <DialogDescription>Add a new customer to the system</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} required disabled={isLoading} className={fieldErrors.name ? "border-red-500" : ""} />
              {fieldErrors.name && <p className="text-sm text-red-500">{fieldErrors.name}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} disabled={isLoading} className={fieldErrors.email ? "border-red-500" : ""} />
                {fieldErrors.email && <p className="text-sm text-red-500">{fieldErrors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} disabled={isLoading} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" value={formData.address} onChange={(e) => handleChange("address", e.target.value)} disabled={isLoading} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={formData.city} onChange={(e) => handleChange("city", e.target.value)} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input id="postalCode" value={formData.postalCode} onChange={(e) => handleChange("postalCode", e.target.value)} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" value={formData.country} onChange={(e) => handleChange("country", e.target.value)} disabled={isLoading} />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="isActive" checked={formData.isActive} onCheckedChange={(checked) => handleChange("isActive", checked)} disabled={isLoading} />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? "Creating..." : "Create Customer"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
