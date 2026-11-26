import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AppLayout } from "../app-layout";

vi.mock("../sidebar", () => ({
  Sidebar: () => <div data-testid="sidebar" />,
}));
vi.mock("../header", () => ({
  Header: () => <div data-testid="header" />,
}));

describe("AppLayout", () => {
  it("renders sidebar, header, and outlet", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<span>child</span>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByText("child")).toBeInTheDocument();
  });
});
