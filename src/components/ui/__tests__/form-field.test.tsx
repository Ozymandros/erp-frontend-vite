import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormField } from "../form-field";

describe("FormField", () => {
  it("renders input with label", () => {
    render(<FormField label="Name" name="name" />);
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
  });

  it("renders textarea when type is textarea", () => {
    render(<FormField label="Bio" name="bio" type="textarea" />);
    expect(screen.getByLabelText("Bio")).toBeInTheDocument();
  });

  it("renders select when type is select", () => {
    render(
      <FormField label="Role" name="role" type="select">
        <option value="admin">Admin</option>
      </FormField>
    );
    expect(screen.getByLabelText("Role")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });
});
