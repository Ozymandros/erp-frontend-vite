// components/FilterHeader.tsx
import { useState } from 'react';
import { Input,  } from '../ui/input';
import * as Select from '@radix-ui/react-select';

type FilterProps = {
  onFilterChange: (filters: Record<string, string>) => void;
};

export const PermissionFilterHeader = ({ onFilterChange }: FilterProps) => {
  const [filters, setFilters] = useState({ search: '', role: '' });

  const handleChange = (key: string, value: string) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    onFilterChange(updated);
  };

  return (
    <div className="flex gap-4 p-4 border-b items-center bg-white sticky top-0 z-10">
      <Input
        placeholder="Cerca per nom o acció..."
        value={filters.search}
        onChange={(e) => handleChange('search', e.target.value)}
      />
      <Select.Root
        value={filters.role}
        onValueChange={(value) => handleChange('role', value)}
      >
        <Select.Trigger className="w-[200px]" />
        <Select.Content>
          <Select.Item value="">Tots els rols</Select.Item>
          <Select.Item value="admin">Admin</Select.Item>
          <Select.Item value="editor">Editor</Select.Item>
          <Select.Item value="viewer">Viewer</Select.Item>
        </Select.Content>
      </Select.Root>
    </div>
  );
};
