"use client";

import React, { useState } from "react";
import { stockOperationsService } from "@/api/services/stock-operations.service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, ArrowRight, Minus } from "lucide-react";
import { handleApiError, getErrorMessage } from "@/lib/error-handling";

export function StockOperationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Stock Operations</h1>
        <p className="text-muted-foreground mt-1">
          Perform stock operations: reserve, transfer, adjust
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stock Operations</CardTitle>
          <CardDescription>
            Manage stock reservations, transfers, and adjustments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="reserve" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="reserve">Reserve Stock</TabsTrigger>
              <TabsTrigger value="transfer">Transfer Stock</TabsTrigger>
              <TabsTrigger value="adjust">Adjust Stock</TabsTrigger>
              <TabsTrigger value="release">Release Reservation</TabsTrigger>
            </TabsList>

            <TabsContent value="reserve" className="mt-6">
              <ReserveStockForm />
            </TabsContent>

            <TabsContent value="transfer" className="mt-6">
              <TransferStockForm />
            </TabsContent>

            <TabsContent value="adjust" className="mt-6">
              <AdjustStockForm />
            </TabsContent>

            <TabsContent value="release" className="mt-6">
              <ReleaseReservationForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function ReserveStockForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const data = {
      productId: formData.get("productId") as string,
      warehouseId: formData.get("warehouseId") as string,
      quantity: parseInt(formData.get("quantity") as string),
      orderId: formData.get("orderId") as string,
      expiresAt: formData.get("expiresAt") as string || undefined,
    };

    try {
      await stockOperationsService.reserveStock(data);
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } catch (error: unknown) {
      const apiError = handleApiError(error);
      setError(getErrorMessage(apiError, "Failed to reserve stock"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Product ID</label>
          <input
            name="productId"
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Warehouse ID</label>
          <input
            name="warehouseId"
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Quantity</label>
          <input
            name="quantity"
            type="number"
            required
            min={1}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Order ID</label>
          <input
            name="orderId"
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Expires At (optional)</label>
          <input
            name="expiresAt"
            type="datetime-local"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && (
        <p className="text-green-500 text-sm">Stock reserved successfully!</p>
      )}

      <Button type="submit" disabled={isLoading}>
        <Package className="h-4 w-4 mr-2" />
        Reserve Stock
      </Button>
    </form>
  );
}

function TransferStockForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const data = {
      productId: formData.get("productId") as string,
      fromWarehouseId: formData.get("fromWarehouseId") as string,
      toWarehouseId: formData.get("toWarehouseId") as string,
      quantity: parseInt(formData.get("quantity") as string),
      reason: formData.get("reason") as string,
    };

    try {
      await stockOperationsService.transferStock(data);
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } catch (error: unknown) {
      const apiError = handleApiError(error);
      setError(getErrorMessage(apiError, "Failed to transfer stock"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Product ID</label>
          <input
            name="productId"
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Quantity</label>
          <input
            name="quantity"
            type="number"
            required
            min={1}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">From Warehouse</label>
          <input
            name="fromWarehouseId"
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">To Warehouse</label>
          <input
            name="toWarehouseId"
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-2 col-span-2">
          <label className="text-sm font-medium">Reason</label>
          <textarea
            name="reason"
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            rows={3}
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && (
        <p className="text-green-500 text-sm">Stock transferred successfully!</p>
      )}

      <Button type="submit" disabled={isLoading}>
        <ArrowRight className="h-4 w-4 mr-2" />
        Transfer Stock
      </Button>
    </form>
  );
}

function AdjustStockForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const data = {
      productId: formData.get("productId") as string,
      warehouseId: formData.get("warehouseId") as string,
      quantity: parseInt(formData.get("quantity") as string),
      reason: formData.get("reason") as string,
      adjustmentType: formData.get("adjustmentType") as "Increase" | "Decrease" | "Found" | "Lost" | "Damaged",
    };

    try {
      await stockOperationsService.adjustStock(data);
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } catch (error: unknown) {
      const apiError = handleApiError(error);
      setError(getErrorMessage(apiError, "Failed to adjust stock"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Product ID</label>
          <input
            name="productId"
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Warehouse ID</label>
          <input
            name="warehouseId"
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Quantity</label>
          <input
            name="quantity"
            type="number"
            required
            min={1}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Adjustment Type</label>
          <select
            name="adjustmentType"
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Select type...</option>
            <option value="Increase">Increase</option>
            <option value="Decrease">Decrease</option>
            <option value="Found">Found</option>
            <option value="Lost">Lost</option>
            <option value="Damaged">Damaged</option>
          </select>
        </div>
        <div className="space-y-2 col-span-2">
          <label className="text-sm font-medium">Reason</label>
          <textarea
            name="reason"
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            rows={3}
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && (
        <p className="text-green-500 text-sm">Stock adjusted successfully!</p>
      )}

      <Button type="submit" disabled={isLoading}>
        <Minus className="h-4 w-4 mr-2" />
        Adjust Stock
      </Button>
    </form>
  );
}

function ReleaseReservationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const reservationId = formData.get("reservationId") as string;

    try {
      await stockOperationsService.releaseReservation(reservationId);
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } catch (error: unknown) {
      const apiError = handleApiError(error);
      setError(getErrorMessage(apiError, "Failed to release reservation"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Reservation ID</label>
        <input
          name="reservationId"
          required
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="Enter reservation ID to release"
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && (
        <p className="text-green-500 text-sm">Reservation released successfully!</p>
      )}

      <Button type="submit" disabled={isLoading} variant="destructive">
        <Minus className="h-4 w-4 mr-2" />
        Release Reservation
      </Button>
    </form>
  );
}
