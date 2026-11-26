import type React from "react";
import { useEffect, useState } from "react";
import { projectPostingService } from "@/api/services/project-posting.service";
import { warehousesService } from "@/api/services/warehouses.service";
import {
  CreateItemConsumptionSchema,
  type CreateItemConsumptionFormData,
} from "@/lib/validation/projects/posting.schemas";
import type { PlanningLineDto, WarehouseDto } from "@/types/api.types";
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

interface CreateItemConsumptionDialogProps {
  readonly projectId: string;
  readonly itemLines: PlanningLineDto[];
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess: () => void;
}

export function CreateItemConsumptionDialog({
  projectId,
  itemLines,
  open,
  onOpenChange,
  onSuccess,
}: CreateItemConsumptionDialogProps) {
  const [warehouses, setWarehouses] = useState<WarehouseDto[]>([]);
  const [warehouseId, setWarehouseId] = useState("");
  const [planningLineId, setPlanningLineId] = useState(itemLines[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      void warehousesService.getWarehouses().then((w) => {
        setWarehouses(w);
        setWarehouseId(w[0]?.id ?? "");
      });
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreateItemConsumptionFormData = {
      warehouseId,
      lines: [{ planningLineId, quantity }],
    };
    const validation = CreateItemConsumptionSchema.safeParse(payload);
    if (!validation.success) return;
    setIsLoading(true);
    try {
      await projectPostingService.createItemConsumption(
        projectId,
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
            <DialogTitle>Item consumption</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div>
              <Label htmlFor="wh">Warehouse</Label>
              <select
                id="wh"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="pl">Planning line</Label>
              <select
                id="pl"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={planningLineId}
                onChange={(e) => setPlanningLineId(e.target.value)}
              >
                {itemLines.map((l) => (
                  <option key={l.id} value={l.id}>
                    #{l.lineNo} {l.description}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="cqty">Quantity</Label>
              <Input
                id="cqty"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || itemLines.length === 0}>
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
