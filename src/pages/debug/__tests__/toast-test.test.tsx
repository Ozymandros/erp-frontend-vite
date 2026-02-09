import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import ToastTestPage from "../toast-test";

vi.mock("@/api/clients", () => ({
  getApiClient: vi.fn(() => ({
    get: vi.fn().mockRejectedValue(new Error("Not found")),
  })),
}));

const mockSuccess = vi.fn();
const mockError = vi.fn();
vi.mock("@/contexts/toast.context", () => ({
  useToast: () => ({
    success: mockSuccess,
    error: mockError,
  }),
}));

describe("ToastTestPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render toast debug page", () => {
    render(
      <MemoryRouter>
        <ToastTestPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Toast debug")).toBeInTheDocument();
  });

  it("should have Show success button that calls toast.success on click", async () => {
    render(
      <MemoryRouter>
        <ToastTestPage />
      </MemoryRouter>
    );

    const successBtn = screen.getByRole("button", { name: /show success/i });
    await userEvent.click(successBtn);

    expect(mockSuccess).toHaveBeenCalledWith("Manual success", "This is a test");
  });

  it("should have Show error button that calls toast.error on click", async () => {
    render(
      <MemoryRouter>
        <ToastTestPage />
      </MemoryRouter>
    );

    const errorBtn = screen.getByRole("button", { name: /show error/i });
    await userEvent.click(errorBtn);

    expect(mockError).toHaveBeenCalledWith("Manual error", "This is a test");
  });

  it("should have Trigger API error button", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <MemoryRouter>
        <ToastTestPage />
      </MemoryRouter>
    );

    const apiBtn = screen.getByRole("button", { name: /trigger api error/i });
    await userEvent.click(apiBtn);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });
});
