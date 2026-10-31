import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { salesOrdersService } from "@/api/services/sales-orders.service";
import { invoicesService } from "@/api/services/invoices.service";
import type { InvoiceDto, SalesOrderDto } from "@/types/api.types";
import { SalesOrderStatus } from "@/types/api.types";
import { CreateSalesReturnDialog } from "@/components/sales/create-sales-return-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  getStatusBadge,
  SALES_ORDER_STATUS_MAP,
} from "@/lib/order-columns.utils";
import { useModulePermissions } from "@/hooks/use-permissions";

export function SalesOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<SalesOrderDto | null>(null);
  const [linkedInvoices, setLinkedInvoices] = useState<InvoiceDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const { canCreate, canUpdate } = useModulePermissions("sales");

  const fetchOrder = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);
    try {
      const [orderData, invoicesData] = await Promise.all([
        salesOrdersService.getSalesOrderById(id),
        invoicesService.getInvoicesByOrder(id),
      ]);
      setOrder(orderData);
      setLinkedInvoices(invoicesData);
    } catch (loadError: unknown) {
      const apiError = handleApiError(loadError);
      setError(getErrorMessage(apiError, "Failed to fetch sales order details"));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchOrder();
  }, [fetchOrder]);

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
        <Button variant="outline" onClick={() => void fetchOrder()}>
          Try Again
        </Button>
        <Link to="/sales/orders">
          <Button variant="ghost">Back to List</Button>
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-8">
        <p className="text-muted-foreground">Order not found</p>
        <Link to="/sales/orders">
          <Button variant="ghost">Back to List</Button>
        </Link>
      </div>
    );
  }

  const customerName = order.customer?.name || "Unknown Customer";
  const canCreateReturn =
    (canCreate || canUpdate) &&
    !order.returnOrderId &&
    (order.status === SalesOrderStatus.Shipped ||
      order.status === SalesOrderStatus.Invoiced);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/sales/orders">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">
          Sales Order {order.orderNumber}
        </h1>
        {getStatusBadge(order.status, SALES_ORDER_STATUS_MAP)}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => setIsReturnOpen(true)}
          disabled={!canCreateReturn}
        >
          Create Return
        </Button>
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
              {order.isQuote && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Quote Expiry</p>
                  <p>{order.quoteExpiryDate ? formatDateTime(order.quoteExpiryDate) : "-"}</p>
                </div>
              )}
              {order.returnOrderId ? (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Return Order</p>
                  <Link
                    to={`/sales/orders/${order.returnOrderId}`}
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    {order.returnOrderId}
                  </Link>
                </div>
              ) : null}
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
            {order.customer?.email && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p>{order.customer.email}</p>
              </div>
            )}
            {order.customer?.phoneNumber && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p>{order.customer.phoneNumber}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Linked Invoices</CardTitle>
          <CardDescription>
            {linkedInvoices.length} invoice(s) linked to this order
          </CardDescription>
        </CardHeader>
        <CardContent>
          {linkedInvoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">No linked invoices yet.</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {linkedInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <Link
                          to={`/billing/invoices/${invoice.id}`}
                          className="font-medium text-primary underline-offset-4 hover:underline"
                        >
                          {invoice.invoiceNumber}
                        </Link>
                      </TableCell>
                      <TableCell>{invoice.status}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(invoice.totalGross)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
          <CardDescription>
            {order.lines?.length || 0} items in this order
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
                {order.lines?.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell className="font-medium">{line.productId}</TableCell>
                    <TableCell className="text-right">{line.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(line.unitPrice)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(line.lineTotal)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <CreateSalesReturnDialog
        open={isReturnOpen}
        order={order}
        onOpenChange={setIsReturnOpen}
        onSuccess={() => void fetchOrder()}
      />
    </div>
  );
}
