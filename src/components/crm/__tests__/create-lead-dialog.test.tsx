import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@/test/utils/test-utils";

const mockOnOpenChange = vi.fn();
const mockOnSuccess = vi.fn();

vi.mock("@/api/services/leads.service", () => ({
  leadsService: {
    createLead: vi.fn(),
  },
}));

import { CreateLeadDialog } from "../create-lead-dialog";
import { leadsService } from "@/api/services/leads.service";
import type { LeadDto } from "@/types/api.types";

describe("CreateLeadDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render create lead form when open", () => {
    render(
      <CreateLeadDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
        ownerUsername="admin"
      />,
    );

    expect(
      screen.getByRole("heading", { name: /create lead/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
  });

  it("should call onOpenChange(false) when Cancel is clicked", () => {
    render(
      <CreateLeadDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
        ownerUsername="admin"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("should create lead on valid submit", async () => {
    const created: LeadDto = {
      id: "lead-1",
      title: "E2E Lead",
      status: "Open",
      ownerUsername: "admin",
      createdAt: "2024-01-01T00:00:00Z",
      createdBy: "system",
      updatedAt: "2024-01-01T00:00:00Z",
    } as LeadDto;

    vi.mocked(leadsService.createLead).mockResolvedValue(created);

    render(
      <CreateLeadDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
        ownerUsername="admin"
      />,
    );

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: "E2E Lead" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create lead/i }));

    await waitFor(() => {
      expect(leadsService.createLead).toHaveBeenCalled();
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
});

