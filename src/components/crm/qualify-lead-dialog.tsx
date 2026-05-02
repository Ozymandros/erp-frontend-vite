"use client";

import { useEffect, useMemo, useState } from "react";
import type React from "react";
import { customersService } from "@/api/services/customers.service";
import { leadsService } from "@/api/services/leads.service";
import { parseZodErrors } from "@/lib/validation";
import {
  QualifyLeadSchema,
  type QualifyLeadFormData,
} from "@/lib/validation/crm/lead.schemas";
import type { CustomerDto } from "@/types/api.types";

import { Button } from "@/components/ui/button";
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

interface QualifyLeadDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess: () => void;
  readonly leadId: string;
}

export function QualifyLeadDialog({
  open,
  onOpenChange,
  onSuccess,
  leadId,
}: QualifyLeadDialogProps) {
  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>(
    {},
  );
  const [isLoading, setIsLoading] = useState(false);

  const initialFormData = useMemo(
    (): QualifyLeadFormData => ({
      customerId: "",
    }),
    [],
  );

  const [formData, setFormData] = useState<QualifyLeadFormData>(
    initialFormData,
  );

  useEffect(() => {
    if (!open) return;

    setError(null);
    setFieldErrors({});
    setFormData(initialFormData);

    const load = async () => {
      setLoadingCustomers(true);
      try {
        const data = await customersService.getCustomers();
        setCustomers(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load customers");
      } finally {
        setLoadingCustomers(false);
      }
    };

    void load();
  }, [open, initialFormData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const validation = QualifyLeadSchema.safeParse(formData);
    if (!validation.success) {
      setFieldErrors(parseZodErrors(validation.error));
      setError("Please fix the validation errors");
      return;
    }

    setIsLoading(true);
    try {
      await leadsService.qualifyLead(leadId, validation.data);
      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to qualify lead");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Qualify Lead</DialogTitle>
            <DialogDescription>
              Convert this lead into a customer record.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="customerId">Customer *</Label>
              <select
                id="customerId"
                aria-label="Customer"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.customerId}
                onChange={e => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
                disabled={isLoading || loadingCustomers}
              >
                <option value="">Select customer...</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {fieldErrors.customerId && (
                <p className="text-sm text-red-500">{fieldErrors.customerId}</p>
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
            <Button type="submit" disabled={isLoading || loadingCustomers}>
              {isLoading ? "Qualifying..." : "Qualify Lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

