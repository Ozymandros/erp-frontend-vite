import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from "../theme-toggle";
import { ThemeProvider } from "@/contexts/theme.context";

// ... (mocks remain the same) ... //

// Mock localStorage and matchMedia are outside in the file, but replace checks target content.
// Since I can't match across large blocks easily without context, I will target specific blocks.
// Wait, replace_file_content requires precise TargetContent. 
// I will just replace the import and the test function separately.

// Actually, I'll do it in one go if I can match the surrounding lines.
// But earlier failure suggests caution. I will use multi_replace_file_content.
// Wait, I am using replace_file_content tool here. I should use multi_replace_file_content for multiple chunks.

// Mock localStorage
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

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
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
  it("should render toggle button", () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
    
    expect(screen.getByRole("button", { name: /toggle theme/i })).toBeInTheDocument();
  });

  it("should change theme when option is clicked", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = userEvent.setup() as any;
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    const button = screen.getByRole("button", { name: /toggle theme/i });
    await user.click(button);

    // Wait for dropdown to be fully open/rendered
    const darkOption = await screen.findByText("Dark");
    await user.click(darkOption);
    
    await waitFor(() => {
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });
  });
});
