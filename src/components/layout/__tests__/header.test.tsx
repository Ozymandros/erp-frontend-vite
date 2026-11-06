import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Header } from "../header";
import { MemoryRouter } from "react-router-dom";
import { useAuth } from "@/contexts/auth.context";

// Mock useAuth
vi.mock("@/contexts/auth.context", () => ({
  useAuth: vi.fn(),
}));

describe("Header", () => {
  const mockUser = {
    username: "jdoe",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    isAdmin: false,
  };

  it("should render user initials", () => {
    vi.mocked(useAuth).mockReturnValue({ user: mockUser, logout: vi.fn() } as never);
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("should handle missing user info gracefully", () => {
    vi.mocked(useAuth).mockReturnValue({ user: { username: "guest" }, logout: vi.fn() } as never);
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    expect(screen.getByText("GU")).toBeInTheDocument();
  });

  it("should render initials for single name", () => {
     vi.mocked(useAuth).mockReturnValue({ user: { username: "admin" }, logout: vi.fn() } as never);
     render(
       <MemoryRouter>
         <Header />
       </MemoryRouter>
     );
     expect(screen.getByText("AD")).toBeInTheDocument();
  });

  it("shows display name from first and last name when menu is opened", async () => {
    const user = userEvent.setup();
    vi.mocked(useAuth).mockReturnValue({
      user: {
        ...mockUser,
        email: "john@example.com",
      },
      logout: vi.fn(),
    } as never);
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: /user menu/i }));

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
  });
});
