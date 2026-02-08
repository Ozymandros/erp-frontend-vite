import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import { CreateSalesOrderDialog } from '../create-sales-order-dialog';
import { customersService } from '@/api/services/customers.service';
import { productsService } from '@/api/services/products.service';
import { salesOrdersService } from '@/api/services/sales-orders.service';
import userEvent from '@testing-library/user-event';
import type { SalesOrderDto } from '@/types/api.types';

vi.mock('@/api/services/customers.service', () => ({
  customersService: {
    getCustomers: vi.fn(),
  },
}));

vi.mock('@/api/services/products.service', () => ({
  productsService: {
    getProducts: vi.fn(),
  },
}));

vi.mock('@/api/services/sales-orders.service', () => ({
  salesOrdersService: {
    createSalesOrder: vi.fn(),
  },
}));

describe('CreateSalesOrderDialog', () => {
  const mockOnOpenChange = vi.fn();
  const mockOnSuccess = vi.fn();

  const mockCustomers = [
    { id: '1', name: 'Customer 1', email: 'customer1@example.com', phone: '123456', address: 'Address 1', createdAt: '2024-01-01T00:00:00Z', createdBy: 'test-user' },
  ];

  const mockProducts = [
    { id: '1', name: 'Product 1', sku: 'SKU001', price: 100, unitPrice: 100, stockQuantity: 10, quantityInStock: 10, reorderLevel: 5, categoryId: '1', categoryName: 'Category 1', createdAt: '2024-01-01T00:00:00Z', createdBy: 'test-user' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(customersService.getCustomers).mockResolvedValue(mockCustomers);
    vi.mocked(productsService.getProducts).mockResolvedValue(mockProducts);
  });

  it('renders dialog when open', async () => {
    render(
      <CreateSalesOrderDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /create sales order/i })).toBeInTheDocument();
    });
  });

  it('does not render when closed', () => {
    render(
      <CreateSalesOrderDialog
        open={false}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.queryByRole('heading', { name: /create sales order/i })).not.toBeInTheDocument();
  });

  it('loads customers and products on open', async () => {
    render(
      <CreateSalesOrderDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(customersService.getCustomers).toHaveBeenCalled();
      expect(productsService.getProducts).toHaveBeenCalled();
    });
  });

  it('handles API error on load', async () => {
    vi.mocked(customersService.getCustomers).mockRejectedValue(new Error('API Error'));

    render(
      <CreateSalesOrderDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/failed to load customers or products/i)).toBeInTheDocument();
    });
  });

  it('handles add and remove line', async () => {
    render(
      <CreateSalesOrderDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/product/i)).toBeInTheDocument();
    });

    // Add item
    await userEvent.selectOptions(screen.getByLabelText(/product/i), "1");
    // Product 1 has unitPrice 100
    await userEvent.click(screen.getByRole("button", { name: /add item/i }));

    const table = screen.getByRole('table');
    expect(within(table).getByText("Product 1")).toBeInTheDocument();
    // Use getAllByText because $100 appears in both Price and Total columns
    expect(within(table).getAllByText("$100").length).toBeGreaterThanOrEqual(1);

    // Remove item
    const deleteBtn = screen.getByRole('table').querySelector('button .lucide-trash2')?.closest('button');
    if (deleteBtn) await userEvent.click(deleteBtn);

    await waitFor(() => {
      expect(screen.queryByText("Product 1")).not.toBeInTheDocument();
    });
  });

  it('calculates total correctly', async () => {
    render(
      <CreateSalesOrderDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/product/i)).toBeInTheDocument();
    });

    // Add item 1 (Qty 1, Price 100)
    await userEvent.selectOptions(screen.getByLabelText(/product/i), "1");
    await userEvent.click(screen.getByRole("button", { name: /add item/i }));

    // Add item 2 (Qty 2, Price 100)
    await userEvent.selectOptions(screen.getByLabelText(/product/i), "1");
    const qtyInput = screen.getByLabelText(/qty/i);
    await userEvent.clear(qtyInput);
    await userEvent.type(qtyInput, "2");
    await userEvent.click(screen.getByRole("button", { name: /add item/i }));

    // Total: 100 + 200 = 300
    expect(screen.getByText("$300")).toBeInTheDocument();
  });

  it('handles successful submission', async () => {
    vi.spyOn(salesOrdersService, 'createSalesOrder').mockResolvedValue({ id: 'so-1' } as SalesOrderDto);
    render(
      <CreateSalesOrderDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/customer/i)).toBeInTheDocument();
    });

    await userEvent.selectOptions(screen.getByLabelText(/customer/i), "1");
    await userEvent.selectOptions(screen.getByLabelText(/product/i), "1");
    await userEvent.click(screen.getByRole("button", { name: /add item/i }));

    await userEvent.click(screen.getByRole('button', { name: /create sales order/i }));

    await waitFor(() => {
      expect(salesOrdersService.createSalesOrder).toHaveBeenCalled();
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('handles submission error', async () => {
    vi.mocked(salesOrdersService.createSalesOrder).mockRejectedValue(new Error('Sales Error'));
    render(
      <CreateSalesOrderDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('option', { name: /Customer 1/ })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /Product 1/ })).toBeInTheDocument();
    });

    await userEvent.selectOptions(screen.getByLabelText(/customer/i), "1");
    await userEvent.selectOptions(screen.getByLabelText(/product/i), "1");
    await userEvent.click(screen.getByRole("button", { name: /add item/i }));

    await userEvent.click(screen.getByRole('button', { name: /create sales order/i }));

    await waitFor(
      () => {
        expect(screen.getByText(/Sales Error/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('handles validation error visualization', async () => {
    render(
      <CreateSalesOrderDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );
    await waitFor(() => {
      expect(screen.getByLabelText(/customer/i)).toBeInTheDocument();
    });

    // Add a line first so submit becomes enabled
    await userEvent.selectOptions(screen.getByLabelText(/customer/i), ""); // Ensure empty
    await userEvent.selectOptions(screen.getByLabelText(/product/i), "1");
    await userEvent.click(screen.getByRole("button", { name: /add item/i }));

    const submitBtn = screen.getByRole('button', { name: /create sales order/i });
    expect(submitBtn).not.toBeDisabled();

    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/please fix the validation errors/i)).toBeInTheDocument();
      expect(screen.getByText(/customer is required/i)).toBeInTheDocument();
    });
  });

  it('handles field changes', async () => {
    render(
      <CreateSalesOrderDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );
    await waitFor(() => {
      expect(screen.getByLabelText(/order date/i)).toBeInTheDocument();
    });

    const dateInput = screen.getByLabelText(/order date/i);
    await userEvent.clear(dateInput);
    await userEvent.type(dateInput, "2024-02-01T12:00");
    expect(dateInput).toHaveValue("2024-02-01T12:00");

    const priceInput = screen.getByLabelText(/price/i);
    await userEvent.clear(priceInput);
    await userEvent.type(priceInput, "99.99");
    expect(priceInput).toHaveValue(99.99);
  });

  it('handles add line guards', async () => {
    render(
      <CreateSalesOrderDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );
    await waitFor(() => {
      expect(screen.getByLabelText(/product/i)).toBeInTheDocument();
    });
    
    // Should not add if no product
    await userEvent.click(screen.getByRole("button", { name: /add item/i }));
    expect(within(screen.getByRole('table')).queryByText("Product 1")).toBeNull();

    // Should not add if quantity <= 0
    await userEvent.selectOptions(screen.getByLabelText(/product/i), "1");
    const qtyInput = screen.getByLabelText(/qty/i);
    await userEvent.clear(qtyInput);
    await userEvent.type(qtyInput, "0");
    await userEvent.click(screen.getByRole("button", { name: /add item/i }));
    expect(within(screen.getByRole('table')).queryByText("Product 1")).toBeNull();
  });

  it('handles cancel button', async () => {
    render(
      <CreateSalesOrderDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
