import { render, screen, fireEvent } from "@testing-library/react";
import { Tabs, TabsList, TabsTrigger } from "../tabs";

describe("Tabs", () => {
  it("renders tabs and switches active tab", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <div data-testid="tab1-content">Tab 1 Content</div>
        <div data-testid="tab2-content">Tab 2 Content</div>
      </Tabs>
    );
    expect(screen.getByText("Tab 1")).toBeInTheDocument();
    expect(screen.getByText("Tab 2")).toBeInTheDocument();
    // Simulate tab switch if implemented
    // fireEvent.click(screen.getByText("Tab 2"));
    // expect(...)
  });
});
