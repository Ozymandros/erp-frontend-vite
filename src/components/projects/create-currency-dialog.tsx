import type React from "react";
import { useState } from "react";
import { projectCurrenciesService } from "@/api/services/project-currencies.service";
import {
  CreateUpdateCurrencySchema,
  type CreateUpdateCurrencyFormData,
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

interface CreateCurrencyDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess: () => void;
}

export function CreateCurrencyDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateCurrencyDialogProps) {
  const [formData, setFormData] = useState<CreateUpdateCurrencyFormData>({
    code: "",
    description: "",
    symbol: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = CreateUpdateCurrencySchema.safeParse({
      ...formData,
      code: formData.code.toUpperCase(),
    });
    if (!validation.success) return;
    setIsLoading(true);
    try {
      await projectCurrenciesService.createCurrency({
        ...validation.data,
        symbol: validation.data.symbol || undefined,
      });
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
            <DialogTitle>Create currency</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div>
              <Label htmlFor="cur-code">Code</Label>
              <Input
                id="cur-code"
                maxLength={3}
                value={formData.code}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, code: e.target.value.toUpperCase() }))
                }
              />
            </div>
            <div>
              <Label htmlFor="cur-desc">Description</Label>
              <Input
                id="cur-desc"
                value={formData.description}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, description: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
