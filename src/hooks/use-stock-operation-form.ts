import { useState, type FormEvent } from "react";
import { handleApiError, getErrorMessage } from "@/lib/error-handling";

interface UseStockOperationFormOptions<T> {
  readonly onSubmit: (data: T) => Promise<void>;
  readonly successMessage: string;
  readonly defaultErrorMessage: string;
}

interface UseStockOperationFormReturn {
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly success: boolean;
  readonly handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  readonly resetForm: () => void;
}

export function useStockOperationForm<T>(
  options: UseStockOperationFormOptions<T>,
  parseFormData: (formData: FormData) => T
): UseStockOperationFormReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const data = parseFormData(formData);

    try {
      await options.onSubmit(data);
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } catch (err: unknown) {
      const apiError = handleApiError(err);
      setError(getErrorMessage(apiError, options.defaultErrorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setError(null);
    setSuccess(false);
  };

  return {
    isLoading,
    error,
    success,
    handleSubmit,
    resetForm,
  };
}
