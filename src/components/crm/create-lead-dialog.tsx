"use client";

import { useEffect, useState } from "react";
import type React from "react";
import { leadsService } from "@/api/services/leads.service";
import {
  CreateLeadSchema,
  type CreateLeadFormData,
} from "@/lib/validation/crm/lead.schemas";
import { parseZodErrors } from "@/lib/validation";

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

interface CreateLeadDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess: () => void;
  readonly ownerUsername: string;
}

export function CreateLeadDialog({
  open,
  onOpenChange,
  onSuccess,
  ownerUsername,
}: CreateLeadDialogProps) {
  const [formData, setFormData] = useState<CreateLeadFormData>({
    title: "",
    ownerUsername,
    source: undefined,
    contactName: undefined,
    contactEmail: undefined,
    contactPhone: undefined,
  });

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFormData({
      title: "",
      ownerUsername,
      source: undefined,
      contactName: undefined,
      contactEmail: undefined,
      contactPhone: undefined,
    });
    setError(null);
    setFieldErrors({});
  }, [open, ownerUsername]);

  const handleChange = (
    field: keyof CreateLeadFormData,
    value: string | number | boolean,
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field as string]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[field as string];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const validation = CreateLeadSchema.safeParse(formData);
    if (!validation.success) {
      setFieldErrors(parseZodErrors(validation.error));
      setError("Please fix the validation errors");
      return;
    }

    setIsLoading(true);
    try {
      await leadsService.createLead(validation.data);
      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to create lead",
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
            <DialogTitle>Create Lead</DialogTitle>
            <DialogDescription>
              Add a new CRM lead to the pipeline.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={e => handleChange("title", e.target.value)}
                required
                disabled={isLoading}
                className={fieldErrors.title ? "border-red-500" : ""}
              />
              {fieldErrors.title && (
                <p className="text-sm text-red-500">{fieldErrors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Input
                id="source"
                value={formData.source ?? ""}
                onChange={e => handleChange("source", e.target.value)}
                disabled={isLoading}
                className={fieldErrors.source ? "border-red-500" : ""}
              />
              {fieldErrors.source && (
                <p className="text-sm text-red-500">{fieldErrors.source}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactName">Contact Name</Label>
                <Input
                  id="contactName"
                  value={formData.contactName ?? ""}
                  onChange={e => handleChange("contactName", e.target.value)}
                  disabled={isLoading}
                  className={fieldErrors.contactName ? "border-red-500" : ""}
                />
                {fieldErrors.contactName && (
                  <p className="text-sm text-red-500">
                    {fieldErrors.contactName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail ?? ""}
                  onChange={e => handleChange("contactEmail", e.target.value)}
                  disabled={isLoading}
                  className={fieldErrors.contactEmail ? "border-red-500" : ""}
                />
                {fieldErrors.contactEmail && (
                  <p className="text-sm text-red-500">
                    {fieldErrors.contactEmail}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                type="tel"
                value={formData.contactPhone ?? ""}
                onChange={e => handleChange("contactPhone", e.target.value)}
                disabled={isLoading}
                className={fieldErrors.contactPhone ? "border-red-500" : ""}
              />
              {fieldErrors.contactPhone && (
                <p className="text-sm text-red-500">
                  {fieldErrors.contactPhone}
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

