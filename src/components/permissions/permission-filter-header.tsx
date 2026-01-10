// components/FilterHeader.tsx
import { useState, useEffect } from "react";
import { Input } from "../ui/input";
import * as Select from "@radix-ui/react-select";
import { rolesService } from "@/api/services/roles.service";
import { Role } from "@/types/api.types";

type FilterProps = {
  filters: Record<string, string>
  onFilterChange: (filters: Record<string, string>) => void
}

export const PermissionFilterHeader = ({ filters, onFilterChange }: FilterProps) => {
  const [roles, setRoles] = useState<Role[]>([]);

  const handleChange = (key: string, value: string) => {
    const updated = { ...filters, [key]: value };
    onFilterChange(updated);
  }

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesData = await rolesService.getRoles();
        setRoles(rolesData);
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };

    fetchRoles();
  }, []);

  return (
    <div className="flex gap-4 p-4 border-b items-center bg-white sticky top-0 z-10">
      <Input
        placeholder="Cerca per nom o acció..."
        value={filters.search}
        onChange={e => handleChange("search", e.target.value)}
      />
      <Select.Root
        value={filters.role}
        onValueChange={value => handleChange("role", value)}
      >
        <Select.Trigger className="w-[200px]" />
        <Select.Content>
          <Select.Item value="">Tots els rols</Select.Item>
          {roles.map(role => (
            <Select.Item key={role.id} value={role.id}>
              {role.name}
            </Select.Item>
          ))}
          {/* <Select.Item value="admin">Admin</Select.Item>
          <Select.Item value="editor">Editor</Select.Item>
          <Select.Item value="viewer">Viewer</Select.Item> */}
        </Select.Content>
      </Select.Root>
    </div>
  );
};
