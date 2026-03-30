import { render, screen } from "@testing-library/react";
import { Select, SelectTrigger, SelectValue } from "../select";

describe("Select", () => {
  it("renders select trigger", () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Choose..." />
        </SelectTrigger>
      </Select>
    );
    expect(screen.getByText("Choose...")).toBeInTheDocument();
  });
});
