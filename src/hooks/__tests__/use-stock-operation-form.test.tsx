import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useStockOperationForm } from '../use-stock-operation-form';

function TestForm({ onSubmit }: { onSubmit: (data: { value: string }) => Promise<void> }) {
  const { isLoading, error, success, handleSubmit, resetForm } = useStockOperationForm(
    {
      onSubmit,
      successMessage: 'Success!',
      defaultErrorMessage: 'Failed',
    },
    (formData) => ({ value: formData.get('value') as string })
  );

  return (
    <form onSubmit={handleSubmit}>
      <input name="value" defaultValue="test" data-testid="value-input" />
      <button type="submit" disabled={isLoading}>
        Submit
      </button>
      <button type="button" onClick={resetForm}>
        Reset
      </button>
      {error && <span data-testid="error">{error}</span>}
      {success && <span data-testid="success">Success!</span>}
    </form>
  );
}

describe('useStockOperationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial state', () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<TestForm onSubmit={onSubmit} />);

    expect(screen.getByTestId('value-input')).toBeInTheDocument();
    expect(screen.queryByTestId('error')).not.toBeInTheDocument();
    expect(screen.queryByTestId('success')).not.toBeInTheDocument();
  });

  it('should call onSubmit on submit and show success', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<TestForm onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ value: 'test' });
    });

    await waitFor(() => {
      expect(screen.getByTestId('success')).toBeInTheDocument();
    });
  });

  it('should show error on submit failure', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('API Error'));
    render(<TestForm onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('API Error');
    });
  });

  it('should reset error and success when resetForm called', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<TestForm onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    await waitFor(() => {
      expect(screen.getByTestId('success')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: /reset/i }));

    await waitFor(() => {
      expect(screen.queryByTestId('success')).not.toBeInTheDocument();
    });
  });
});
