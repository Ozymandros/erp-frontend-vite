"use client";

import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { salesOrdersService } from "@/api/services/sales-orders.service";
import { customersService } from "@/api/services/customers.service";
import type {
  SalesOrderDto,
  PaginatedResponse,
  QuerySpec,
  CustomerDto,
} from "@/types/api.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Plus, Eye, Search, ArrowUpDown } from "lucide-react";
import { formatDateTime, formatCurrency } from "@/lib/utils";
import { handleApiError, isForbiddenError, getForbiddenMessage, getErrorMessage } from "@/lib/error-handling";

export function SalesOrdersListPage() {
  const [salesOrders, setSalesOrders] = useState<
    PaginatedResponse<SalesOrderDto> | null
  >(null);
  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [querySpec, setQuerySpec] = useState<QuerySpec>({
    page: 1,
    pageSize: 20,
    searchTerm: "",
    searchFields: "orderNumber",
    sortBy: "orderDate",
    sortDesc: true,
  });

  const fetchCustomers = async () => {
    try {
      const data = await customersService.getCustomers();
      setCustomers(data);
    } catch (error: unknown) {
      // Handle 403 Forbidden (permission denied) gracefully - don't show error for customers dropdown
      const apiError = handleApiError(error);
      if (!isForbiddenError(apiError)) {
        console.error("Failed to fetch customers", apiError);
      }
      // If 403, just leave customers list empty - the user doesn't have permission to view it
    }
  };

  const fetchSalesOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await salesOrdersService.searchSalesOrders(querySpec);
      setSalesOrders(data);
    } catch (error: unknown) {
      const apiError = handleApiError(error);
      // Handle 403 Forbidden (permission denied) with user-friendly message
      if (isForbiddenError(apiError)) {
        setError(getForbiddenMessage("sales orders"));
      } else {
        setError(getErrorMessage(apiError, "Failed to fetch sales orders"));
      }
    } finally {
      setIsLoading(false);
    }
  }, [querySpec]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    fetchSalesOrders();
  }, [fetchSalesOrders]);

  const handleSearch = (value: string) => {
    setQuerySpec((prev) => ({ ...prev, searchTerm: value, page: 1 }));
  };

  const handleSort = (field: string) => {
    setQuerySpec((prev) => ({
      ...prev,
      sortBy: field,
      sortDesc: prev.sortBy === field ? !prev.sortDesc : false,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setQuerySpec((prev) => ({ ...prev, page: newPage }));
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer?.name || customerId;
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
    > = {
      Draft: { label: "Draft", variant: "secondary" },
      Quote: { label: "Quote", variant: "outline" },
      Confirmed: { label: "Confirmed", variant: "default" },
      Processing: { label: "Processing", variant: "default" },
      Shipped: { label: "Shipped", variant: "default" },
      Delivered: { label: "Delivered", variant: "default" },
      Cancelled: { label: "Cancelled", variant: "destructive" },
    };
    const statusInfo = statusMap[status] || { label: status, variant: "secondary" };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const totalPages = salesOrders
    ? Math.ceil(salesOrders.total / (querySpec.pageSize ?? 20))
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sales Orders</h1>
          <p className="text-muted-foreground mt-1">
            Manage sales orders and quotes
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Order
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Sales Orders</CardTitle>
          <CardDescription>
            {salesOrders ? `${salesOrders.total} total orders` : "Loading..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order number, customer..."
                className="pl-10"
                value={querySpec.searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-center text-red-500 py-8">
              <p>{error}</p>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading sales orders...</p>
            </div>
          )}

          {!isLoading && salesOrders && salesOrders.items.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No sales orders found</p>
            </div>
          )}

          {!isLoading && salesOrders && salesOrders.items.length > 0 && (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <button
                          className="flex items-center hover:text-foreground"
                          onClick={() => handleSort("orderNumber")}
                        >
                          Order Number
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </button>
                      </TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>
                        <button
                          className="flex items-center hover:text-foreground"
                          onClick={() => handleSort("status")}
                        >
                          Status
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          className="flex items-center hover:text-foreground"
                          onClick={() => handleSort("orderDate")}
                        >
                          Date
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </button>
                      </TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>
                        <button
                          className="flex items-center hover:text-foreground"
                          onClick={() => handleSort("totalAmount")}
                        >
                          Total Amount
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </button>
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesOrders.items.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell>{getCustomerName(order.customerId)}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>{formatDateTime(order.orderDate)}</TableCell>
                        <TableCell>{order.orderLines.length} items</TableCell>
                        <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                        <TableCell className="text-right">
                          <Link to={`/sales/orders/${order.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {querySpec.page} of {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange((querySpec.page ?? 1) - 1)}
                      disabled={!salesOrders.hasPreviousPage}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange((querySpec.page ?? 1) + 1)}
                      disabled={!salesOrders.hasNextPage}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
