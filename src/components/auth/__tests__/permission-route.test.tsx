import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { PermissionRoute } from '../permission-route';
import { useAuth } from '@/contexts/auth.context';

vi.mock('@/contexts/auth.context', () => ({
  useAuth: vi.fn(),
}));

describe('PermissionRoute Component', () => {
  const TestComponent = () => <div>Protected Page Content</div>;

  it('should render children when user has permission', async () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1', username: 'testuser', email: 'test@example.com', isActive: true, roles: [] },
      checkApiPermission: vi.fn().mockResolvedValue(true),
      hasPermission: vi.fn().mockReturnValue(true),
    } as never);

    render(
      <MemoryRouter initialEntries={['/users']}>
        <Routes>
          <Route
            path="/users"
            element={
              <PermissionRoute path="/users">
                <TestComponent />
              </PermissionRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Protected Page Content')).toBeInTheDocument();
    });
  });

  it('should show Access Denied when user lacks permission', async () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1', username: 'testuser', email: 'test@example.com', isActive: true, roles: [] },
      checkApiPermission: vi.fn().mockResolvedValue(false),
      hasPermission: vi.fn().mockReturnValue(false),
    } as never);

    render(
      <MemoryRouter initialEntries={['/users']}>
        <Routes>
          <Route
            path="/users"
            element={
              <PermissionRoute path="/users">
                <TestComponent />
              </PermissionRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/access denied/i)).toBeInTheDocument();
      expect(screen.queryByText('Protected Page Content')).not.toBeInTheDocument();
    });
  });

  it('should show loading state while checking permission', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: true,
      user: null,
      checkApiPermission: vi.fn().mockResolvedValue(true),
      hasPermission: vi.fn().mockReturnValue(true),
    } as never);

    render(
      <MemoryRouter initialEntries={['/users']}>
        <Routes>
          <Route
            path="/users"
            element={
              <PermissionRoute path="/users">
                <TestComponent />
              </PermissionRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
