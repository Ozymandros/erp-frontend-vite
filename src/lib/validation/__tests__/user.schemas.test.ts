import { describe, it, expect } from "vitest";
import {
  CreateUserSchema,
  UpdateUserSchema,
} from "@/lib/validation/user.schemas";

describe("User Validation Schemas", () => {
  describe("CreateUserSchema", () => {
    it("should validate correct user data", () => {
      const validData = {
        username: "testuser",
        email: "test@example.com",
        password: "Password123!",
        firstName: "Test",
        lastName: "User",
      };

      const result = CreateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const invalidData = {
        username: "testuser",
        email: "not-an-email",
        password: "Password123!",
      };

      const result = CreateUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject short username", () => {
      const invalidData = {
        username: "ab",
        email: "test@example.com",
        password: "Password123!",
      };

      const result = CreateUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject weak password", () => {
      const invalidData = {
        username: "testuser",
        email: "test@example.com",
        password: "12345",
      };

      const result = CreateUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("UpdateUserSchema", () => {
    it("should validate correct update data without password", () => {
      const validData = {
        username: "updateduser",
        email: "updated@example.com",
        firstName: "Updated",
        lastName: "User",
      };

      const result = UpdateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should validate with optional password", () => {
      const validData = {
        username: "updateduser",
        email: "updated@example.com",
        password: "NewPassword123!",
      };

      const result = UpdateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const invalidData = {
        username: "updateduser",
        email: "invalid-email",
      };

      const result = UpdateUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
