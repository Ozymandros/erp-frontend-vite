"use client";

import { useEffect, useMemo, useState } from "react";
import type React from "react";
import { crmActivitiesService } from "@/api/services/crm-activities.service";
import { parseZodErrors } from "@/lib/validation";
import {
  CreateActivitySchema,
  type CreateActivityFormData,
} from "@/lib/validation/crm/activity.schemas";
import { getDefaultDateTimeLocal } from "@/lib/utils";

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

interface CreateActivityDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess: () => void;
}

export function CreateActivityDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateActivityDialogProps) {
  const initialFormData = useMemo(
    (): CreateActivityFormData => ({
      subject: "",
      type: "",
      dueAt: getDefaultDateTimeLocal(),
      assignedToUsername: "",
      leadId: undefined,
      opportunityId: undefined,
      customerId: undefined,
    }),
    [],
  );

  const [formData, setFormData] = useState<CreateActivityFormData>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFormData({
      ...initialFormData,
      dueAt: getDefaultDateTimeLocal(),
    });
    setError(null);
    setFieldErrors({});
  }, [open, initialFormData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const validation = CreateActivitySchema.safeParse(formData);
    if (!validation.success) {
      setFieldErrors(parseZodErrors(validation.error));
      setError("Please fix the validation errors");
      return;
    }

    setIsLoading(true);
    try {
      await crmActivitiesService.createActivity(validation.data);
      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create activity");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Activity</DialogTitle>
            <DialogDescription>Schedule or log a CRM activity.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={e => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  disabled={isLoading}
                  className={fieldErrors.subject ? "border-red-500" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Input
                  id="type"
                  value={formData.type}
                  onChange={e => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  disabled={isLoading}
                  className={fieldErrors.type ? "border-red-500" : ""}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueAt">Due At *</Label>
                <Input
                  id="dueAt"
                  type="datetime-local"
                  value={formData.dueAt}
                  onChange={e => setFormData(prev => ({ ...prev, dueAt: e.target.value }))}
                  disabled={isLoading}
                  className={fieldErrors.dueAt ? "border-red-500" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignedToUsername">Assigned To *</Label>
                <Input
                  id="assignedToUsername"
                  value={formData.assignedToUsername}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, assignedToUsername: e.target.value }))
                  }
                  disabled={isLoading}
                  className={fieldErrors.assignedToUsername ? "border-red-500" : ""}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="leadId">Lead ID</Label>
                <Input
                  id="leadId"
                  value={formData.leadId ?? ""}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      leadId: e.target.value ? e.target.value : undefined,
                    }))
                  }
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="opportunityId">Opportunity ID</Label>
                <Input
                  id="opportunityId"
                  value={formData.opportunityId ?? ""}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      opportunityId: e.target.value ? e.target.value : undefined,
                    }))
                  }
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerId">Customer ID</Label>
                <Input
                  id="customerId"
                  value={formData.customerId ?? ""}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      customerId: e.target.value ? e.target.value : undefined,
                    }))
                  }
                  disabled={isLoading}
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Activity"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

