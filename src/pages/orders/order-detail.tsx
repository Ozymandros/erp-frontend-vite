"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { ordersService } from "@/api/services/orders.service";
import { customersService } from "@/api/services/customers.service";
import type { OrderDto, CustomerDto } from "@/types/api.types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Calendar, User, FileText, CreditCard } from "lucide-react";
import { formatDateTime, formatCurrency } from "@/lib/utils";
import { handleApiError, getErrorMessage } from "@/lib/error-handling";

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDto | null>(null);
  const [customer, setCustomer] = useState<CustomerDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await ordersService.getOrderById(id);
      setOrder(data);
      if (data.customerId) {
        try {
            const customerData = await customersService.getCustomerById(data.customerId);
            setCustomer(customerData);
        } catch (err) {
            console.warn("Failed to fetch customer", err);
        }
      }
    } catch (error: unknown) {
      const apiError = handleApiError(error);
      setError(getErrorMessage(apiError, "Failed to fetch order details"));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
    > = {
      Draft: { label: "Draft", variant: "secondary" },
      Pending: { label: "Pending", variant: "outline" },
      Confirmed: { label: "Confirmed", variant: "default" },
      Fulfilled: { label: "Fulfilled", variant: "default" },
      Cancelled: { label: "Cancelled", variant: "destructive" },
      Shipped: { label: "Shipped", variant: "default" },
      Delivered: { label: "Delivered", variant: "default" },
    };
    const statusInfo = statusMap[status] || { label: status, variant: "secondary" };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-8">
        <p className="text-red-500">{error}</p>
        <Button variant="outline" onClick={fetchOrder}>
          Try Again
        </Button>
        <Link to="/orders">
          <Button variant="ghost">Back to List</Button>
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-8">
        <p className="text-muted-foreground">Order not found</p>
        <Link to="/orders">
          <Button variant="ghost">Back to List</Button>
        </Link>
      </div>
    );
  }

  const customerName = customer?.name || order.customerId;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/orders">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">
          Order {order.orderNumber}
        </h1>
        {getStatusBadge(order.status)}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Order Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Order Date</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p>{formatDateTime(order.orderDate)}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <p className="font-semibold">{formatCurrency(order.totalAmount)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-lg">{customerName}</p>
            </div>
            {customer?.email && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p>{customer.email}</p>
              </div>
            )}
            {customer?.phoneNumber && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p>{customer.phoneNumber}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
          <CardDescription>
            {order.orderLines.length} items in this order
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.orderLines.map((line) => (
                  <TableRow key={line.productId}> {/* Assuming productId is unique per order for simplicity, otherwise update backend to return line IDs */}
                    <TableCell className="font-medium">
                      {line.productId}
                    </TableCell>
                    <TableCell className="text-right">{line.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(line.unitPrice)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(line.totalPrice)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
