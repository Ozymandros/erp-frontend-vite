import React, { useState } from "react";
import { Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { stockOperationsService } from "@/api/services/stock-operations.service";
import { handleApiError, getErrorMessage } from "@/lib/error-handling";

export function ReleaseReservationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const reservationId = formData.get("reservationId") as string;

    try {
      await stockOperationsService.releaseReservation(reservationId);
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } catch (err: unknown) {
      const apiError = handleApiError(err);
      setError(getErrorMessage(apiError, "Failed to release reservation"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium flex flex-col gap-1">
          <span>Reservation ID</span>
          <input
            name="reservationId"
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Enter reservation ID to release"
          />
        </label>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && (
        <p className="text-green-500 text-sm">
          Reservation released successfully!
        </p>
      )}

      <Button type="submit" disabled={isLoading} variant="destructive">
        <Minus className="h-4 w-4 mr-2" />
        Release Reservation
      </Button>
    </form>
  );
}
