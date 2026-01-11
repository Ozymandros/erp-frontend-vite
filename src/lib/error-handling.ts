import { ApiClientError } from "@/api/clients/types";

/**
 * Safely converts an unknown error to ApiClientError.
 * Handles ApiClientError instances, Error instances, and other unknown types.
 */
export function handleApiError(error: unknown): ApiClientError {
  if (error instanceof ApiClientError) {
    return error;
  }
  if (error instanceof Error) {
    return new ApiClientError(error.message);
  }
  return new ApiClientError("An unexpected error occurred");
}

/**
 * Checks if an error is a 403 Forbidden (permission denied) error.
 */
export function isForbiddenError(error: ApiClientError): boolean {
  return error.statusCode === 403;
}

/**
 * Generates a consistent 403 Forbidden error message for a given resource.
 */
export function getForbiddenMessage(resource: string): string {
  return `You don't have permission to view ${resource}. Please contact your administrator to request access.`;
}

/**
 * Extracts a user-friendly error message from an ApiClientError.
 * For 403 errors, uses the error's message if available, otherwise falls back to default.
 * For other errors, uses the error's message or the default message.
 */
export function getErrorMessage(error: ApiClientError, defaultMessage: string): string {
  if (isForbiddenError(error)) {
    // For 403 errors, prefer the error's message (already user-friendly from API client)
    return error.message || defaultMessage;
  }
  return error.message || defaultMessage;
}
