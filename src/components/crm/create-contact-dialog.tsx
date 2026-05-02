"use client";

import { useEffect, useMemo, useState } from "react";
import type React from "react";
import { crmAccountsService } from "@/api/services/crm-accounts.service";
import { crmContactsService } from "@/api/services/crm-contacts.service";
import { parseZodErrors } from "@/lib/validation";
import {
  CreateContactSchema,
  type CreateContactFormData,
} from "@/lib/validation/crm/contact.schemas";
import type { AccountDto } from "@/types/api.types";

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

interface CreateContactDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess: () => void;
}

export function CreateContactDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateContactDialogProps) {
  const initialFormData = useMemo(
    (): CreateContactFormData => ({
      accountId: "",
      fullName: "",
      email: undefined,
      phone: undefined,
      title: undefined,
      isPrimary: false,
    }),
    [],
  );

  const [formData, setFormData] = useState<CreateContactFormData>(initialFormData);
  const [accounts, setAccounts] = useState<AccountDto[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    setFormData(initialFormData);
    setError(null);
    setFieldErrors({});

    const loadAccounts = async () => {
      setLoadingAccounts(true);
      try {
        const data = await crmAccountsService.searchAccounts({
          page: 1,
          pageSize: 50,
          searchTerm: "",
          sortBy: "createdAt",
          sortDesc: true,
        });
        setAccounts(data.items);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load accounts");
      } finally {
        setLoadingAccounts(false);
      }
    };

    void loadAccounts();
  }, [open, initialFormData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const validation = CreateContactSchema.safeParse(formData);
    if (!validation.success) {
      setFieldErrors(parseZodErrors(validation.error));
      setError("Please fix the validation errors");
      return;
    }

    setIsLoading(true);
    try {
      await crmContactsService.createContact(validation.data);
      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create contact");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Contact</DialogTitle>
            <DialogDescription>Add a contact to an account.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="accountId">Account *</Label>
              <select
                id="accountId"
                value={formData.accountId}
                onChange={e =>
                  setFormData(prev => ({ ...prev, accountId: e.target.value }))
                }
                disabled={isLoading || loadingAccounts}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value="">Select account...</option>
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
              {fieldErrors.accountId && (
                <p className="text-sm text-red-500">{fieldErrors.accountId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={e =>
                  setFormData(prev => ({ ...prev, fullName: e.target.value }))
                }
                disabled={isLoading}
                className={fieldErrors.fullName ? "border-red-500" : ""}
              />
              {fieldErrors.fullName && (
                <p className="text-sm text-red-500">{fieldErrors.fullName}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email ?? ""}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, email: e.target.value || undefined }))
                  }
                  disabled={isLoading}
                  className={fieldErrors.email ? "border-red-500" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone ?? ""}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, phone: e.target.value || undefined }))
                  }
                  disabled={isLoading}
                  className={fieldErrors.phone ? "border-red-500" : ""}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title ?? ""}
                onChange={e =>
                  setFormData(prev => ({ ...prev, title: e.target.value || undefined }))
                }
                disabled={isLoading}
                className={fieldErrors.title ? "border-red-500" : ""}
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                id="isPrimary"
                type="checkbox"
                checked={!!formData.isPrimary}
                onChange={e =>
                  setFormData(prev => ({ ...prev, isPrimary: e.target.checked }))
                }
                disabled={isLoading}
              />
              <Label htmlFor="isPrimary">Primary contact</Label>
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
            <Button type="submit" disabled={isLoading || loadingAccounts}>
              {isLoading ? "Creating..." : "Create Contact"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

