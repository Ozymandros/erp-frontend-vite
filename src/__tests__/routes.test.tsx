import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AppRoutes } from "../routes";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth.context";

describe("AppRoutes", () => {
  it("should render routes", () => {
    // We just check if it renders the router structure
    const { container } = render(
      <MemoryRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>
    );
    expect(container).toBeDefined();
  });
});
