import { describe, it, expect } from "vitest";
import { z } from "zod";
import { parseZodErrors } from "../zod-utils";

const TestSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().pipe(z.email({ message: "Invalid email" })),
  age: z.number().min(18, "Must be 18+"),
});

describe("parseZodErrors", () => {
  it("converts Zod error to field-keyed record", () => {
    const result = TestSchema.safeParse({
      name: "",
      email: "not-an-email",
      age: 10,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = parseZodErrors(result.error);
      expect(errors).toHaveProperty("name", "Name is required");
      expect(errors).toHaveProperty("email", "Invalid email");
      expect(errors).toHaveProperty("age", "Must be 18+");
    }
  });

  it("returns empty object for valid data", () => {
    const result = TestSchema.safeParse({
      name: "Test",
      email: "test@example.com",
      age: 25,
    });
    expect(result.success).toBe(true);
  });

  it("skips issues without path", () => {
    const schema = z.object({ x: z.number() });
    const result = schema.safeParse({ x: "invalid" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = parseZodErrors(result.error);
      expect(errors).toHaveProperty("x");
    }
  });
});