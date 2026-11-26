import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs";

describe("Tabs", () => {
  it("renders tabs and switches active tab", async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">
          <div data-testid="tab1-content">Tab 1 Content</div>
        </TabsContent>
        <TabsContent value="tab2">
          <div data-testid="tab2-content">Tab 2 Content</div>
        </TabsContent>
      </Tabs>
    );
    expect(screen.getByText("Tab 1")).toBeInTheDocument();
    expect(screen.getByTestId("tab1-content")).toBeInTheDocument();
    expect(screen.queryByTestId("tab2-content")).not.toBeInTheDocument();

    await user.click(screen.getByText("Tab 2"));
    expect(screen.queryByTestId("tab1-content")).not.toBeInTheDocument();
    expect(screen.getByTestId("tab2-content")).toBeInTheDocument();
  });

  it("throws when TabsTrigger is used outside Tabs", () => {
    expect(() => render(<TabsTrigger value="x">bad</TabsTrigger>)).toThrow(
      /TabsTrigger must be used within Tabs/,
    );
  });

  it("throws when TabsContent is used outside Tabs", () => {
    expect(() => render(<TabsContent value="x">bad</TabsContent>)).toThrow(
      /TabsContent must be used within Tabs/,
    );
  });
});
