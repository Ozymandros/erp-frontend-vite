import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  registerToastApi,
  getToastApi,
  showToastError,
  showToastSuccess,
  showToastWarning,
  showToastInfo,
} from "../toast.service";

describe("toast.service", () => {
  const mockApi = {
    show: vi.fn().mockReturnValue("id-1"),
    success: vi.fn().mockReturnValue("id-1"),
    error: vi.fn().mockReturnValue("id-1"),
    info: vi.fn().mockReturnValue("id-1"),
    warning: vi.fn().mockReturnValue("id-1"),
    dismiss: vi.fn(),
    clear: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    registerToastApi(null);
  });

  describe("registerToastApi", () => {
    it("should store api when registered", () => {
      registerToastApi(mockApi as never);
      expect(getToastApi()).toBe(mockApi);
    });

    it("should clear api when null is passed", () => {
      registerToastApi(mockApi as never);
      registerToastApi(null);
      expect(getToastApi()).toBeNull();
    });
  });

  describe("getToastApi", () => {
    it("should return null when no api registered", () => {
      expect(getToastApi()).toBeNull();
    });

    it("should return registered api", () => {
      registerToastApi(mockApi as never);
      expect(getToastApi()).toBe(mockApi);
    });
  });

  describe("showToastError", () => {
    it("should call api.error when api is registered", () => {
      registerToastApi(mockApi as never);
      showToastError("Error title", "Error description");
      expect(mockApi.error).toHaveBeenCalledWith("Error title", "Error description");
    });

    it("should work without description", () => {
      registerToastApi(mockApi as never);
      showToastError("Error only");
      expect(mockApi.error).toHaveBeenCalledWith("Error only", undefined);
    });
  });

  describe("showToastSuccess", () => {
    it("should call api.success when api is registered", () => {
      registerToastApi(mockApi as never);
      showToastSuccess("Success title", "Success description");
      expect(mockApi.success).toHaveBeenCalledWith("Success title", "Success description");
    });
  });

  describe("showToastWarning", () => {
    it("should call api.warning when api is registered", () => {
      registerToastApi(mockApi as never);
      showToastWarning("Warning title");
      expect(mockApi.warning).toHaveBeenCalledWith("Warning title", undefined);
    });
  });

  describe("showToastInfo", () => {
    it("should call api.info when api is registered", () => {
      registerToastApi(mockApi as never);
      showToastInfo("Info title", "Info desc");
      expect(mockApi.info).toHaveBeenCalledWith("Info title", "Info desc");
    });
  });

  describe("queue when api not ready", () => {
    it("should flush queue when api is registered later", () => {
      showToastError("Queued error");
      showToastSuccess("Queued success");
      expect(mockApi.error).not.toHaveBeenCalled();
      expect(mockApi.success).not.toHaveBeenCalled();

      registerToastApi(mockApi as never);
      expect(mockApi.error).toHaveBeenCalledWith("Queued error", undefined);
      expect(mockApi.success).toHaveBeenCalledWith("Queued success", undefined);
    });
  });
});
