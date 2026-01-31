import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToastContextProvider, useToast } from "../toast.context";

vi.mock("@/api/clients", () => ({
  getApiClient: vi.fn(() => null),
}));

function TestConsumer() {
  const toast = useToast();
  return (
    <div>
      <button onClick={() => toast.success("Done!")}>Show success</button>
      <button onClick={() => toast.error("Error!")}>Show error</button>
      <button onClick={() => toast.info("Info")}>Show info</button>
      <button onClick={() => toast.clear()}>Clear</button>
    </div>
  );
}

describe("ToastContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw when useToast is used outside provider", () => {
    expect(() => render(<TestConsumer />)).toThrow(
      "useToast must be used within a ToastContextProvider"
    );
  });

  it("should provide toast api when wrapped in provider", async () => {
    render(
      <ToastContextProvider>
        <TestConsumer />
      </ToastContextProvider>
    );

    expect(screen.getByText("Show success")).toBeInTheDocument();
    await userEvent.click(screen.getByText("Show success"));

    await waitFor(() => {
      expect(screen.getByText("Done!")).toBeInTheDocument();
    });
  });

  it("should show error toast", async () => {
    render(
      <ToastContextProvider>
        <TestConsumer />
      </ToastContextProvider>
    );

    await userEvent.click(screen.getByText("Show error"));

    await waitFor(() => {
      expect(screen.getByText("Error!")).toBeInTheDocument();
    });
  });

  it("should clear toasts", async () => {
    render(
      <ToastContextProvider>
        <TestConsumer />
      </ToastContextProvider>
    );

    await userEvent.click(screen.getByText("Show success"));
    await waitFor(() => expect(screen.getByText("Done!")).toBeInTheDocument());

    await userEvent.click(screen.getByText("Clear"));
    await waitFor(() => {
      expect(screen.queryByText("Done!")).not.toBeInTheDocument();
    });
  });

  it("should return id from show", async () => {
    let capturedId: string | null = null;
    function CaptureId() {
      const toast = useToast();
      return (
        <button
          onClick={() => {
            capturedId = toast.show({ title: "Test" });
          }}
        >
          Show
        </button>
      );
    }

    render(
      <ToastContextProvider>
        <CaptureId />
      </ToastContextProvider>
    );

    await userEvent.click(screen.getByText("Show"));
    expect(capturedId).toBeTruthy();
    expect(typeof capturedId).toBe("string");
  });
});
