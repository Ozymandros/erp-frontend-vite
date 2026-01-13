"use client";

import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { purchaseOrdersService } from "@/api/services/purchase-orders.service";
import { suppliersService } from "@/api/services/suppliers.service";
import type {
  PurchaseOrderDto,
  PaginatedResponse,
  QuerySpec,
  SupplierDto,
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
import { formatDateTime } from "@/lib/utils";
import { handleApiError, isForbiddenError, getForbiddenMessage, getErrorMessage } from "@/lib/error-handling";

export function PurchaseOrdersListPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<
    PaginatedResponse<PurchaseOrderDto> | null
  >(null);
  const [suppliers, setSuppliers] = useState<SupplierDto[]>([]);
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

  const fetchSuppliers = async () => {
    try {
      const data = await suppliersService.getSuppliers();
      setSuppliers(data);
    } catch (error: unknown) {
      // Handle 403 Forbidden (permission denied) gracefully - don't show error for suppliers dropdown
      const apiError = handleApiError(error);
      if (!isForbiddenError(apiError)) {
        console.error("Failed to fetch suppliers", apiError);
      }
      // If 403, just leave suppliers list empty - the user doesn't have permission to view it
    }
  };

  const fetchPurchaseOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await purchaseOrdersService.searchPurchaseOrders(querySpec);
      setPurchaseOrders(data);
    } catch (error: unknown) {
      const apiError = handleApiError(error);
      // Handle 403 Forbidden (permission denied) with user-friendly message
      if (isForbiddenError(apiError)) {
        setError(getForbiddenMessage("purchase orders"));
      } else {
        setError(getErrorMessage(apiError, "Failed to fetch purchase orders"));
      }
    } finally {
      setIsLoading(false);
    }
  }, [querySpec]);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    fetchPurchaseOrders();
  }, [fetchPurchaseOrders]);

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

  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    return supplier?.name || supplierId;
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
    > = {
      Draft: { label: "Draft", variant: "secondary" },
      Pending: { label: "Pending", variant: "outline" },
      Approved: { label: "Approved", variant: "default" },
      Ordered: { label: "Ordered", variant: "default" },
      PartiallyReceived: { label: "Partially Received", variant: "default" },
      Received: { label: "Received", variant: "default" },
      Cancelled: { label: "Cancelled", variant: "destructive" },
    };
    const statusInfo = statusMap[status] || { label: status, variant: "secondary" };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const totalPages = purchaseOrders
    ? Math.ceil(purchaseOrders.total / (querySpec.pageSize ?? 20))
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Purchase Orders</h1>
          <p className="text-muted-foreground mt-1">
            Manage purchase orders from suppliers
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Purchase Order
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Purchase Orders</CardTitle>
          <CardDescription>
            {purchaseOrders ? `${purchaseOrders.total} total orders` : "Loading..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order number, supplier..."
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
              <p className="text-muted-foreground">Loading purchase orders...</p>
            </div>
          )}

          {!isLoading && purchaseOrders && purchaseOrders.items.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No purchase orders found</p>
            </div>
          )}

          {!isLoading && purchaseOrders && purchaseOrders.items.length > 0 && (
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
                      <TableHead>Supplier</TableHead>
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
                          Order Date
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </button>
                      </TableHead>
                      <TableHead>Expected Delivery</TableHead>
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
                    {purchaseOrders.items.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell>{getSupplierName(order.supplierId)}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>{formatDateTime(order.orderDate)}</TableCell>
                        <TableCell>
                          {order.expectedDeliveryDate
                            ? formatDateTime(order.expectedDeliveryDate)
                            : "-"}
                        </TableCell>
                        <TableCell>{order.orderLines.length} items</TableCell>
                        <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Link to={`/purchasing/orders/${order.id}`}>
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
                      disabled={!purchaseOrders.hasPreviousPage}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange((querySpec.page ?? 1) + 1)}
                      disabled={!purchaseOrders.hasNextPage}
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
