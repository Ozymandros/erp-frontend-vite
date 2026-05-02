import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { InvoiceFilterHeader } from "../invoice-filter-header";

describe("InvoiceFilterHeader", () => {
  it("renders select with filter label", () => {
    const onStatusChange = vi.fn();
    render(<InvoiceFilterHeader onStatusChange={onStatusChange} />);

    expect(screen.getByLabelText("Filter by invoice status")).toBeDefined();
  });

  it("renders with All statuses placeholder", () => {
    const onStatusChange = vi.fn();
    render(<InvoiceFilterHeader onStatusChange={onStatusChange} />);

    expect(screen.getByText("All statuses")).toBeDefined();
  });

  it("displays current status value when provided", () => {
    const onStatusChange = vi.fn();
    render(<InvoiceFilterHeader status="Issued" onStatusChange={onStatusChange} />);

    expect(screen.getByText("Issued")).toBeDefined();
  });

  it("displays Paid status when provided", () => {
    const onStatusChange = vi.fn();
    render(<InvoiceFilterHeader status="Paid" onStatusChange={onStatusChange} />);

    expect(screen.getByText("Paid")).toBeDefined();
  });

  it("displays Cancelled status when provided", () => {
    const onStatusChange = vi.fn();
    render(<InvoiceFilterHeader status="Cancelled" onStatusChange={onStatusChange} />);

    expect(screen.getByText("Cancelled")).toBeDefined();
  });
});