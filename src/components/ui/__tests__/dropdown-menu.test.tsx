import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu";

describe("DropdownMenu primitives", () => {
  it("renders label, separator, and item in the open menu", async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger type="button">Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Section</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>First action</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    await user.click(screen.getByRole("button", { name: /open/i }));

    expect(await screen.findByText("Section")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /first action/i })).toBeInTheDocument();
  });
});
