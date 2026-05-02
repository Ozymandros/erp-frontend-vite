"use client";

import { useEffect, useState, type FormEvent } from "react";
import { invoicesService } from "@/api/services/invoices.service";
import {
  CancelInvoiceSchema,
  type CancelInvoiceFormData,
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CancelInvoiceDialogProps {
  readonly open: boolean;
  readonly invoiceId: string;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess: () => void;
}

export function CancelInvoiceDialog({
  open,
  invoiceId,
  onOpenChange,
  onSuccess,
}: CancelInvoiceDialogProps) {
  const [formData, setFormData] = useState<CancelInvoiceFormData>({ reason: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFormData({ reason: "" });
    setFieldErrors({});
    setError(null);
  }, [open, invoiceId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    const validation = CancelInvoiceSchema.safeParse(formData);
    if (!validation.success) {
      setFieldErrors(parseZodErrors(validation.error));
      setError("Please provide a cancellation reason.");
      return;
    }

    setIsLoading(true);
    try {
      await invoicesService.cancelInvoice(invoiceId, validation.data);
      onSuccess();
      onOpenChange(false);
      setFormData({ reason: "" });
    } catch (submitError: unknown) {
      setError(
        submitError instanceof Error ? submitError.message : "Failed to cancel invoice."
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
            <DialogTitle>Cancel Invoice</DialogTitle>
            <DialogDescription>
              Cancelling an invoice is a billing event. Add a clear reason.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    reason: event.target.value,
                  }))
                }
              />
              {fieldErrors.reason && (
                <p className="text-sm text-red-500">{fieldErrors.reason}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button type="submit" variant="destructive" disabled={isLoading}>
              {isLoading ? "Cancelling..." : "Cancel Invoice"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
