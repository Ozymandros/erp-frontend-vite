import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DashboardPage } from '../dashboard';

vi.mock('@/contexts/auth.context', () => ({
  useAuth: () => ({
    user: { id: '1', username: 'testuser', firstName: 'Test' },
  }),
}));

const MockedDashboardPage = () => (
  <BrowserRouter>
    <DashboardPage />
  </BrowserRouter>
);

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dashboard title', () => {
    render(<MockedDashboardPage />);
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    const { container } = render(<MockedDashboardPage />);
    expect(container).toBeInTheDocument();
  });
});
