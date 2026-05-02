"use client";

import { useEffect, useState } from "react";
import type React from "react";
import { parseZodErrors } from "@/lib/validation";
import {
  UpdateAccountOwnerSchema,
  type UpdateAccountOwnerFormData,
} from "@/lib/validation/crm/account.schemas";
import { crmAccountsService } from "@/api/services/crm-accounts.service";

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

interface UpdateAccountOwnerDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess: () => void;
  readonly accountId: string;
  readonly initialOwnerUsername?: string;
}

export function UpdateAccountOwnerDialog({
  open,
  onOpenChange,
  onSuccess,
  accountId,
  initialOwnerUsername,
}: UpdateAccountOwnerDialogProps) {
  const [formData, setFormData] = useState<UpdateAccountOwnerFormData>({
    ownerUsername: initialOwnerUsername ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFormData({ ownerUsername: initialOwnerUsername ?? "" });
    setError(null);
    setFieldErrors({});
  }, [open, initialOwnerUsername]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const validation = UpdateAccountOwnerSchema.safeParse(formData);
    if (!validation.success) {
      setFieldErrors(parseZodErrors(validation.error));
      setError("Please fix the validation errors");
      return;
    }

    setIsLoading(true);
    try {
      await crmAccountsService.updateAccountOwner(accountId, validation.data);
      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update account owner");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Change Account Owner</DialogTitle>
            <DialogDescription>Update the account owner username.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="ownerUsername">Owner Username *</Label>
              <Input
                id="ownerUsername"
                value={formData.ownerUsername}
                onChange={e =>
                  setFormData(prev => ({ ...prev, ownerUsername: e.target.value }))
                }
                disabled={isLoading}
                className={fieldErrors.ownerUsername ? "border-red-500" : ""}
              />
              {fieldErrors.ownerUsername && (
                <p className="text-sm text-red-500">{fieldErrors.ownerUsername}</p>
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
              {isLoading ? "Saving..." : "Save Owner"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

