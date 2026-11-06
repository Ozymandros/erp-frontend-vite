import type React from "react";
import { useState } from "react";
import { projectCurrenciesService } from "@/api/services/project-currencies.service";
import {
  CreateExchangeRateSchema,
  type CreateExchangeRateFormData,
} from "@/lib/validation/projects/currency.schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CreateExchangeRateDialogProps {
  readonly currencyCode: string;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess: () => void;
}

export function CreateExchangeRateDialog({
  currencyCode,
  open,
  onOpenChange,
  onSuccess,
}: CreateExchangeRateDialogProps) {
  const [formData, setFormData] = useState<CreateExchangeRateFormData>({
    startingDate: new Date().toISOString().slice(0, 10),
    rateToLocal: 1,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = CreateExchangeRateSchema.safeParse(formData);
    if (!validation.success) return;
    setIsLoading(true);
    try {
      await projectCurrenciesService.createExchangeRate(
        currencyCode,
        validation.data
      );
      onSuccess();
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add exchange rate — {currencyCode}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div>
              <Label htmlFor="rate-date">Starting date</Label>
              <Input
                id="rate-date"
                type="date"
                value={formData.startingDate.slice(0, 10)}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, startingDate: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="rate-value">Rate to local</Label>
              <Input
                id="rate-value"
                type="number"
                step="0.0001"
                value={formData.rateToLocal}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    rateToLocal: Number(e.target.value),
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              Add
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
