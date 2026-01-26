"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { productsService } from "@/api/services/products.service";
import { warehousesService } from "@/api/services/warehouses.service";
import { ordersService } from "@/api/services/orders.service";
import type { OrderDto } from "@/types/api.types";

import { ReserveStockForm } from "@/components/inventory/stock-ops/reserve-stock-form";
import { TransferStockForm } from "@/components/inventory/stock-ops/transfer-stock-form";
import { AdjustStockForm } from "@/components/inventory/stock-ops/adjust-stock-form";
import { ReleaseReservationForm } from "@/components/inventory/stock-ops/release-reservation-form";

export function StockOperationsPage() {
  const [products, setProducts] = useState<Array<{ id: string; name: string; sku: string }>>([]);
  const [warehouses, setWarehouses] = useState<Array<{ id: string; name: string }>>([]);
  const [orders, setOrders] = useState<OrderDto[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, warehousesData, ordersData] = await Promise.all([
          productsService.getProducts(),
          warehousesService.getWarehouses(),
          ordersService.getOrders(),
        ]);
        setProducts(productsData);
        setWarehouses(warehousesData);
        setOrders(ordersData);
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    };
    fetchData();
  }, []);

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
              <ReserveStockForm products={products} warehouses={warehouses} orders={orders} />
            </TabsContent>

            <TabsContent value="transfer" className="mt-6">
              <TransferStockForm products={products} warehouses={warehouses} />
            </TabsContent>

            <TabsContent value="adjust" className="mt-6">
              <AdjustStockForm products={products} warehouses={warehouses} />
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
