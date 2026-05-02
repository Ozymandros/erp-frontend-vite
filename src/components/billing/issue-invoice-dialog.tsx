"use client";

import { useEffect, useState, type FormEvent } from "react";
import { invoicesService } from "@/api/services/invoices.service";
import {
  IssueInvoiceSchema,
  type IssueInvoiceFormData,
} from "@/lib/validation/billing/invoice.schemas";
import { parseZodErrors } from "@/lib/validation/zod-utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface IssueInvoiceDialogProps {
  readonly open: boolean;
  readonly invoiceId: string;
  readonly currentInvoiceNumber: string;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess: () => void;
}

export function IssueInvoiceDialog({
  open,
  invoiceId,
  currentInvoiceNumber,
  onOpenChange,
  onSuccess,
}: IssueInvoiceDialogProps) {
  const [formData, setFormData] = useState<IssueInvoiceFormData>({
    invoiceNumber: currentInvoiceNumber,
    issueDate: new Date().toISOString(),
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFormData({
      invoiceNumber: currentInvoiceNumber,
      issueDate: new Date().toISOString(),
    });
    setFieldErrors({});
    setError(null);
  }, [open, currentInvoiceNumber]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    const validation = IssueInvoiceSchema.safeParse(formData);
    if (!validation.success) {
      setFieldErrors(parseZodErrors(validation.error));
      setError("Please fix the validation errors.");
      return;
    }

    setIsLoading(true);
    try {
      await invoicesService.issueInvoice(invoiceId, validation.data);
      onSuccess();
      onOpenChange(false);
    } catch (submitError: unknown) {
      setError(
        submitError instanceof Error ? submitError.message : "Failed to issue invoice."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Issue Invoice</DialogTitle>
            <DialogDescription>
              Issue this draft invoice with a final invoice number and issue date.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input
                id="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    invoiceNumber: event.target.value,
                  }))
                }
              />
              {fieldErrors.invoiceNumber && (
                <p className="text-sm text-red-500">{fieldErrors.invoiceNumber}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="issueDate">Issue Date (ISO)</Label>
              <Input
                id="issueDate"
                value={formData.issueDate}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    issueDate: event.target.value,
                  }))
                }
              />
              {fieldErrors.issueDate && (
                <p className="text-sm text-red-500">{fieldErrors.issueDate}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Issuing..." : "Issue"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
