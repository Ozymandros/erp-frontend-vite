import { describe, it, expect } from "vitest";
import { ApiClientError } from "@/api/clients/types";
import {
  handleApiError,
  isForbiddenError,
  getForbiddenMessage,
  getErrorMessage,
} from "@/lib/error-handling";

describe("Error Handling Utilities", () => {
  describe("handleApiError", () => {
    it("should return ApiClientError instance as-is", () => {
      const error = new ApiClientError("Test error", 404);
      const result = handleApiError(error);
      expect(result).toBe(error);
      expect(result.message).toBe("Test error");
      expect(result.statusCode).toBe(404);
    });

    it("should convert Error instance to ApiClientError", () => {
      const error = new Error("Network error");
      const result = handleApiError(error);
      expect(result).toBeInstanceOf(ApiClientError);
      expect(result.message).toBe("Network error");
      expect(result.statusCode).toBeUndefined();
    });

    it("should handle unknown error types with default message", () => {
      const error = { someProperty: "value" };
      const result = handleApiError(error);
      expect(result).toBeInstanceOf(ApiClientError);
      expect(result.message).toBe("An unexpected error occurred");
      expect(result.statusCode).toBeUndefined();
    });

    it("should handle null error", () => {
      const result = handleApiError(null);
      expect(result).toBeInstanceOf(ApiClientError);
      expect(result.message).toBe("An unexpected error occurred");
    });

    it("should handle undefined error", () => {
      const result = handleApiError(undefined);
      expect(result).toBeInstanceOf(ApiClientError);
      expect(result.message).toBe("An unexpected error occurred");
    });

    it("should handle string error", () => {
      const error = "String error";
      const result = handleApiError(error);
      expect(result).toBeInstanceOf(ApiClientError);
      expect(result.message).toBe("An unexpected error occurred");
    });

    it("should preserve statusCode and other properties from ApiClientError", () => {
      const error = new ApiClientError("Forbidden", 403, "FORBIDDEN", { detail: "test" });
      const result = handleApiError(error);
      expect(result.statusCode).toBe(403);
      expect(result.code).toBe("FORBIDDEN");
      expect(result.details).toEqual({ detail: "test" });
    });
  });

  describe("isForbiddenError", () => {
    it("should return true for 403 status code", () => {
      const error = new ApiClientError("Forbidden", 403);
      expect(isForbiddenError(error)).toBe(true);
    });

    it("should return false for other status codes", () => {
      const error404 = new ApiClientError("Not Found", 404);
      const error500 = new ApiClientError("Server Error", 500);
      const error401 = new ApiClientError("Unauthorized", 401);
      
      expect(isForbiddenError(error404)).toBe(false);
      expect(isForbiddenError(error500)).toBe(false);
      expect(isForbiddenError(error401)).toBe(false);
    });

    it("should return false when statusCode is undefined", () => {
      const error = new ApiClientError("Error without status");
      expect(isForbiddenError(error)).toBe(false);
    });
  });

  describe("getForbiddenMessage", () => {
    it("should generate message for singular resource", () => {
      const message = getForbiddenMessage("user");
      expect(message).toBe(
        "You don't have permission to view user. Please contact your administrator to request access."
      );
    });

    it("should generate message for plural resource", () => {
      const message = getForbiddenMessage("users");
      expect(message).toBe(
        "You don't have permission to view users. Please contact your administrator to request access."
      );
    });

    it("should generate message for resource with spaces", () => {
      const message = getForbiddenMessage("sales orders");
      expect(message).toBe(
        "You don't have permission to view sales orders. Please contact your administrator to request access."
      );
    });

    it("should generate message for empty string resource", () => {
      const message = getForbiddenMessage("");
      expect(message).toBe(
        "You don't have permission to view . Please contact your administrator to request access."
      );
    });
  });

  describe("getErrorMessage", () => {
    it("should return error message for non-403 errors", () => {
      const error = new ApiClientError("Not Found", 404);
      const result = getErrorMessage(error, "Default message");
      expect(result).toBe("Not Found");
    });

    it("should return default message when error message is empty for non-403 errors", () => {
      const error = new ApiClientError("", 404);
      const result = getErrorMessage(error, "Default message");
      expect(result).toBe("Default message");
    });

    it("should return error message for 403 errors when message exists", () => {
      const error = new ApiClientError("Access denied", 403);
      const result = getErrorMessage(error, "Default forbidden message");
      expect(result).toBe("Access denied");
    });

    it("should return default message for 403 errors when error message is empty", () => {
      const error = new ApiClientError("", 403);
      const result = getErrorMessage(error, "Default forbidden message");
      expect(result).toBe("Default forbidden message");
    });

    it("should return default message for 403 errors when error message is undefined", () => {
      const error = new ApiClientError(undefined as any, 403);
      const result = getErrorMessage(error, "Default forbidden message");
      expect(result).toBe("Default forbidden message");
    });

    it("should handle errors without statusCode", () => {
      const error = new ApiClientError("Generic error");
      const result = getErrorMessage(error, "Default message");
      expect(result).toBe("Generic error");
    });
  });
});
