import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { JsonCell, JsonViewer } from "../json-viewer";

describe("JsonViewer", () => {
  it("renders empty label for null value", () => {
    render(<JsonViewer value={null} emptyLabel="Empty" />);
    expect(screen.getByText("Empty")).toBeInTheDocument();
  });

  it("renders empty label for blank string", () => {
    render(<JsonViewer value="   " />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("pretty-prints valid JSON", () => {
    render(<JsonViewer value='{"email":"test@example.com"}' />);
    expect(screen.getByText(/"email"/)).toBeInTheDocument();
    expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
  });

  it("renders plain text when JSON parsing fails", () => {
    render(<JsonViewer value="not-json" />);
    expect(screen.getByText("not-json")).toBeInTheDocument();
  });

  it("applies compact class when compact is true", () => {
    const { container } = render(
      <JsonViewer value='{"a":1}' compact className="custom-class" />,
    );
    const pre = container.querySelector("pre");
    expect(pre).toHaveClass("max-h-32");
    expect(pre).toHaveClass("custom-class");
  });
});

describe("JsonCell", () => {
  it("renders dash for null or empty values", () => {
    const { rerender } = render(<JsonCell value={null} />);
    expect(screen.getByText("—")).toBeInTheDocument();

    rerender(<JsonCell value="" />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders inline text for short plain values", () => {
    render(<JsonCell value="Active" />);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("renders compact JSON viewer for long values", () => {
    const longValue = "x".repeat(81);
    render(<JsonCell value={longValue} compactThreshold={80} />);
    expect(screen.getByText(longValue)).toBeInTheDocument();
  });

  it("renders compact JSON viewer for JSON-shaped values", () => {
    render(<JsonCell value='{"status":"Active"}' />);
    expect(screen.getByText(/"status"/)).toBeInTheDocument();
  });
});
