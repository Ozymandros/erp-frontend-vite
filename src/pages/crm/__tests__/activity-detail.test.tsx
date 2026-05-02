import { describe, it, expect, vi, beforeEach } from "vitest";
import { render as rtlRender, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ActivityDetailPage } from "../activity-detail";
import { crmActivitiesService } from "@/api/services/crm-activities.service";
import { AuthProvider } from "@/contexts/auth.context";
import { ActivityDto } from "@/types/api.types";

vi.mock("@/api/services/crm-activities.service", () => ({
  crmActivitiesService: {
    getActivityById: vi.fn(),
    completeActivity: vi.fn(),
  },
}));

const mockActivity = new ActivityDto({
  id: "act-1",
  subject: "Follow-up call",
  type: "Call",
  status: "Open",
  dueAt: "2024-06-01T10:00:00Z",
  assignedToUsername: "alice",
  leadId: "lead-9",
});

function renderWithProviders(id = "act-1") {
  return rtlRender(
    <MemoryRouter initialEntries={[`/crm/activities/${id}`]}>
      <AuthProvider>
        <Routes>
          <Route path="/crm/activities/:id" element={<ActivityDetailPage />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("ActivityDetailPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders loading state", () => {
    vi.mocked(crmActivitiesService.getActivityById).mockImplementation(() => new Promise(() => {}));

    renderWithProviders();

    expect(screen.getByText(/loading activity/i)).toBeInTheDocument();
  });

  it("renders activity details", async () => {
    vi.mocked(crmActivitiesService.getActivityById).mockResolvedValue(mockActivity);

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText(/follow-up call/i)).toBeInTheDocument();
    });

    expect(screen.getByText("Call")).toBeInTheDocument();
    expect(screen.getByText("Open")).toBeInTheDocument();
    expect(screen.getByText(/lead-9/i)).toBeInTheDocument();
  });

  it("shows error when fetch fails", async () => {
    vi.mocked(crmActivitiesService.getActivityById).mockRejectedValue(new Error("missing"));

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText(/missing/i)).toBeInTheDocument();
    });
  });

  it("completes activity from dialog", async () => {
    vi.mocked(crmActivitiesService.getActivityById).mockResolvedValue(mockActivity);
    vi.mocked(crmActivitiesService.completeActivity).mockResolvedValue(undefined);

    renderWithProviders();

    await waitFor(() => expect(screen.getByText(/follow-up call/i)).toBeInTheDocument());

    await userEvent.click(screen.getByRole("button", { name: /complete activity/i }));

    await userEvent.type(screen.getByLabelText(/note/i), "Done");
    await userEvent.click(screen.getByRole("button", { name: /^complete$/i }));

    await waitFor(() => {
      expect(crmActivitiesService.completeActivity).toHaveBeenCalledWith("act-1", {
        note: "Done",
      });
    });
  });
});
