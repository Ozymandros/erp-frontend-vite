# Duplicate Code Analysis

This document identifies duplicate code patterns across the ERP frontend codebase to guide refactoring.

---

## 1. Stock Operation Forms – Product/Warehouse Select UI

**Location:** `adjust-stock-form.tsx`, `reserve-stock-form.tsx`, `transfer-stock-form.tsx`

**Duplication:** Product select and warehouse select are repeated in all three forms with nearly identical markup:

```tsx
<FormField label="Product" name="productId" type="select" required>
  <option value="">Select a product...</option>
  {products?.map((product) => (
    <option key={product.id} value={product.id}>
      {product.name} ({product.sku})
    </option>
  ))}
</FormField>

<FormField label="Warehouse" name="warehouseId" type="select" required>
  <option value="">Select a warehouse...</option>
  {warehouses?.map((warehouse) => (
    <option key={warehouse.id} value={warehouse.id}>
      {warehouse.name}
    </option>
  ))}
</FormField>
```

**Recommendation:** Add reusable components in `src/components/inventory/stock-ops/`:
- `ProductSelectField.tsx` – product dropdown with name (sku)
- `WarehouseSelectField.tsx` – warehouse dropdown
- Or a generic `EntitySelectField` that accepts items and `renderOption`/`valueKey`/`labelKey` props

---

## 2. Stock Forms – Error/Success Feedback UI

**Location:** All three stock operation forms

**Duplication:** Same pattern repeated:
```tsx
{error && <p className="text-red-500 text-sm">{error}</p>}
{success && (
  <p className="text-green-500 text-sm">Stock [adjusted|reserved|transferred] successfully!</p>
)}
```

**Recommendation:** Use a shared `FormFeedback` component (or extend `FormField`) that renders error/success messages from the form hook.

---

## 3. Purchase Order Columns – Redundant Date Column

**Location:** `purchase-orders.columns.tsx`

**Duplication:** Custom Order Date and Expected Delivery columns instead of `getOrderDateColumn()` from `order-columns.utils.tsx`:

```tsx
// Current – inline columns
{
  header: "Order Date",
  accessor: (order) => formatDateTime(order.orderDate),
  sortable: true,
  sortField: "orderDate",
},
```

**Recommendation:** Replace with `getOrderDateColumn<PurchaseOrderDto>()` and add `getOptionalDateColumn<T>(header, accessor, sortField?)` in `order-columns.utils.tsx` for Expected Delivery.

---

## 4. Error Handling – Inconsistent `err instanceof Error`

**Location:** ~25 files

**Duplication:** Two patterns used:

1. **Raw pattern (most dialogs/pages):**
   ```ts
   setError(err instanceof Error ? err.message : "Failed to ...")
   ```

2. **Centralized pattern (CreateUserDialog, RoleDetailPage):**
   ```ts
   const apiError = handleApiError(error);
   setError(getErrorMessage(apiError, "Failed to ..."));
   ```

**Recommendation:** Standardize on `handleApiError` + `getErrorMessage` from `@/lib/error-handling` for all catch blocks. This improves 403 handling and consistency.

---

## 5. Zod Validation Error Parsing

**Location:** 13 files (create/edit dialogs, auth forms)

**Duplication:**
```ts
const validation = SomeSchema.safeParse(formData);
if (!validation.success) {
  const errors: Record<string, string> = {};
  validation.error.issues.forEach((err) => {
    if (err.path[0]) errors[err.path[0].toString()] = err.message;
  });
  setFieldErrors(errors);
  setError("Please fix the validation errors");
  return;
}
```

**Recommendation:** Add `parseZodErrors(validation.error): Record<string, string>` in `lib/validation` or `lib/utils` and reuse everywhere.

---

## 6. Create/Edit Supplier Form Fields

**Location:** `create-supplier-dialog.tsx`, `edit-supplier-dialog.tsx`

**Duplication:** Same fields (name, email, phone, address, city, country, postalCode, isActive) and layout repeated in both dialogs.

**Recommendation:** Extract `SupplierFormFields` that renders the field layout and receives `formData`, `onChange`, `fieldErrors`, `isLoading`. Both dialogs use it with different initial data and submit logic.

---

## 7. Delete Confirmation Dialogs

**Location:** `delete-supplier-dialog.tsx`, `delete-user-dialog.tsx`, `delete-role-dialog.tsx`, `delete-warehouse-dialog.tsx`, `delete-product-dialog.tsx`, `delete-permission-dialog.tsx`

**Duplication:** Same structure:
- `open`, `onOpenChange`, `onSuccess` props
- `error`, `isLoading` state
- `handleDelete` with `setError(null)`, `setIsLoading(true)`, try/catch/finally
- Same Dialog layout: title, description, preview fields, Cancel + Delete buttons

**Recommendation:** Introduce generic `ConfirmDeleteDialog<T>` with props:
- `item: T`, `open`, `onOpenChange`, `onConfirm: () => Promise<void>`
- `title`, `description`, `renderPreview: (item: T) => ReactNode`
- `confirmLabel` (e.g. "Delete Supplier")
- Use `handleApiError` + `getErrorMessage` in a shared `useDeleteDialog` hook.

---

## 8. Entity Detail Pages – Shared Boilerplate

**Location:** `supplier-detail.tsx`, `user-detail.tsx`, `role-detail.tsx`, `warehouse-detail.tsx`, `customer-detail.tsx`, `product-detail.tsx`

**Duplication:**
- Fetch on mount with `useEffect` and `useParams`
- `[entity, setEntity]`, `[isLoading, setIsLoading]`, `[error, setError]`
- Loading spinner / error / not-found states
- Back button (ArrowLeft) + Edit + Delete buttons
- Edit/Delete dialog open state and handlers

**Recommendation:** `useEntityDetail<T>(fetchFn: (id: string) => Promise<T>)` hook returning `{ entity, isLoading, error, refresh }`. Consider a `DetailPageLayout` that renders header, back button, actions, loading/error, and children for content.

---

## 9. Detail Pages – Created/Updated Timestamps

**Location:** Multiple detail pages

**Duplication:**
```tsx
<p className="text-base">{formatDateTime(entity.createdAt)}</p>
{entity.updatedAt && (
  <p className="text-base">{formatDateTime(entity.updatedAt)}</p>
)}
```

**Recommendation:** Add `AuditTimestamps({ createdAt, updatedAt })` in `components/ui` to standardize layout and labels.

---

## 10. Create Order Dialogs – Shared Logic

**Location:** `create-purchase-order-dialog.tsx`, `create-sales-order-dialog.tsx`, `create-order-dialog.tsx`

**Duplication:**
- `getDefaultDate()` – identical implementation
- Form state: `orderDate`, `orderLines`, `newLine` for adding items
- Validation → `validation.error.issues.forEach` → field errors
- Order lines table (add/remove rows, quantity, unitPrice)
- Error handling and loading states

**Recommendation:** Extract:
- `useOrderFormDate()` for `getDefaultDate` and date state
- `OrderLinesEditor` for the lines table and add/remove logic
- Shared `CreateOrderDialogLayout` for header, error, footer if structure is similar
- `parseZodErrors` for validation (see #5)

---

## 11. API Services – CRUD Boilerplate

**Location:** `suppliers.service.ts`, `users.service.ts`, `customers.service.ts`, `warehouses.service.ts`, etc.

**Duplication:** Similar methods across services:
- `getAll()`, `getById()`, `create()`, `update()`, `delete()`
- `exportToXlsx()`, `exportToPdf()` – same structure

**Recommendation:** Optional base class or factory for standard CRUD services (given backend endpoints differ, this may be lower priority than UI duplication).

---

## Summary by Priority

| Priority | Item                                   | Effort | Impact |
|----------|----------------------------------------|--------|--------|
| High     | #5 Zod validation parsing utility      | Low    | High   |
| High     | #4 Standardize error handling          | Medium | High   |
| High     | #7 Generic `ConfirmDeleteDialog`       | Medium | High   |
| Medium   | #1 Product/Warehouse select components | Low    | Medium |
| Medium   | #6 `SupplierFormFields` extraction     | Low    | Medium |
| Medium   | #10 Order dialog shared logic          | High   | Medium |
| Low      | #3 Order columns utils usage           | Low    | Low    |
| Low      | #9 `AuditTimestamps` component         | Low    | Low    |
| Low      | #8 `useEntityDetail` hook              | Medium | Medium |
