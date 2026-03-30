"use client";

import { useEffect, useMemo, useState } from "react";
import type React from "react";
import { customersService } from "@/api/services/customers.service";
import { leadsService } from "@/api/services/leads.service";
import { crmOpportunitiesService } from "@/api/services/crm-opportunities.service";
import { parseZodErrors } from "@/lib/validation";
import {
  CreateOpportunitySchema,
  type CreateOpportunityFormData,
} from "@/lib/validation/crm/opportunity.schemas";
import type { CustomerDto, LeadDto } from "@/types/api.types";

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

interface CreateOpportunityDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess: () => void;
  readonly ownerUsername: string;
}

export function CreateOpportunityDialog({
  open,
  onOpenChange,
  onSuccess,
  ownerUsername,
}: CreateOpportunityDialogProps) {
  const initialFormData = useMemo(
    (): CreateOpportunityFormData => ({
      customerId: "",
      name: "",
      ownerUsername,
      leadId: undefined,
    }),
    [ownerUsername],
  );

  const [formData, setFormData] = useState<CreateOpportunityFormData>(
    initialFormData,
  );
  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [leads, setLeads] = useState<LeadDto[]>([]);
  const [loadingDependencies, setLoadingDependencies] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFormData(initialFormData);
    setError(null);
    setFieldErrors({});

    const load = async () => {
      setLoadingDependencies(true);
      try {
        const [customersData, leadsData] = await Promise.all([
          customersService.getCustomers(),
          leadsService.searchLeads({
            page: 1,
            pageSize: 50,
            searchTerm: "",
            sortBy: "createdAt",
            sortDesc: true,
          }),
        ]);
        setCustomers(customersData);
        setLeads(leadsData.items);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load dependencies");
      } finally {
        setLoadingDependencies(false);
      }
    };

    void load();
  }, [open, initialFormData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const validation = CreateOpportunitySchema.safeParse(formData);
    if (!validation.success) {
      setFieldErrors(parseZodErrors(validation.error));
      setError("Please fix the validation errors");
      return;
    }

    setIsLoading(true);
    try {
      await crmOpportunitiesService.createOpportunity(validation.data);
      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create opportunity");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Opportunity</DialogTitle>
            <DialogDescription>
              Add a new opportunity and manage its forecast.
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
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={isLoading}
                  className={fieldErrors.name ? "border-red-500" : ""}
                />
                {fieldErrors.name && (
                  <p className="text-sm text-red-500">{fieldErrors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerId">Customer *</Label>
                <select
                  id="customerId"
                  value={formData.customerId}
                  onChange={e => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
                  disabled={isLoading || loadingDependencies}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
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

            <div className="space-y-2">
              <Label htmlFor="leadId">Lead (optional)</Label>
              <select
                id="leadId"
                value={formData.leadId ?? ""}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    leadId: e.target.value ? e.target.value : undefined,
                  }))
                }
                disabled={isLoading || loadingDependencies}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value="">No lead selected</option>
                {leads.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.title}
                  </option>
                ))}
              </select>
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
            <Button type="submit" disabled={isLoading || loadingDependencies}>
              {isLoading ? "Creating..." : "Create Opportunity"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

