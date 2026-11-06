import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { CurrenciesListPage } from "../currencies-list";
import { projectCurrenciesService } from "@/api/services/project-currencies.service";
import type { ProjectCurrencyDto } from "@/types/api.types";
import { useModulePermissions } from "@/hooks/use-permissions";

vi.mock("@/api/services/project-currencies.service", () => ({
  projectCurrenciesService: {
    getCurrencies: vi.fn(),
  },
}));

vi.mock("@/components/projects/create-currency-dialog", () => ({
  CreateCurrencyDialog: (props: { open: boolean }) =>
    props.open ? <div data-testid="create-currency-dialog">open</div> : null,
}));

vi.mock("@/hooks/use-permissions", () => ({
  useModulePermissions: vi.fn(),
}));

const mockCurrencies: ProjectCurrencyDto[] = [
  {
    id: "c1",
    code: "EUR",
    description: "Euro",
    isLocalCurrency: true,
    exchangeRates: [],
    createdAt: "2024-01-01T00:00:00Z",
    createdBy: "system",
  },
  {
    id: "c2",
    code: "USD",
    description: "Dollar",
    symbol: "$",
    isLocalCurrency: false,
    exchangeRates: [],
    createdAt: "2024-01-01T00:00:00Z",
    createdBy: "system",
  },
];

describe("CurrenciesListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(projectCurrenciesService.getCurrencies).mockResolvedValue(mockCurrencies);
    vi.mocked(useModulePermissions).mockReturnValue({
      canCreate: true,
      canRead: true,
      canUpdate: true,
      canDelete: true,
      canExport: true,
      canExecute: false,
    });
  });

  it("lists currencies and opens create dialog", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <CurrenciesListPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole("link", { name: "EUR" })).toBeInTheDocument();
    });
    const eurRow = screen.getByRole("link", { name: "EUR" }).closest("tr");
    expect(eurRow).toBeTruthy();
    expect(within(eurRow as HTMLElement).getByText("Local")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /add currency/i }));
    expect(screen.getByTestId("create-currency-dialog")).toBeInTheDocument();
  });
});
