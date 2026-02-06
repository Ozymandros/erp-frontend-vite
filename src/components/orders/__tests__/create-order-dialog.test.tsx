import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { CreateOrderDialog } from '../create-order-dialog';
import { customersService } from '@/api/services/customers.service';
import { productsService } from '@/api/services/products.service';
import { ordersService } from '@/api/services/orders.service';

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

vi.mock('@/api/services/orders.service', () => ({
  ordersService: {
    createOrder: vi.fn(),
  },
}));

describe('CreateOrderDialog', () => {
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
      <CreateOrderDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /create fulfillment order/i })).toBeInTheDocument();
    });
  });

  it('does not render when closed', () => {
    render(
      <CreateOrderDialog
        open={false}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.queryByText(/create.*order/i)).not.toBeInTheDocument();
  });

  it('loads customers and products on open', async () => {
    render(
      <CreateOrderDialog
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

  it('renders customer select field', async () => {
    render(
      <CreateOrderDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/customer/i)).toBeInTheDocument();
    });
  });

  it('renders order date field', async () => {
    render(
      <CreateOrderDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/order date/i)).toBeInTheDocument();
    });
  });

  it('handles API error', async () => {
    vi.mocked(customersService.getCustomers).mockRejectedValue(new Error('API Error'));

    render(
      <CreateOrderDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    // Initial load error (might just log to console or show error message)
    // The current implementation might catch it in useEffect but not set global error unless state used
    // Assuming implementation handles it. If check fails, we adjust expectation.
    // The previous test expected "failed to load customers or products"
    await waitFor(() => {
      expect(screen.getByText(/failed to load customers or products/i)).toBeInTheDocument();
    });
  });

  it('should validate customer if order lines are present', async () => {
    render(
      <CreateOrderDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/product/i)).toBeInTheDocument();
    });

    // Add an item to enable submit button
    await userEvent.selectOptions(screen.getByLabelText(/product/i), "1");
    await userEvent.click(screen.getByRole("button", { name: /add item/i }));

    const submitBtn = screen.getByRole('button', { name: /create order/i });
    expect(submitBtn).not.toBeDisabled();
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/please fix the validation errors/i)).toBeInTheDocument();
      expect(screen.getByText(/customer is required/i)).toBeInTheDocument();
    });
    
    expect(ordersService.createOrder).not.toHaveBeenCalled();
  });

  it('should handle order date change', async () => {
    render(
      <CreateOrderDialog
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
  });

  it('should handle cancel button', async () => {
    render(
      <CreateOrderDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('should have submit button disabled if no lines', async () => {
    render(
      <CreateOrderDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create order/i })).toBeDisabled();
    });
  });

  it('should add item to order and calculate total', async () => {
    render(
      <CreateOrderDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    // Wait for products to load (option with value "1" must be available)
    await waitFor(() => {
      expect(screen.getByRole('option', { name: /Product 1/ })).toBeInTheDocument();
    });

    // Select Product
    const productSelect = screen.getByLabelText(/product/i);
    await userEvent.selectOptions(productSelect, "1");

    // Set quantity to 2
    const qtyInput = screen.getByLabelText(/qty/i);
    await userEvent.clear(qtyInput);
    await userEvent.type(qtyInput, "2");

    // Click Add
    const addButton = screen.getByRole("button", { name: /add item/i });
    await userEvent.click(addButton);

    // Verify item in list (formatCurrency(200) = "$200" - appears in line total and footer total)
    await waitFor(() => {
      expect(screen.getByText("Product 1")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.getAllByText("$200").length).toBeGreaterThanOrEqual(1);
    });
  });

  it('should remove item from order', async () => {
    render(
      <CreateOrderDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/product/i)).toBeInTheDocument();
    });

    // Add Item
    await userEvent.selectOptions(screen.getByLabelText(/product/i), "1");
    await userEvent.click(screen.getByRole("button", { name: /add item/i }));

    expect(screen.getByText("Product 1")).toBeInTheDocument();

    // Remove Item
    // Find the trash button in the table row
    const deleteBtn = screen.getByRole('table').querySelector('button .lucide-trash2')?.closest('button');
    if (deleteBtn) {
      await userEvent.click(deleteBtn);
    } else {
      // Fallback if the above selector is too complex
      const allButtons = screen.getAllByRole('button');
      const fallbackBtn = allButtons.find(b => b.innerHTML.includes('lucide-trash2'));
      if (fallbackBtn) await userEvent.click(fallbackBtn);
    }

    await waitFor(() => {
      expect(screen.queryByText("Product 1")).not.toBeInTheDocument();
      expect(screen.getByText(/no items added/i)).toBeInTheDocument();
    });
  });

  it('should not add item if product not selected or quantity <= 0', async () => {
    render(
      <CreateOrderDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /add item/i })).toBeInTheDocument();
    });

    const addButton = screen.getByRole("button", { name: /add item/i });
    
    // Default state: no product selected
    expect(addButton).toBeDisabled();

    // Set product but quantity 0
    await userEvent.selectOptions(screen.getByLabelText(/product/i), "1");
    const qtyInput = screen.getByLabelText(/qty/i);
    await userEvent.clear(qtyInput);
    await userEvent.type(qtyInput, "0");
    
    // The button might not be disabled by quantity in the current implementation, 
    // but the addLine function has a guard: if (newLine.quantity <= 0) return;
    await userEvent.click(addButton);
    expect(screen.queryByText("Product 1")).not.toBeInTheDocument();
  });

  it('should handle submission loading state and error', async () => {
    vi.mocked(ordersService.createOrder).mockImplementation(() => new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Submit Error')), 500);
    }));
    render(
      <CreateOrderDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/customer/i)).toBeInTheDocument();
    });

    // Setup valid form
    await userEvent.selectOptions(screen.getByLabelText(/customer/i), "1");
    await userEvent.selectOptions(screen.getByLabelText(/product/i), "1");
    await userEvent.click(screen.getByRole("button", { name: /add item/i }));

    const submitBtn = screen.getByRole('button', { name: /create order/i });
    await userEvent.click(submitBtn);

    // Wait for the synchronous safeParse and the subsequent setIsLoading(true)
    await waitFor(() => {
      expect(submitBtn).toBeDisabled();
      expect(screen.getByText(/creating/i)).toBeInTheDocument();
    }, { timeout: 2000 });

    await waitFor(() => {
      expect(screen.getByText('Submit Error')).toBeInTheDocument();
      expect(submitBtn).not.toBeDisabled();
    });
  });

  it('should submit order successfully', async () => {
    vi.mocked(ordersService.createOrder).mockResolvedValue({ id: 'new-order' } as never);

    render(
      <CreateOrderDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    // Wait for customers and products to load
    await waitFor(() => {
      expect(screen.getByRole('option', { name: /Customer 1/ })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /Product 1/ })).toBeInTheDocument();
    });

    // Select Customer
    await userEvent.selectOptions(screen.getByLabelText(/customer/i), "1");

    // Add Item
    const productSelect = screen.getByLabelText(/product/i);
    await userEvent.selectOptions(productSelect, "1");
    await userEvent.click(screen.getByRole("button", { name: /add item/i }));

    // Submit
    await userEvent.click(screen.getByRole("button", { name: /create order/i }));

    await waitFor(() => {
      expect(ordersService.createOrder).toHaveBeenCalledWith(expect.objectContaining({
        customerId: "1",
        orderLines: expect.arrayContaining([
          expect.objectContaining({ productId: "1", quantity: 1 }),
        ]),
      }));
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
});
