import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Input } from "../input";

describe("Input", () => {
  it("renders input element", () => {
    const { getByRole } = render(<Input placeholder="Type here" />);
    expect(getByRole("textbox")).toBeInTheDocument();
  });
});
