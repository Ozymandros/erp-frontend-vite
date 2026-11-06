import { describe, it, expect } from "vitest";
import {
  CreateProjectSchema,
  ChangeProjectStatusSchema,
} from "@/lib/validation/projects/project.schemas";
import { ProjectStatus } from "@/types/api.types";

describe("project.schemas", () => {
  it("validates create project", () => {
    const result = CreateProjectSchema.safeParse({
      description: "Demo",
      customerId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });

  it("validates status change", () => {
    const result = ChangeProjectStatusSchema.safeParse({
      status: ProjectStatus.Open,
    });
    expect(result.success).toBe(true);
  });
});
