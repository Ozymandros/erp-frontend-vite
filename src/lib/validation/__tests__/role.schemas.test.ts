import { describe, it, expect } from "vitest";
import {
  CreateRoleSchema,
  UpdateRoleSchema,
} from "@/lib/validation/role.schemas";

describe("Role Validation Schemas", () => {
  describe("CreateRoleSchema", () => {
    it("should validate correct role data", () => {
      const validData = {
        name: "Admin",
        description: "Administrator role",
        permissionIds: ["perm1", "perm2"],
      };

      const result = CreateRoleSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it("should validate with minimal required fields", () => {
      const validData = {
        name: "User",
      };

      const result = CreateRoleSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("User");
      }
    });

    it("should validate with empty string description", () => {
      const validData = {
        name: "Guest",
        description: "",
      };

      const result = CreateRoleSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBeUndefined();
      }
    });

    it("should validate with undefined description", () => {
      const validData = {
        name: "Member",
      };

      const result = CreateRoleSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should validate with empty permissionIds array", () => {
      const validData = {
        name: "Viewer",
        permissionIds: [],
      };

      const result = CreateRoleSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.permissionIds).toEqual([]);
      }
    });

    it("should reject empty name", () => {
      const invalidData = {
        name: "",
      };

      const result = CreateRoleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Name is required");
      }
    });

    it("should reject missing name", () => {
      const invalidData = {};

      const result = CreateRoleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject non-string name", () => {
      const invalidData = {
        name: 123,
      };

      const result = CreateRoleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject invalid permissionIds type", () => {
      const invalidData = {
        name: "Admin",
        permissionIds: "not-an-array",
      };

      const result = CreateRoleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("UpdateRoleSchema", () => {
    it("should validate correct update data (same as CreateRoleSchema)", () => {
      const validData = {
        name: "Updated Admin",
        description: "Updated description",
        permissionIds: ["perm1"],
      };

      const result = UpdateRoleSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it("should validate with minimal fields", () => {
      const validData = {
        name: "Updated Role",
      };

      const result = UpdateRoleSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject empty name", () => {
      const invalidData = {
        name: "",
      };

      const result = UpdateRoleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
