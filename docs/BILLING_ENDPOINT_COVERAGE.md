# Billing Endpoint Coverage Matrix

This matrix tracks billing endpoint integration across service layer, UI actions, and tests.

## Invoices

| Endpoint | Service Method | UI Integration | Test Coverage | Gap |
| --- | --- | --- | --- | --- |
| `GET /billing/api/billing/Invoices` | `getInvoices()` | `src/pages/billing/invoices-list.tsx` | `src/api/services/__tests__/invoices.service.test.ts`, `src/pages/billing/__tests__/invoices-list.test.tsx` | Expand list behavior tests |
| `GET /billing/api/billing/Invoices/{id}` | `getInvoiceById(id)` | `src/pages/billing/invoice-detail.tsx` | `src/api/services/__tests__/invoices.service.test.ts`, `src/pages/billing/__tests__/invoice-detail.test.tsx` | Expand error/retry + action-state tests |
| `GET /billing/api/billing/Invoices/customer/{customerId}` | `getInvoicesByCustomer(customerId)` | Not currently exposed | `src/api/services/__tests__/invoices.service.test.ts` | Pending UI filter flow |
| `GET /billing/api/billing/Invoices/order/{orderId}` | `getInvoicesByOrder(orderId)` | Not currently exposed | `src/api/services/__tests__/invoices.service.test.ts` | Pending UI filter flow |
| `POST /billing/api/billing/Invoices` | `createInvoice(data)` | `src/components/billing/create-invoice-dialog.tsx` | `src/api/services/__tests__/invoices.service.test.ts`, `src/components/billing/__tests__/create-invoice-dialog.test.tsx` | Add payload/validation/error-path tests |
| `POST /billing/api/billing/Invoices/{id}/issue` | `issueInvoice(id, data)` | `src/components/billing/issue-invoice-dialog.tsx` (from detail page) | `src/api/services/__tests__/invoices.service.test.ts` | Add dialog test + status/permission gating in detail |
| `POST /billing/api/billing/Invoices/{id}/payments` | `recordPayment(id, data)` | `src/components/billing/record-payment-dialog.tsx` (from detail page) | `src/api/services/__tests__/invoices.service.test.ts` | Add dialog test + status/permission gating in detail |
| `POST /billing/api/billing/Invoices/{id}/cancel` | `cancelInvoice(id, data)` | `src/components/billing/cancel-invoice-dialog.tsx` (from detail page) | `src/api/services/__tests__/invoices.service.test.ts` | Add dialog test + status/permission gating in detail |
| `POST /billing/api/billing/Invoices/{id}/credit-notes` | `createCreditNote(id, data)` | `src/components/billing/create-credit-note-dialog.tsx` (from detail page) | `src/api/services/__tests__/invoices.service.test.ts` | Add dialog test + status/permission gating in detail |
| `GET /billing/api/billing/Invoices/export-xlsx` | `exportToXlsx()` | `src/pages/billing/invoices-list.tsx` | `src/api/services/__tests__/invoices.service.test.ts` | Add page export behavior assertions |
| `GET /billing/api/billing/Invoices/export-pdf` | `exportToPdf()` | `src/pages/billing/invoices-list.tsx` | `src/api/services/__tests__/invoices.service.test.ts` | Add page export behavior assertions |

## Payments

| Endpoint | Service Method | UI Integration | Test Coverage | Gap |
| --- | --- | --- | --- | --- |
| `GET /billing/api/billing/Payments/invoice/{invoiceId}` | `getPaymentsByInvoice(invoiceId)` | `src/pages/billing/invoice-detail.tsx` | `src/api/services/__tests__/invoices.service.test.ts` | Add detail rendering + refresh assertions |

## Credit Notes

| Endpoint | Service Method | UI Integration | Test Coverage | Gap |
| --- | --- | --- | --- | --- |
| `GET /billing/api/billing/CreditNotes/invoice/{invoiceId}` | `getCreditNotesByInvoice(invoiceId)` | `src/pages/billing/invoice-detail.tsx` | `src/api/services/__tests__/invoices.service.test.ts` | Add detail rendering + refresh assertions |
