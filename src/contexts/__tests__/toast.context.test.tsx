import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
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
      <button onClick={() => toast.warning("Warning")}>Show warning</button>
      <button onClick={() => toast.clear()}>Clear</button>
    </div>
  );
}

describe("ToastContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw when useToast is used outside provider", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      expect(() => render(<TestConsumer />)).toThrow(
        "useToast must be used within a ToastContextProvider"
      );
    } finally {
      consoleSpy.mockRestore();
    }
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

  it("should show info and warning toasts", async () => {
    render(
      <ToastContextProvider>
        <TestConsumer />
      </ToastContextProvider>
    );

    await userEvent.click(screen.getByText("Show info"));
    await waitFor(() => expect(screen.getByText("Info")).toBeInTheDocument());

    await userEvent.click(screen.getByText("Show warning"));
    await waitFor(() => expect(screen.getByText("Warning")).toBeInTheDocument());
  });

  it("should intercept API client errors", async () => {
    const mockClient = { onError: null as any };
    const { getApiClient } = await import("@/api/clients");
    vi.mocked(getApiClient).mockReturnValue(mockClient as any);

    render(
      <ToastContextProvider>
        <TestConsumer />
      </ToastContextProvider>
    );

    expect(mockClient.onError).toBeTypeOf("function");

    // Trigger mocked error
    await act(async () => {
      mockClient.onError({ message: "API Failed", status: 500 });
    });

    await waitFor(() => {
      expect(screen.getByText("Error 500")).toBeInTheDocument();
      expect(screen.getByText("API Failed")).toBeInTheDocument();
    });
  });

  it("should handle API errors without status", async () => {
    const mockClient = { onError: null as any };
    const { getApiClient } = await import("@/api/clients");
    vi.mocked(getApiClient).mockReturnValue(mockClient as any);

    render(
      <ToastContextProvider>
        <TestConsumer />
      </ToastContextProvider>
    );

    await act(async () => {
      mockClient.onError({ message: "Network Error" });
    });

    await waitFor(() => {
      expect(screen.getByText("Error")).toBeInTheDocument();
      expect(screen.getByText("Network Error")).toBeInTheDocument();
    });
  });

  it("should cleanup registerToastApi on unmount", async () => {
    vi.mock("../toast.service", () => ({
      registerToastApi: vi.fn(),
    }));

    const { unmount } = render(
      <ToastContextProvider>
        <div />
      </ToastContextProvider>
    );

    const { registerToastApi: mockedRegister } = await import("../toast.service");
    expect(mockedRegister).toHaveBeenCalledWith(expect.anything());

    unmount();
    expect(mockedRegister).toHaveBeenLastCalledWith(null);
  });
});
