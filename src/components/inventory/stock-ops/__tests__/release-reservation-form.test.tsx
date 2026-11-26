import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReleaseReservationForm } from '../release-reservation-form';
import * as stockOperationsService from '@/api/services/stock-operations.service';

vi.mock('@/api/services/stock-operations.service', () => ({
  stockOperationsService: {
    releaseReservation: vi.fn(),
  },
}));

describe('ReleaseReservationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form with all fields', () => {
    render(<ReleaseReservationForm />);

    expect(screen.getByLabelText(/reservation id/i)).toBeInTheDocument();
  });

  it('submits reservation id and shows success', async () => {
    const user = userEvent.setup();
    vi.mocked(stockOperationsService.stockOperationsService.releaseReservation).mockResolvedValue(
      undefined,
    );

    render(<ReleaseReservationForm />);

    await user.type(screen.getByPlaceholderText(/enter reservation id/i), 'res-99');
    await user.click(screen.getByRole('button', { name: /release reservation/i }));

    expect(stockOperationsService.stockOperationsService.releaseReservation).toHaveBeenCalledWith(
      'res-99',
    );
    expect(await screen.findByText(/reservation released successfully/i)).toBeInTheDocument();
  });
});
