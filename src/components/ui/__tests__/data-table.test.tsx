import { render, screen } from "@testing-library/react";
import { DataTable } from "../data-table";
import { it, expect } from "vitest";
import { describe } from "zod";

describe("DataTable", () => {
  const columns = [
    { header: "Name", accessor: "name" as const },
    { header: "Age", accessor: "age" as const },
  ];
  const data = [
    { name: "Alice", age: 30 },
    { name: "Bob", age: 25 },
  ];

  it("renders table headers and rows", () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Age")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
  });

  it("shows empty message when no data", () => {
    render(<DataTable columns={columns} data={[]} emptyMessage="Nothing here" />);
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });

  it("shows loading spinner when loading", () => {
    render(<DataTable columns={columns} data={[]} isLoading />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
