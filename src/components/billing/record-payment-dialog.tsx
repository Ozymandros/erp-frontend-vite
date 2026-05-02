"use client";

import { useEffect, useState, type FormEvent } from "react";
import { invoicesService } from "@/api/services/invoices.service";
import {
  RecordPaymentSchema,
  type RecordPaymentFormData,
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

interface RecordPaymentDialogProps {
  readonly open: boolean;
  readonly invoiceId: string;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess: () => void;
}

export function RecordPaymentDialog({
  open,
  invoiceId,
  onOpenChange,
  onSuccess,
}: RecordPaymentDialogProps) {
  const [formData, setFormData] = useState<RecordPaymentFormData>({
    amount: 0,
    method: "",
    paidAt: new Date().toISOString(),
    externalPaymentId: undefined,
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFormData({
      amount: 0,
      method: "",
      paidAt: new Date().toISOString(),
      externalPaymentId: undefined,
    });
    setFieldErrors({});
    setError(null);
  }, [open]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    const validation = RecordPaymentSchema.safeParse(formData);
    if (!validation.success) {
      setFieldErrors(parseZodErrors(validation.error));
      setError("Please fix payment data.");
      return;
    }

    setIsLoading(true);
    try {
      await invoicesService.recordPayment(invoiceId, validation.data);
      onSuccess();
      onOpenChange(false);
    } catch (submitError: unknown) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to record payment."
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
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Register an inbound payment for this invoice.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min={0}
                value={formData.amount}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    amount: Number(event.target.value),
                  }))
                }
              />
              {fieldErrors.amount && (
                <p className="text-sm text-red-500">{fieldErrors.amount}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="method">Method</Label>
              <Input
                id="method"
                value={formData.method}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    method: event.target.value,
                  }))
                }
              />
              {fieldErrors.method && (
                <p className="text-sm text-red-500">{fieldErrors.method}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="paidAt">Paid At (ISO)</Label>
              <Input
                id="paidAt"
                value={formData.paidAt}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    paidAt: event.target.value,
                  }))
                }
              />
              {fieldErrors.paidAt && (
                <p className="text-sm text-red-500">{fieldErrors.paidAt}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
