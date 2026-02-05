import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Can } from '../can';
import { usePermission } from '@/hooks/use-permissions';

vi.mock('@/hooks/use-permissions', () => ({
  usePermission: vi.fn(),
}));

describe('Can Component', () => {
  it('should render children when user has permission', () => {
    vi.mocked(usePermission).mockReturnValue(true);

    render(
      <Can module="Users" action="Read">
        <div>Protected Content</div>
      </Can>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should not render children when user lacks permission', () => {
    vi.mocked(usePermission).mockReturnValue(false);

    render(
      <Can module="Users" action="Read">
        <div>Protected Content</div>
      </Can>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should call usePermission with correct parameters', () => {
    vi.mocked(usePermission).mockReturnValue(true);

    render(
      <Can module="Products" action="Create">
        <div>Create Product</div>
      </Can>
    );

    expect(usePermission).toHaveBeenCalledWith('Products', 'Create');
  });
});
