import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { purchaseOrdersService } from "@/api/services/purchase-orders.service";
import { supplierInvoicesService } from "@/api/services/supplier-invoices.service";
import type { PurchaseOrderDto, SupplierInvoiceDto } from "@/types/api.types";
import {
  PurchaseOrderMatchStatus,
  PurchaseOrderStatus,
} from "@/types/api.types";
import { ApprovePurchaseOrderDialog } from "@/components/purchasing/approve-purchase-order-dialog";
import { ReceivePurchaseOrderDialog } from "@/components/purchasing/receive-purchase-order-dialog";
import { CreateSupplierInvoiceDialog } from "@/components/purchasing/create-supplier-invoice-dialog";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Calendar, Truck, FileText, CreditCard } from "lucide-react";
import { formatDateTime, formatCurrency } from "@/lib/utils";
import { handleApiError, getErrorMessage } from "@/lib/error-handling";
import {
  getStatusBadge,
  PURCHASE_ORDER_MATCH_STATUS_MAP,
} from "@/lib/order-columns.utils";
import { useModulePermissions } from "@/hooks/use-permissions";

export function PurchaseOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<PurchaseOrderDto | null>(null);
  const [supplierInvoices, setSupplierInvoices] = useState<SupplierInvoiceDto[]>(
    []
  );
  const [matchSummary, setMatchSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isMatching, setIsMatching] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [isSupplierInvoiceOpen, setIsSupplierInvoiceOpen] = useState(false);
  const { canCreate, canUpdate } = useModulePermissions("purchasing");

  const fetchOrder = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);
    try {
      const [orderData, invoicesData] = await Promise.all([
        purchaseOrdersService.getPurchaseOrderById(id),
        supplierInvoicesService.getSupplierInvoicesByPurchaseOrder(id),
      ]);
      setOrder(orderData);
      setSupplierInvoices(invoicesData);
    } catch (loadError: unknown) {
      const apiError = handleApiError(loadError);
      setError(
        getErrorMessage(apiError, "Failed to fetch purchase order details")
      );
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchOrder();
  }, [fetchOrder]);

  const getPoStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      {
        label: string;
        variant: "default" | "secondary" | "destructive" | "outline";
      }
    > = {
      Draft: { label: "Draft", variant: "secondary" },
      Pending: { label: "Pending", variant: "outline" },
      Approved: { label: "Approved", variant: "default" },
      Ordered: { label: "Ordered", variant: "default" },
      PartiallyReceived: { label: "Partially Received", variant: "secondary" },
      Received: { label: "Received", variant: "default" },
      Cancelled: { label: "Cancelled", variant: "destructive" },
    };
    const statusInfo = statusMap[status] || {
      label: status,
      variant: "secondary" as const,
    };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const handleMatch = async () => {
    if (!order) return;

    setActionError(null);
    setIsMatching(true);
    try {
      const result = await purchaseOrdersService.matchPurchaseOrder(order.id);
      setMatchSummary(result.summary);
      await fetchOrder();
    } catch (matchError: unknown) {
      setActionError(
        matchError instanceof Error
          ? matchError.message
          : "Failed to run three-way match."
      );
    } finally {
      setIsMatching(false);
    }
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
        <Button variant="outline" onClick={() => void fetchOrder()}>
          Try Again
        </Button>
        <Link to="/purchasing/orders">
          <Button variant="ghost">Back to List</Button>
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-8">
        <p className="text-muted-foreground">Order not found</p>
        <Link to="/purchasing/orders">
          <Button variant="ghost">Back to List</Button>
        </Link>
      </div>
    );
  }

  const supplierName = order.supplier?.name || "Unknown Supplier";
  const canApprove =
    canUpdate &&
    (order.status === PurchaseOrderStatus.Pending ||
      order.status === PurchaseOrderStatus.Draft);
  const canReceive =
    canUpdate &&
    (order.status === PurchaseOrderStatus.Approved ||
      order.status === PurchaseOrderStatus.Ordered ||
      order.status === PurchaseOrderStatus.PartiallyReceived);
  const canMatch =
    canUpdate &&
    order.status === PurchaseOrderStatus.Received &&
    order.matchStatus !== PurchaseOrderMatchStatus.Matched;
  const canAddSupplierInvoice = canCreate;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/purchasing/orders">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">
          Purchase Order {order.orderNumber}
        </h1>
        {getPoStatusBadge(order.status)}
        {order.matchStatus
          ? getStatusBadge(order.matchStatus, PURCHASE_ORDER_MATCH_STATUS_MAP)
          : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setIsApproveOpen(true)} disabled={!canApprove}>
          Approve
        </Button>
        <Button
          onClick={() => setIsReceiveOpen(true)}
          variant="outline"
          disabled={!canReceive}
        >
          Receive
        </Button>
        <Button
          onClick={() => setIsSupplierInvoiceOpen(true)}
          variant="outline"
          disabled={!canAddSupplierInvoice}
        >
          Add Supplier Invoice
        </Button>
        <Button
          onClick={() => void handleMatch()}
          variant="outline"
          disabled={!canMatch || isMatching}
        >
          {isMatching ? "Matching..." : "Match"}
        </Button>
      </div>

      {actionError ? (
        <Alert variant="destructive">
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      ) : null}

      {matchSummary ? (
        <Alert>
          <AlertDescription>{matchSummary}</AlertDescription>
        </Alert>
      ) : null}

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
                <p className="text-sm font-medium text-muted-foreground">
                  Order Date
                </p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p>{formatDateTime(order.orderDate)}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Amount
                </p>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <p className="font-semibold">
                    {formatCurrency(order.totalAmount)}
                  </p>
                </div>
              </div>
              {order.expectedDeliveryDate && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Expected Delivery
                  </p>
                  <p>{formatDateTime(order.expectedDeliveryDate)}</p>
                </div>
              )}
              {order.matchStatus ? (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Match Status
                  </p>
                  <p>{order.matchStatus}</p>
                </div>
              ) : null}
              {order.matchedAt ? (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Matched At
                  </p>
                  <p>{formatDateTime(order.matchedAt)}</p>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Supplier Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-lg">{supplierName}</p>
            </div>
            {order.supplier?.email && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Email
                </p>
                <p>{order.supplier.email}</p>
              </div>
            )}
            {order.supplier?.phone && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Phone
                </p>
                <p>{order.supplier.phone}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Supplier Invoices</CardTitle>
          <CardDescription>
            {supplierInvoices.length} invoice(s) for this purchase order
          </CardDescription>
        </CardHeader>
        <CardContent>
          {supplierInvoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No supplier invoices recorded yet.
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supplierInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.invoiceNumber}
                      </TableCell>
                      <TableCell>{formatDateTime(invoice.invoiceDate)}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(invoice.totalAmount)} {invoice.currency}
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
                    <TableCell className="font-medium">
                      {line.productId}
                    </TableCell>
                    <TableCell className="text-right">{line.quantity}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(line.unitPrice)}
                    </TableCell>
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

      <ApprovePurchaseOrderDialog
        open={isApproveOpen}
        purchaseOrderId={order.id}
        onOpenChange={setIsApproveOpen}
        onSuccess={() => void fetchOrder()}
      />
      <ReceivePurchaseOrderDialog
        open={isReceiveOpen}
        order={order}
        onOpenChange={setIsReceiveOpen}
        onSuccess={() => void fetchOrder()}
      />
      <CreateSupplierInvoiceDialog
        open={isSupplierInvoiceOpen}
        order={order}
        onOpenChange={setIsSupplierInvoiceOpen}
        onSuccess={() => void fetchOrder()}
      />
    </div>
  );
}
