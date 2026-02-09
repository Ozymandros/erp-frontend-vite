import { describe, it, expect } from "vitest";
import { optionalString, phoneValidation, optionalEmail } from "../base.schemas";

describe("optionalString", () => {
  it("returns undefined for empty string", () => {
    const schema = optionalString(100, "Too long");
    const result = schema.safeParse("");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBeUndefined();
    }
  });

  it("returns undefined for whitespace-only string", () => {
    const schema = optionalString(100, "Too long");
    const result = schema.safeParse("   ");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBeUndefined();
    }
  });

  it("returns undefined for null/undefined", () => {
    const schema = optionalString(100, "Too long");
    const result = schema.safeParse(null);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBeUndefined();
    }
  });

  it("trims and returns valid string", () => {
    const schema = optionalString(100, "Too long");
    const result = schema.safeParse("  hello  ");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("hello");
    }
  });

  it("fails on string exceeding max length", () => {
    const schema = optionalString(5, "Too long");
    const result = schema.safeParse("toolong");
    expect(result.success).toBe(false);
  });

  it("handles non-string input (hits : val branch)", () => {
    const schema = optionalString(100, "Too long");
    const result = schema.safeParse(123);
    expect(result.success).toBe(false); // Because union only accepts string or undefined
  });
});

describe("phoneValidation", () => {
  it("returns undefined for empty string", () => {
    const result = phoneValidation.safeParse("");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBeUndefined();
    }
  });

  it("handles non-string input (hits : val branch)", () => {
    const result = phoneValidation.safeParse(123);
    expect(result.success).toBe(false);
  });

  it("validates US phone format (xxx) xxx-xxxx", () => {
    const result = phoneValidation.safeParse("(555) 123-4567");
    expect(result.success).toBe(true);
  });

  it("validates US phone format xxx-xxx-xxxx", () => {
    const result = phoneValidation.safeParse("555-123-4567");
    expect(result.success).toBe(true);
  });

  it("validates international phone format +xx xxx xxx xxx", () => {
    const result = phoneValidation.safeParse("+34 912 345 678");
    expect(result.success).toBe(true);
  });

  it("validates local formats (hits line 57)", () => {
    const result = phoneValidation.safeParse("912345678"); // 9 digits
    expect(result.success).toBe(true);
  });

  it("rejects invalid phone with letters", () => {
    const result = phoneValidation.safeParse("555-ABC-1234");
    expect(result.success).toBe(false);
  });

  it("rejects phone with too few digits", () => {
    const result = phoneValidation.safeParse("12345");
    expect(result.success).toBe(false);
  });
});

describe("optionalEmail", () => {
  it("returns undefined for empty string", () => {
    const result = optionalEmail.safeParse("");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBeUndefined();
    }
  });

  it("handles non-string input (hits : val branch)", () => {
    const result = optionalEmail.safeParse(123);
    expect(result.success).toBe(false);
  });

  it("returns undefined for whitespace-only string", () => {
    const result = optionalEmail.safeParse("   ");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBeUndefined();
    }
  });

  it("validates valid email", () => {
    const result = optionalEmail.safeParse("test@example.com");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("test@example.com");
    }
  });

  it("trims and validates email", () => {
    const result = optionalEmail.safeParse("  test@example.com  ");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("test@example.com");
    }
  });

  it("rejects invalid email format", () => {
    const result = optionalEmail.safeParse("not-an-email");
    expect(result.success).toBe(false);
  });

  it("rejects email exceeding max length", () => {
    const result = optionalEmail.safeParse("a".repeat(250) + "@example.com");
    expect(result.success).toBe(false);
  });
});
