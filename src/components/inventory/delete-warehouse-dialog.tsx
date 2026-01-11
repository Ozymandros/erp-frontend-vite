"use client";

import { useState } from "react";
import { warehousesService } from "@/api/services/warehouses.service";
import type { WarehouseDto } from "@/types/api.types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DeleteWarehouseDialogProps {
  warehouse: WarehouseDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeleteWarehouseDialog({
  warehouse,
  open,
  onOpenChange,
  onSuccess,
}: DeleteWarehouseDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!warehouse) return;

    setIsLoading(true);
    setError(null);

    try {
      await warehousesService.deleteWarehouse(warehouse.id);
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Failed to delete warehouse");
    } finally {
      setIsLoading(false);
    }
  };

  if (!warehouse) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Delete Warehouse</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this warehouse? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <p>
              <strong>Name:</strong> {warehouse.name}
            </p>
            {warehouse.location && (
              <p>
                <strong>Location:</strong> {warehouse.location}
              </p>
            )}
            {warehouse.city && (
              <p>
                <strong>City:</strong> {warehouse.city}
              </p>
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
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete Warehouse"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
