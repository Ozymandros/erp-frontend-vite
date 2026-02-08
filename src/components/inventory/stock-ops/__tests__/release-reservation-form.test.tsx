import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReleaseReservationForm } from '../release-reservation-form';

describe('ReleaseReservationForm', () => {
  it('renders form with all fields', () => {
    render(<ReleaseReservationForm />);

    expect(screen.getByLabelText(/reservation id/i)).toBeInTheDocument();
  });
});
