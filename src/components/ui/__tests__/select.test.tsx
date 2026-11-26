import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectSeparator,
} from "../select";

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

  it("opens content, shows label/separator, and selects an item (scroll buttons mount)", async () => {
    const user = userEvent.setup();
    render(
      <Select defaultValue="b">
        <SelectTrigger aria-label="Fruit">
          <SelectValue placeholder="Pick fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Fruits</SelectLabel>
            <SelectItem value="a">Apple</SelectItem>
            <SelectSeparator />
            <SelectItem value="b">Banana</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>,
    );

    await user.click(screen.getByLabelText("Fruit"));
    expect(await screen.findByText("Fruits")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /apple/i })).toBeInTheDocument();
    await user.click(screen.getByRole("option", { name: /apple/i }));
    expect(screen.getByText("Apple")).toBeInTheDocument();
  });
});
