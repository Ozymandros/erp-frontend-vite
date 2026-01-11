import { describe, it, expect } from "vitest";
import {
  LoginSchema,
  RegisterSchema,
} from "@/lib/validation/auth.schemas";

describe("Auth Validation Schemas", () => {
  describe("LoginSchema", () => {
    it("should validate correct login data", () => {
      const validData = {
        email: "test@example.com",
        password: "password123",
      };

      const result = LoginSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it("should reject invalid email", () => {
      const invalidData = {
        email: "not-an-email",
        password: "password123",
      };

      const result = LoginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject empty email", () => {
      const invalidData = {
        email: "",
        password: "password123",
      };

      const result = LoginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject short password", () => {
      const invalidData = {
        email: "test@example.com",
        password: "12345", // Less than 6 characters
      };

      const result = LoginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("at least 6");
      }
    });

    it("should reject password exceeding max length", () => {
      const invalidData = {
        email: "test@example.com",
        password: "a".repeat(101), // More than 100 characters
      };

      const result = LoginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("RegisterSchema", () => {
    it("should validate correct registration data", () => {
      const validData = {
        email: "test@example.com",
        username: "testuser",
        password: "password123",
        passwordConfirm: "password123",
        firstName: "Test",
        lastName: "User",
      };

      const result = RegisterSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should validate with optional fields empty", () => {
      const validData = {
        email: "test@example.com",
        username: "testuser",
        password: "password123",
        passwordConfirm: "password123",
        firstName: "",
        lastName: "",
      };

      const result = RegisterSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject when passwords do not match", () => {
      const invalidData = {
        email: "test@example.com",
        username: "testuser",
        password: "password123",
        passwordConfirm: "differentpassword",
        firstName: "Test",
        lastName: "User",
      };

      const result = RegisterSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const passwordConfirmError = result.error.issues.find(
          (issue) => issue.path.includes("passwordConfirm")
        );
        expect(passwordConfirmError?.message).toContain("do not match");
      }
    });

    it("should reject short username", () => {
      const invalidData = {
        email: "test@example.com",
        username: "ab", // Less than 3 characters
        password: "password123",
        passwordConfirm: "password123",
      };

      const result = RegisterSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject long username", () => {
      const invalidData = {
        email: "test@example.com",
        username: "a".repeat(101), // More than 100 characters
        password: "password123",
        passwordConfirm: "password123",
      };

      const result = RegisterSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
