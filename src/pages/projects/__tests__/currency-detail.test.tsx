import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { CurrencyDetailPage } from "../currency-detail";
import { projectCurrenciesService } from "@/api/services/project-currencies.service";
import { useModulePermissions } from "@/hooks/use-permissions";

vi.mock("@/api/services/project-currencies.service", () => ({
  projectCurrenciesService: {
    getCurrencyByCode: vi.fn(),
    deleteExchangeRate: vi.fn(),
  },
}));

vi.mock("@/hooks/use-permissions", () => ({
  useModulePermissions: vi.fn(),
}));

vi.mock("@/components/projects/create-exchange-rate-dialog", () => ({
  CreateExchangeRateDialog: (props: { open: boolean }) =>
    props.open ? <div data-testid="create-rate-dialog" /> : null,
}));

const fullPerms = {
  canCreate: false,
  canRead: true,
  canUpdate: true,
  canDelete: false,
  canExport: false,
  canExecute: false,
};

const readOnlyPerms = {
  canCreate: false,
  canRead: true,
  canUpdate: false,
  canDelete: false,
  canExport: false,
  canExecute: false,
};

describe("CurrencyDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows empty rates and add button when canUpdate", async () => {
    vi.mocked(useModulePermissions).mockReturnValue(fullPerms);

    vi.mocked(projectCurrenciesService.getCurrencyByCode).mockResolvedValue({
      id: "c1",
      code: "EUR",
      description: "Euro",
      isLocalCurrency: true,
      exchangeRates: [],
      createdAt: "2024-01-01T00:00:00Z",
      createdBy: "system",
    });

    render(
      <MemoryRouter initialEntries={["/projects/currencies/EUR"]}>
        <Routes>
          <Route path="/projects/currencies/:code" element={<CurrencyDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/EUR — Euro/)).toBeInTheDocument();
    });
    expect(screen.getByText("No rates")).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /add rate/i }));
    expect(screen.getByTestId("create-rate-dialog")).toBeInTheDocument();
  });

  it("renders rate list and remove when canUpdate", async () => {
    vi.mocked(useModulePermissions).mockReturnValue(fullPerms);

    vi.mocked(projectCurrenciesService.getCurrencyByCode).mockResolvedValue({
      id: "c1",
      code: "USD",
      description: "Dollar",
      isLocalCurrency: false,
      exchangeRates: [
        {
          id: "r1",
          currencyId: "c1",
          startingDate: "2024-01-15T00:00:00Z",
          rateToLocal: 1.1,
          createdAt: "2024-01-01T00:00:00Z",
          createdBy: "system",
        },
      ],
      createdAt: "2024-01-01T00:00:00Z",
      createdBy: "system",
    });
    vi.mocked(projectCurrenciesService.deleteExchangeRate).mockResolvedValue(undefined);

    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/projects/currencies/USD"]}>
        <Routes>
          <Route path="/projects/currencies/:code" element={<CurrencyDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("1.1")).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: /remove/i }));
    await waitFor(() => {
      expect(projectCurrenciesService.deleteExchangeRate).toHaveBeenCalledWith("USD", "r1");
    });
  });

  it("hides add rate without canUpdate", async () => {
    vi.mocked(useModulePermissions).mockReturnValue(readOnlyPerms);

    vi.mocked(projectCurrenciesService.getCurrencyByCode).mockResolvedValue({
      id: "c1",
      code: "CHF",
      description: "Franc",
      isLocalCurrency: false,
      exchangeRates: [
        {
          id: "r1",
          currencyId: "c1",
          startingDate: "2024-01-15T00:00:00Z",
          rateToLocal: 0.9,
          createdAt: "2024-01-01T00:00:00Z",
          createdBy: "system",
        },
      ],
      createdAt: "2024-01-01T00:00:00Z",
      createdBy: "system",
    });

    render(
      <MemoryRouter initialEntries={["/projects/currencies/CHF"]}>
        <Routes>
          <Route path="/projects/currencies/:code" element={<CurrencyDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/CHF/)).toBeInTheDocument();
    });
    expect(screen.queryByRole("button", { name: /add rate/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /remove/i })).not.toBeInTheDocument();
  });
});
