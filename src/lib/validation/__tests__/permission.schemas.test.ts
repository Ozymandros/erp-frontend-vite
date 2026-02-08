import { describe, it, expect } from "vitest";
import {
  CreatePermissionSchema,
  UpdatePermissionSchema,
} from "@/lib/validation/permission.schemas";

describe("Permission Validation Schemas", () => {
  describe("CreatePermissionSchema", () => {
    it("should validate correct permission data", () => {
      const validData = {
        module: "users",
        action: "create",
        description: "Create users",
      };

      const result = CreatePermissionSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it("should validate with minimal required fields", () => {
      const validData = {
        module: "products",
        action: "read",
      };

      const result = CreatePermissionSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.module).toBe("products");
        expect(result.data.action).toBe("read");
      }
    });

    it("should validate with empty string description", () => {
      const validData = {
        module: "orders",
        action: "update",
        description: "",
      };

      const result = CreatePermissionSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBeUndefined();
      }
    });

    it("should validate with undefined description", () => {
      const validData = {
        module: "inventory",
        action: "delete",
      };

      const result = CreatePermissionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject empty module", () => {
      const invalidData = {
        module: "",
        action: "read",
      };

      const result = CreatePermissionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Module is required");
      }
    });

    it("should reject empty action", () => {
      const invalidData = {
        module: "users",
        action: "",
      };

      const result = CreatePermissionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Action is required");
      }
    });

    it("should reject missing module", () => {
      const invalidData = {
        action: "read",
      };

      const result = CreatePermissionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject missing action", () => {
      const invalidData = {
        module: "users",
      };

      const result = CreatePermissionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject non-string module", () => {
      const invalidData = {
        module: 123,
        action: "read",
      };

      const result = CreatePermissionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject non-string action", () => {
      const invalidData = {
        module: "users",
        action: 123,
      };

      const result = CreatePermissionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("UpdatePermissionSchema", () => {
    it("should validate correct update data", () => {
      const validData = {
        module: "updated-module",
        action: "updated-action",
        description: "Updated description",
      };

      const result = UpdatePermissionSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it("should validate with minimal fields", () => {
      const validData = {
        module: "products",
        action: "read",
      };

      const result = UpdatePermissionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject empty module", () => {
      const invalidData = {
        module: "",
        action: "read",
      };

      const result = UpdatePermissionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject empty action", () => {
      const invalidData = {
        module: "users",
        action: "",
      };

      const result = UpdatePermissionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
