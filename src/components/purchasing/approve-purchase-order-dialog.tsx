import { useEffect, useState, type FormEvent } from "react";
import { purchaseOrdersService } from "@/api/services/purchase-orders.service";
import {
  ApprovePurchaseOrderNotesSchema,
  type ApprovePurchaseOrderNotesFormData,
} from "@/lib/validation/purchasing/purchase-order.schemas";
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

interface ApprovePurchaseOrderDialogProps {
  readonly open: boolean;
  readonly purchaseOrderId: string;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess: () => void;
}

export function ApprovePurchaseOrderDialog({
  open,
  purchaseOrderId,
  onOpenChange,
  onSuccess,
}: ApprovePurchaseOrderDialogProps) {
  const [formData, setFormData] = useState<ApprovePurchaseOrderNotesFormData>({
    notes: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFormData({ notes: "" });
    setFieldErrors({});
    setError(null);
  }, [open]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    const validation = ApprovePurchaseOrderNotesSchema.safeParse(formData);
    if (!validation.success) {
      setFieldErrors(parseZodErrors(validation.error));
      setError("Please fix the validation errors.");
      return;
    }

    setIsLoading(true);
    try {
      await purchaseOrdersService.approvePurchaseOrder(purchaseOrderId, {
        notes: validation.data.notes,
      });
      onSuccess();
      onOpenChange(false);
    } catch (submitError: unknown) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to approve purchase order."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Approve Purchase Order</DialogTitle>
            <DialogDescription>
              Confirm approval for this purchase order.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes ?? ""}
                onChange={(event) =>
                  setFormData({ notes: event.target.value })
                }
              />
              {fieldErrors.notes ? (
                <p className="text-sm text-destructive">{fieldErrors.notes}</p>
              ) : null}
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
              {isLoading ? "Approving..." : "Approve"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
