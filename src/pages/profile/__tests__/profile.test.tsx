import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfilePage } from '../profile';
import * as authContext from '@/contexts/auth.context';
import type { AuthContextType } from '@/contexts/auth.context-object';

// Mock the auth context
vi.mock('@/contexts/auth.context', () => ({
  useAuth: vi.fn(),
}));

describe('ProfilePage', () => {
  it('should render loading state when user is not available', () => {
    const mockAuthContext: AuthContextType = {
      user: null,
      permissions: [],
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      isAuthenticated: false,
      isLoading: true,
      hasPermission: vi.fn(),
      checkApiPermission: vi.fn(),
      refreshUserData: vi.fn(),
    };

    vi.spyOn(authContext, 'useAuth').mockReturnValue(mockAuthContext);

    render(<ProfilePage />);
    expect(screen.getByText('Loading user data...')).toBeInTheDocument();
  });

  it('should render user profile when user is available', () => {
    const mockUser = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      isActive: true,
      roles: [{ id: '1', name: 'Admin', description: 'Administrator', permissions: [], createdAt: '2024-01-01T00:00:00Z', createdBy: 'system' }],
      permissions: [{ id: '1', name: 'users.read', description: 'Read users', module: 'users', action: 'read', createdAt: '2024-01-01T00:00:00Z', createdBy: 'system' }],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
      emailConfirmed: true,
      isExternalLogin: false,
      isAdmin: true,
      createdBy: 'system',
    };

    const mockAuthContext: AuthContextType = {
      user: mockUser,
      permissions: [],
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      isAuthenticated: true,
      isLoading: false,
      hasPermission: vi.fn(),
      checkApiPermission: vi.fn(),
      refreshUserData: vi.fn(),
    };

    vi.spyOn(authContext, 'useAuth').mockReturnValue(mockAuthContext);

    render(<ProfilePage />);
    
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
  });

  it('should render user roles', () => {
    const mockUser = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      isActive: true,
      roles: [
        { id: '1', name: 'Admin', description: 'Administrator', permissions: [], createdAt: '2024-01-01T00:00:00Z', createdBy: 'system' },
        { id: '2', name: 'Editor', description: 'Editor Role', permissions: [], createdAt: '2024-01-01T00:00:00Z', createdBy: 'system' },
      ],
      permissions: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
      emailConfirmed: true,
      isExternalLogin: false,
      isAdmin: true,
      createdBy: 'system',
    };

    const mockAuthContext: AuthContextType = {
      user: mockUser,
      permissions: [],
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      isAuthenticated: true,
      isLoading: false,
      hasPermission: vi.fn(),
      checkApiPermission: vi.fn(),
      refreshUserData: vi.fn(),
    };

    vi.spyOn(authContext, 'useAuth').mockReturnValue(mockAuthContext);

    render(<ProfilePage />);
    
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Editor')).toBeInTheDocument();
  });
});
