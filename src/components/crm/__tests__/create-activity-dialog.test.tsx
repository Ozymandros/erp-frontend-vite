import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@/test/utils/test-utils";

const mockOnOpenChange = vi.fn();
const mockOnSuccess = vi.fn();

vi.mock("@/api/services/crm-activities.service", () => ({
  crmActivitiesService: {
    createActivity: vi.fn(),
  },
}));

import { CreateActivityDialog } from "../create-activity-dialog";
import { crmActivitiesService } from "@/api/services/crm-activities.service";
import { ActivityDto } from "@/types/api.types";

describe("CreateActivityDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders create activity form when open", () => {
    render(
      <CreateActivityDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />,
    );

    expect(screen.getByRole("heading", { name: /create activity/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Subject/i)).toBeInTheDocument();
  });

  it("creates activity on valid submit", async () => {
    vi.mocked(crmActivitiesService.createActivity).mockResolvedValue(
      new ActivityDto({
        id: "activity-1",
        subject: "Test Activity",
        type: "call",
        status: "open",
        dueAt: "2026-03-31T00:00:00Z",
        assignedToUsername: "user1",
        createdAt: "2026-03-31T00:00:00Z",
        createdBy: "system"
      })
    );

    render(
      <CreateActivityDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />,
    );

    fireEvent.change(screen.getByLabelText(/Subject/i), { target: { value: "Follow up" } });
    fireEvent.change(screen.getByLabelText(/Type/i), { target: { value: "Call" } });
    fireEvent.change(screen.getByLabelText(/Assigned To/i), { target: { value: "admin" } });
    // set a valid due date
    fireEvent.change(screen.getByLabelText(/Due At/i), { target: { value: "2024-01-01T12:00" } });

    fireEvent.click(screen.getByRole("button", { name: /create activity/i }));

    await waitFor(() => {
      expect(crmActivitiesService.createActivity).toHaveBeenCalled();
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
});
