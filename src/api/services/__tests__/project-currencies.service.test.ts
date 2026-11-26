import { describe, it, expect, vi, beforeEach } from "vitest";

const mockApiClient = { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() };

vi.mock("@/api/clients", () => ({
  getApiClient: () => mockApiClient,
}));

const { projectCurrenciesService } = await import(
  "@/api/services/project-currencies.service"
);

describe("ProjectCurrenciesService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("getCurrencies calls base endpoint", async () => {
    mockApiClient.get.mockResolvedValue([]);
    await projectCurrenciesService.getCurrencies();
    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/projects/api/projects/currencies"
    );
  });

  it("covers currency CRUD, rates, exchange rates, exports", async () => {
    mockApiClient.get.mockResolvedValue({ code: "EUR" });
    await projectCurrenciesService.getCurrencyByCode("eur");
    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/projects/api/projects/currencies/eur"
    );

    mockApiClient.post.mockResolvedValue({ code: "EUR" });
    await projectCurrenciesService.createCurrency({
      code: "EUR",
      description: "Euro",
    });
    expect(mockApiClient.post).toHaveBeenCalledWith(
      "/projects/api/projects/currencies",
      expect.any(Object)
    );

    mockApiClient.put.mockResolvedValue({ code: "EUR" });
    await projectCurrenciesService.updateCurrency("EUR", {
      code: "EUR",
      description: "Euro",
    });
    expect(mockApiClient.put).toHaveBeenCalledWith(
      "/projects/api/projects/currencies/EUR",
      expect.any(Object)
    );

    mockApiClient.delete.mockResolvedValue(undefined);
    await projectCurrenciesService.deleteCurrency("EUR");
    expect(mockApiClient.delete).toHaveBeenCalledWith(
      "/projects/api/projects/currencies/EUR"
    );

    mockApiClient.get.mockResolvedValue(1);
    await projectCurrenciesService.getRate("USD");
    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/projects/api/projects/currencies/USD/rate",
      { params: undefined }
    );
    await projectCurrenciesService.getRate("USD", "2024-01-01");
    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/projects/api/projects/currencies/USD/rate",
      { params: { date: "2024-01-01" } }
    );

    mockApiClient.post.mockResolvedValue({});
    await projectCurrenciesService.createExchangeRate("USD", {
      startingDate: "2024-01-01",
      rateToLocal: 1.1,
    });
    expect(mockApiClient.post).toHaveBeenCalledWith(
      "/projects/api/projects/currencies/USD/exchange-rates",
      expect.any(Object)
    );

    mockApiClient.delete.mockResolvedValue(undefined);
    await projectCurrenciesService.deleteExchangeRate("USD", "rate-1");
    expect(mockApiClient.delete).toHaveBeenCalledWith(
      "/projects/api/projects/currencies/USD/exchange-rates/rate-1"
    );

    mockApiClient.get.mockResolvedValue(new Blob());
    await projectCurrenciesService.exportToXlsx();
    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/projects/api/projects/currencies/export-xlsx",
      { responseType: "blob" }
    );
    await projectCurrenciesService.exportToPdf();
    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/projects/api/projects/currencies/export-pdf",
      { responseType: "blob" }
    );
  });
});
