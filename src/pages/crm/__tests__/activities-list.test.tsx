import { describe, it, expect, vi } from "vitest";
import { render as rtlRender, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ActivitiesListPage } from "../activities-list";
import { AuthProvider } from "@/contexts/auth.context";
import { crmActivitiesService } from "@/api/services/crm-activities.service";
import type { ActivityDto, PaginatedResponse } from "@/types/api.types";

vi.mock("@/api/services/crm-activities.service", () => ({
  crmActivitiesService: {
    searchActivities: vi.fn(),
  },
}));

const mockActivities: ActivityDto[] = [
  {
    id: "a-1",
    subject: "Call with client",
    type: "Call",
    assignedToUsername: "owner1",
    status: "Open",
    dueAt: "2024-01-02T00:00:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    createdBy: "system",
  },
];

const mockResponse: PaginatedResponse<ActivityDto> = {
  items: mockActivities,
  total: 1,
  page: 1,
  pageSize: 10,
  totalPages: 1,
  hasPreviousPage: false,
  hasNextPage: false,
};

describe("ActivitiesListPage", () => {
  it("renders activities list", async () => {
    vi.mocked(crmActivitiesService.searchActivities).mockResolvedValue(mockResponse);

    rtlRender(<ActivitiesListPage />, {
      wrapper: ({ children }) => (
        <MemoryRouter>
          <AuthProvider>{children}</AuthProvider>
        </MemoryRouter>
      ),
    });

    expect(screen.getByRole("heading", { name: /CRM Activities/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Call with client/i)).toBeInTheDocument();
    });

    expect(screen.getByText("All Activities")).toBeInTheDocument();
  });
});
