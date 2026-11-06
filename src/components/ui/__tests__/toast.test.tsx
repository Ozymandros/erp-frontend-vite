import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { ToastCard } from "../toast";
import type { ToastItem } from "@/contexts/toast.types";

function renderToast(toast: ToastItem) {
  const onClose = vi.fn();
  const view = render(
    <ToastPrimitive.Provider swipeDirection="right">
      <ToastPrimitive.Viewport className="fixed bottom-0 right-0" />
      <ToastCard toast={toast} onClose={onClose} />
    </ToastPrimitive.Provider>,
  );
  return { onClose, ...view };
}

describe("ToastCard", () => {
  it("renders success variant with title and description", () => {
    renderToast({
      id: "t1",
      type: "success",
      title: "Saved",
      description: "Your changes were saved.",
    });
    expect(screen.getByText("Saved")).toBeInTheDocument();
    expect(screen.getByText("Your changes were saved.")).toBeInTheDocument();
  });

  it("covers warning, error, and default icon branches", () => {
    const { rerender } = renderToast({
      id: "w",
      type: "warning",
      title: "Heads up",
    });
    expect(screen.getByText("Heads up")).toBeInTheDocument();

    rerender(
      <ToastPrimitive.Provider swipeDirection="right">
        <ToastPrimitive.Viewport className="fixed bottom-0 right-0" />
        <ToastCard toast={{ id: "e", type: "error", title: "Failed" }} onClose={vi.fn()} />
      </ToastPrimitive.Provider>,
    );
    expect(screen.getByText("Failed")).toBeInTheDocument();

    rerender(
      <ToastPrimitive.Provider swipeDirection="right">
        <ToastPrimitive.Viewport className="fixed bottom-0 right-0" />
        <ToastCard toast={{ id: "i", type: "info", title: "FYI" }} onClose={vi.fn()} />
      </ToastPrimitive.Provider>,
    );
    expect(screen.getByText("FYI")).toBeInTheDocument();
  });

  it("calls onClose when the toast closes and when Close is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <ToastPrimitive.Provider swipeDirection="right" duration={Infinity}>
        <ToastPrimitive.Viewport className="fixed bottom-0 right-0" />
        <ToastCard toast={{ id: "x", type: "success", title: "Hey" }} onClose={onClose} />
      </ToastPrimitive.Provider>,
    );

    const closeBtn = screen.getByRole("button", { name: /close/i });
    await user.click(closeBtn);
    expect(onClose).toHaveBeenCalledWith("x");
  });
});
