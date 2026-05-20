import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from "../theme-toggle";
import { ThemeProvider } from "@/contexts/theme.context";

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe("ThemeToggle", () => {
  beforeEach(() => {
    localStorageMock.clear();
    document.documentElement.classList.remove("light", "dark");
  });

  it("should render toggle button", async () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /toggle theme/i })).toBeInTheDocument();
    });
  });

  it("should change theme when option is clicked", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = userEvent.setup() as any;
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    const button = await screen.findByRole("button", { name: /toggle theme/i });
    await user.click(button);

    const darkOption = await screen.findByRole("menuitem", { name: /dark/i });
    await user.click(darkOption);

    await waitFor(() => {
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });
  });

  it("should mark the active theme in the menu", async () => {
    localStorageMock.setItem("vite-ui-theme", "light");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = userEvent.setup() as any;
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    const button = await screen.findByRole("button", { name: /toggle theme/i });
    await user.click(button);

    const lightOption = await screen.findByRole("menuitem", { name: /light/i });
    expect(lightOption).toHaveAttribute("aria-current", "true");
  });
});
