import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("api clients index (factory & singleton)", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("createApiClient returns AxiosApiClient when VITE_USE_DAPR is not true", async () => {
    vi.stubEnv("VITE_USE_DAPR", "false");
    vi.stubEnv("VITE_API_BASE_URL", "http://localhost:5000");
    const { createApiClient } = await import("../index");
    const client = createApiClient();
    expect(client.constructor.name).toBe("AxiosApiClient");
  });

  it("createApiClient returns DaprHttpClient when VITE_USE_DAPR is true", async () => {
    vi.stubEnv("VITE_USE_DAPR", "true");
    vi.stubEnv("VITE_API_BASE_URL", "http://localhost:5000");
    vi.stubEnv("VITE_DAPR_APP_ID", "my-app");
    vi.stubEnv("VITE_DAPR_PORT", "3600");
    const { createApiClient } = await import("../index");
    const client = createApiClient();
    expect(client.constructor.name).toBe("DaprHttpClient");
  });

  it("getApiClient returns the same instance until resetApiClient", async () => {
    vi.stubEnv("VITE_USE_DAPR", "false");
    vi.stubEnv("VITE_API_BASE_URL", "http://localhost:5000");
    const { getApiClient, resetApiClient } = await import("../index");
    resetApiClient();
    const first = getApiClient();
    const second = getApiClient();
    expect(second).toBe(first);
  });

  it("resetApiClient clears the singleton so the next getApiClient builds a new client", async () => {
    vi.stubEnv("VITE_USE_DAPR", "false");
    vi.stubEnv("VITE_API_BASE_URL", "http://localhost:5000");
    const { getApiClient, resetApiClient } = await import("../index");
    resetApiClient();
    const before = getApiClient();
    resetApiClient();
    const after = getApiClient();
    expect(after).not.toBe(before);
    expect(after.constructor.name).toBe("AxiosApiClient");
  });

  it("strips a trailing /api segment from VITE_API_BASE_URL on module load", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubEnv("VITE_USE_DAPR", "false");
    vi.stubEnv("VITE_API_BASE_URL", "http://localhost:7000/api/");
    const { createApiClient } = await import("../index");
    const client = createApiClient();
    expect(client.constructor.name).toBe("AxiosApiClient");
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("[API Client] Removed /api suffix from VITE_API_BASE_URL"),
    );
  });
});
