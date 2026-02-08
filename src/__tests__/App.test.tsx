import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import App from "../App";

// Mock matchMedia which is used by Radix/Theme context
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe("App", () => {
  it("should render without crashing", () => {
    // We expect it to render. Since it's a top level component, 
    // we just check if it doesn't throw.
    const { container } = render(<App />);
    expect(container).toBeDefined();
  });
});
