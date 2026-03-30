"use client";

import { useEffect, useState } from "react";
import type React from "react";
import { parseZodErrors } from "@/lib/validation";
import {
  UpdateOpportunityForecastSchema,
  type UpdateOpportunityForecastFormData,
} from "@/lib/validation/crm/opportunity.schemas";
import { crmOpportunitiesService } from "@/api/services/crm-opportunities.service";

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

interface UpdateOpportunityForecastDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess: () => void;
  readonly opportunityId: string;
  readonly initialData?: {
    probability?: number;
    expectedAmount?: number;
    expectedCloseDate?: string;
  };
}

export function UpdateOpportunityForecastDialog({
  open,
  onOpenChange,
  onSuccess,
  opportunityId,
  initialData,
}: UpdateOpportunityForecastDialogProps) {
  const [formData, setFormData] = useState<UpdateOpportunityForecastFormData>({
    probability: initialData?.probability ?? 0,
    expectedAmount: initialData?.expectedAmount,
    expectedCloseDate: initialData?.expectedCloseDate,
  });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFormData({
      probability: initialData?.probability ?? 0,
      expectedAmount: initialData?.expectedAmount,
      expectedCloseDate: initialData?.expectedCloseDate,
    });
    setError(null);
    setFieldErrors({});
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const validation = UpdateOpportunityForecastSchema.safeParse(formData);
    if (!validation.success) {
      setFieldErrors(parseZodErrors(validation.error));
      setError("Please fix the validation errors");
      return;
    }

    setIsLoading(true);
    try {
      await crmOpportunitiesService.updateOpportunityForecast(opportunityId, validation.data);
      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update forecast");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Update Forecast</DialogTitle>
            <DialogDescription>Adjust probability and expected close values.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="probability">Probability (0-1) *</Label>
                <Input
                  id="probability"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={formData.probability}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      probability: Number.parseFloat(e.target.value) || 0,
                    }))
                  }
                  disabled={isLoading}
                  className={fieldErrors.probability ? "border-red-500" : ""}
                />
                {fieldErrors.probability && (
                  <p className="text-sm text-red-500">{fieldErrors.probability}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedAmount">Expected Amount</Label>
                <Input
                  id="expectedAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.expectedAmount ?? ""}
                  onChange={e => {
                    const raw = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      expectedAmount: raw === "" ? undefined : Number.parseFloat(raw),
                    }));
                  }}
                  disabled={isLoading}
                  className={fieldErrors.expectedAmount ? "border-red-500" : ""}
                />
                {fieldErrors.expectedAmount && (
                  <p className="text-sm text-red-500">{fieldErrors.expectedAmount}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expectedCloseDate">Expected Close Date</Label>
              <Input
                id="expectedCloseDate"
                type="date"
                value={formData.expectedCloseDate ?? ""}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    expectedCloseDate: e.target.value || undefined,
                  }))
                }
                disabled={isLoading}
                className={fieldErrors.expectedCloseDate ? "border-red-500" : ""}
              />
              {fieldErrors.expectedCloseDate && (
                <p className="text-sm text-red-500">{fieldErrors.expectedCloseDate}</p>
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
              {isLoading ? "Saving..." : "Save Forecast"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

