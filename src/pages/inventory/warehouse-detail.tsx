"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { warehousesService } from "@/api/services/warehouses.service";
import type { WarehouseDto } from "@/types/api.types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { EditWarehouseDialog } from "@/components/inventory/edit-warehouse-dialog";
import { DeleteWarehouseDialog } from "@/components/inventory/delete-warehouse-dialog";
import { formatDateTime } from "@/lib/utils";

export function WarehouseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [warehouse, setWarehouse] = useState<WarehouseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const fetchWarehouse = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await warehousesService.getWarehouseById(id);
      setWarehouse(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch warehouse");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchWarehouse();
  }, [fetchWarehouse]);

  const handleWarehouseUpdated = () => {
    setIsEditDialogOpen(false);
    fetchWarehouse();
  };

  const handleWarehouseDeleted = () => {
    navigate("/inventory/warehouses");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Link to="/inventory/warehouses">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Warehouses
          </Button>
        </Link>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading warehouse...</p>
        </div>
      </div>
    );
  }

  if (error || !warehouse) {
    return (
      <div className="space-y-6">
        <Link to="/inventory/warehouses">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Warehouses
          </Button>
        </Link>
        <div className="text-center text-red-500 py-8">
          <p>{error || "Warehouse not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/inventory/warehouses">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Warehouses
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Warehouse Information</CardTitle>
            <CardDescription>Basic warehouse details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Name
              </label>
              <p className="text-lg font-semibold">{warehouse.name}</p>
            </div>
            {warehouse.location && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Location
                </label>
                <p className="text-base">{warehouse.location}</p>
              </div>
            )}

          </CardContent>
        </Card>



        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Audit Information</CardTitle>
            <CardDescription>Creation and modification history</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Created At
              </label>
              <p className="text-base">{formatDateTime(warehouse.createdAt)}</p>
              {warehouse.createdBy && (
                <p className="text-sm text-muted-foreground">
                  by {warehouse.createdBy}
                </p>
              )}
            </div>
            {warehouse.updatedAt && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Last Updated
                </label>
                <p className="text-base">{formatDateTime(warehouse.updatedAt)}</p>
                {warehouse.updatedBy && (
                  <p className="text-sm text-muted-foreground">
                    by {warehouse.updatedBy}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <EditWarehouseDialog
        warehouse={warehouse}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={handleWarehouseUpdated}
      />

      <DeleteWarehouseDialog
        warehouse={warehouse}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onSuccess={handleWarehouseDeleted}
      />
    </div>
  );
}
