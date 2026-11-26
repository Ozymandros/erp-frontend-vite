import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../card";

describe("Card", () => {
  it("renders structure with title, description, content, footer", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Desc</CardDescription>
        </CardHeader>
        <CardContent>Body</CardContent>
        <CardFooter>Foot</CardFooter>
      </Card>,
    );
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Desc")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
    expect(screen.getByText("Foot")).toBeInTheDocument();
  });

  it("renders nothing for CardTitle when there are no children", () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle />
        </CardHeader>
      </Card>,
    );
    expect(container.querySelector("h3")).toBeNull();
  });
});
