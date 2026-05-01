"use client";

import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { invoicesService } from "@/api/services/invoices.service";
import type { CreditNoteDto, InvoiceDto, PaymentDto } from "@/types/api.types";
import { CancelInvoiceDialog } from "@/components/billing/cancel-invoice-dialog";
import { CreateCreditNoteDialog } from "@/components/billing/create-credit-note-dialog";
import { IssueInvoiceDialog } from "@/components/billing/issue-invoice-dialog";
import { RecordPaymentDialog } from "@/components/billing/record-payment-dialog";
import { Badge } from "@/components/ui/badge";
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
import { useModulePermissions } from "@/hooks/use-permissions";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

export function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<InvoiceDto | null>(null);
  const [payments, setPayments] = useState<PaymentDto[]>([]);
  const [creditNotes, setCreditNotes] = useState<CreditNoteDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isIssueOpen, setIsIssueOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [isCreditNoteOpen, setIsCreditNoteOpen] = useState(false);
  const { canUpdate, canDelete, canCreate } = useModulePermissions("billing");

  const loadDetail = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);
    try {
      const [invoiceData, paymentsData, creditNotesData] = await Promise.all([
        invoicesService.getInvoiceById(id),
        invoicesService.getPaymentsByInvoice(id),
        invoicesService.getCreditNotesByInvoice(id),
      ]);
      setInvoice(invoiceData);
      setPayments(paymentsData);
      setCreditNotes(creditNotesData);
    } catch (loadError: unknown) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load invoice details."
      );
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Loading invoice details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <p className="text-red-500">{error}</p>
        <Button variant="outline" onClick={() => void loadDetail()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <p className="text-muted-foreground">Invoice not found.</p>
        <Link to="/billing/invoices">
          <Button variant="outline">Back to List</Button>
        </Link>
      </div>
    );
  }

  const normalizedStatus = invoice.status.trim().toLowerCase();
  const isDraft = normalizedStatus === "draft";
  const isIssued = normalizedStatus === "issued";
  const isPartiallyPaid = normalizedStatus === "partiallypaid";
  const isPaid = normalizedStatus === "paid";

  const canIssue = canUpdate && isDraft;
  const canRecordPayment = canUpdate && (isIssued || isPartiallyPaid);
  const canCreateCreditNote = canCreate && (isIssued || isPartiallyPaid || isPaid);
  const canCancel = canDelete && (isDraft || isIssued);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/billing/invoices">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">{invoice.invoiceNumber}</h1>
        <Badge>{invoice.status}</Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setIsIssueOpen(true)} disabled={!canIssue}>
          Issue
        </Button>
        <Button
          onClick={() => setIsRecordPaymentOpen(true)}
          variant="outline"
          disabled={!canRecordPayment}
        >
          Record Payment
        </Button>
        <Button
          onClick={() => setIsCreditNoteOpen(true)}
          variant="outline"
          disabled={!canCreateCreditNote}
        >
          Create Credit Note
        </Button>
        <Button
          onClick={() => setIsCancelOpen(true)}
          variant="destructive"
          disabled={!canCancel}
        >
          Cancel Invoice
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>Customer ID:</strong> {invoice.customerId}
            </p>
            <p>
              <strong>Order ID:</strong> {invoice.orderId ?? "-"}
            </p>
            <p>
              <strong>Issue Date:</strong> {formatDateTime(invoice.issueDate)}
            </p>
            <p>
              <strong>Due Date:</strong> {formatDateTime(invoice.dueDate)}
            </p>
            <p>
              <strong>Currency:</strong> {invoice.currency}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Totals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>Net:</strong> {formatCurrency(invoice.totalNet)}
            </p>
            <p>
              <strong>Tax:</strong> {formatCurrency(invoice.totalTax)}
            </p>
            <p>
              <strong>Gross:</strong> {formatCurrency(invoice.totalGross)}
            </p>
            <p>
              <strong>Outstanding:</strong> {formatCurrency(invoice.outstandingAmount)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Lines</CardTitle>
          <CardDescription>{invoice.lines.length} lines</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit</TableHead>
                  <TableHead className="text-right">Tax</TableHead>
                  <TableHead className="text-right">Gross</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.lines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell>{line.description}</TableCell>
                    <TableCell className="text-right">{line.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(line.unitPrice)}</TableCell>
                    <TableCell className="text-right">{line.taxRate}%</TableCell>
                    <TableCell className="text-right">{formatCurrency(line.lineGross)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Payments</CardTitle>
            <CardDescription>{payments.length} payments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {payments.length === 0 ? (
              <p className="text-muted-foreground">No payments recorded.</p>
            ) : (
              payments.map((payment) => (
                <div key={payment.id} className="rounded border p-2">
                  <p>
                    {formatCurrency(payment.amount)} via {payment.method}
                  </p>
                  <p className="text-muted-foreground">
                    {formatDateTime(payment.paidAt)} - {payment.status}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Credit Notes</CardTitle>
            <CardDescription>{creditNotes.length} credit notes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {creditNotes.length === 0 ? (
              <p className="text-muted-foreground">No credit notes created.</p>
            ) : (
              creditNotes.map((creditNote) => (
                <div key={creditNote.id} className="rounded border p-2">
                  <p>{creditNote.reason}</p>
                  <p className="text-muted-foreground">
                    {formatCurrency(creditNote.totalGross)} - {creditNote.status}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <IssueInvoiceDialog
        open={isIssueOpen}
        invoiceId={invoice.id}
        currentInvoiceNumber={invoice.invoiceNumber}
        onOpenChange={setIsIssueOpen}
        onSuccess={() => void loadDetail()}
      />
      <RecordPaymentDialog
        open={isRecordPaymentOpen}
        invoiceId={invoice.id}
        onOpenChange={setIsRecordPaymentOpen}
        onSuccess={() => void loadDetail()}
      />
      <CreateCreditNoteDialog
        open={isCreditNoteOpen}
        invoiceId={invoice.id}
        onOpenChange={setIsCreditNoteOpen}
        onSuccess={() => void loadDetail()}
      />
      <CancelInvoiceDialog
        open={isCancelOpen}
        invoiceId={invoice.id}
        onOpenChange={setIsCancelOpen}
        onSuccess={() => void loadDetail()}
      />
    </div>
  );
}
