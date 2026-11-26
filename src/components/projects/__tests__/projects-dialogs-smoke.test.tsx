import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateCurrencyDialog } from "../create-currency-dialog";
import { CreateExchangeRateDialog } from "../create-exchange-rate-dialog";
import { CreateProjectDialog } from "../create-project-dialog";
import { EditProjectDialog } from "../edit-project-dialog";
import { DeleteProjectDialog } from "../delete-project-dialog";
import { ChangeProjectStatusDialog } from "../change-project-status-dialog";
import { CopyProjectDialog } from "../copy-project-dialog";
import { CreateResourceDialog } from "../create-resource-dialog";
import { EditResourceDialog } from "../edit-resource-dialog";
import { CreatePlanningLineDialog } from "../create-planning-line-dialog";
import { CreateResourceGroupDialog } from "../create-resource-group-dialog";
import { EditResourceGroupDialog } from "../edit-resource-group-dialog";
import { DeleteResourceGroupDialog } from "../delete-resource-group-dialog";
import { DeleteResourceDialog } from "../delete-resource-dialog";
import { CreateProjectTaskDialog } from "../create-project-task-dialog";
import { DeleteProjectTaskDialog } from "../delete-project-task-dialog";
import { ProjectTaskTree } from "../project-task-tree";
import { PostUsageDialog } from "../post-usage-dialog";
import { CreateInvoiceRequestDialog } from "../create-invoice-request-dialog";
import { CreateItemConsumptionDialog } from "../create-item-consumption-dialog";
import { projectCurrenciesService } from "@/api/services/project-currencies.service";
import { projectResourceGroupsService } from "@/api/services/project-resource-groups.service";
import { projectResourcesService } from "@/api/services/project-resources.service";
import { projectTasksService } from "@/api/services/project-tasks.service";
import { projectPostingService } from "@/api/services/project-posting.service";
import { projectPlanningLinesService } from "@/api/services/project-planning-lines.service";
import { projectsService } from "@/api/services/projects.service";
import { customersService } from "@/api/services/customers.service";
import { warehousesService } from "@/api/services/warehouses.service";
import {
  CustomerDto,
  WarehouseDto,
  type PlanningLineDto,
  type ProjectDto,
  type ProjectTaskDto,
} from "@/types/api.types";

vi.mock("@/api/services/project-currencies.service", () => ({
  projectCurrenciesService: {
    createCurrency: vi.fn(),
    createExchangeRate: vi.fn(),
    getCurrencies: vi.fn(),
  },
}));
vi.mock("@/api/services/project-resource-groups.service", () => ({
  projectResourceGroupsService: {
    getResourceGroups: vi.fn(),
    createResourceGroup: vi.fn(),
    updateResourceGroup: vi.fn(),
    deleteResourceGroup: vi.fn(),
  },
}));
vi.mock("@/api/services/project-resources.service", () => ({
  projectResourcesService: {
    createResource: vi.fn(),
    updateResource: vi.fn(),
    deleteResource: vi.fn(),
  },
}));
vi.mock("@/api/services/project-planning-lines.service", () => ({
  projectPlanningLinesService: {
    createPlanningLine: vi.fn(),
  },
}));
vi.mock("@/api/services/projects.service", () => ({
  projectsService: {
    createProject: vi.fn(),
    updateProject: vi.fn(),
    deleteProject: vi.fn(),
    changeProjectStatus: vi.fn(),
    copyProject: vi.fn(),
  },
}));
vi.mock("@/api/services/customers.service", () => ({
  customersService: {
    getCustomers: vi.fn(),
  },
}));
vi.mock("@/api/services/project-tasks.service", () => ({
  projectTasksService: {
    createTask: vi.fn(),
    deleteTask: vi.fn(),
  },
}));
vi.mock("@/api/services/project-posting.service", () => ({
  projectPostingService: {
    postUsage: vi.fn(),
    createInvoiceRequest: vi.fn(),
    createItemConsumption: vi.fn(),
  },
}));
vi.mock("@/api/services/warehouses.service", () => ({
  warehousesService: {
    getWarehouses: vi.fn(),
  },
}));

const projectId = "a0000001-0000-4000-8000-000000000001";
const customerId = "b0000001-0000-4000-8000-000000000001";

const sampleProject: ProjectDto = {
  id: projectId,
  projectNumber: "P-001",
  description: "Sample project",
  customerId,
  status: "Open",
  blocked: "None",
  currencyCode: "EUR",
  createdAt: "2024-01-01T00:00:00Z",
  createdBy: "system",
};

const sampleTask: ProjectTaskDto = {
  id: "a0000002-0000-4000-8000-000000000002",
  projectId,
  taskNo: "T1",
  description: "Root",
  taskType: "Posting",
  sortOrder: 0,
  createdAt: "2024-01-01T00:00:00Z",
  createdBy: "system",
};

const sampleLine: PlanningLineDto = {
  id: "a0000003-0000-4000-8000-000000000003",
  projectId,
  projectTaskId: sampleTask.id,
  lineNo: 10,
  lineType: "Item",
  kind: "Item",
  description: "Line",
  planningDate: "2024-01-15",
  quantity: 1,
  unitCostLcy: 0,
  unitPrice: 0,
  lineDiscountPercent: 0,
  currencyCode: "EUR",
  exchangeRate: 1,
  totalCostLcy: 0,
  lineAmount: 0,
  lineAmountLcy: 0,
  quantityPosted: 0,
  quantityInConsumption: 0,
  quantityTransferredToInvoice: 0,
  quantityInvoiced: 0,
  quantityToInvoice: 1,
  remainingQuantity: 1,
  createdAt: "2024-01-01T00:00:00Z",
  createdBy: "system",
};

describe("projects dialogs smoke", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(projectCurrenciesService.createCurrency).mockResolvedValue(undefined as never);
    vi.mocked(projectCurrenciesService.createExchangeRate).mockResolvedValue(
      undefined as never
    );
    vi.mocked(projectCurrenciesService.getCurrencies).mockResolvedValue([
      {
        id: "cur-eur",
        code: "EUR",
        description: "Euro",
        isLocalCurrency: true,
        exchangeRates: [],
        createdAt: "",
        createdBy: "",
      },
    ]);
    vi.mocked(customersService.getCustomers).mockResolvedValue([
      new CustomerDto({ id: customerId, name: "Acme", email: "a@example.com" }),
    ]);
    vi.mocked(projectsService.createProject).mockResolvedValue(sampleProject);
    vi.mocked(projectsService.updateProject).mockResolvedValue(sampleProject);
    vi.mocked(projectsService.deleteProject).mockResolvedValue(undefined);
    vi.mocked(projectsService.changeProjectStatus).mockResolvedValue(sampleProject);
    vi.mocked(projectsService.copyProject).mockResolvedValue({
      ...sampleProject,
      id: "c0000001-0000-4000-8000-000000000001",
    });
    vi.mocked(projectResourceGroupsService.getResourceGroups).mockResolvedValue([
      {
        id: "a0000009-0000-4000-8000-000000000009",
        code: "GRP",
        name: "Group",
        createdAt: "",
        createdBy: "",
      },
    ]);
    vi.mocked(projectResourcesService.createResource).mockResolvedValue({} as never);
    vi.mocked(projectResourcesService.updateResource).mockResolvedValue({} as never);
    vi.mocked(projectPlanningLinesService.createPlanningLine).mockResolvedValue({} as never);
    vi.mocked(projectResourceGroupsService.createResourceGroup).mockResolvedValue(
      undefined as never
    );
    vi.mocked(projectResourceGroupsService.updateResourceGroup).mockResolvedValue(
      undefined as never
    );
    vi.mocked(projectResourceGroupsService.deleteResourceGroup).mockResolvedValue(
      undefined as never
    );
    vi.mocked(projectResourcesService.deleteResource).mockResolvedValue(undefined as never);
    vi.mocked(projectTasksService.createTask).mockResolvedValue(sampleTask);
    vi.mocked(projectTasksService.deleteTask).mockResolvedValue(undefined as never);
    vi.mocked(projectPostingService.postUsage).mockResolvedValue(undefined as never);
    vi.mocked(projectPostingService.createInvoiceRequest).mockResolvedValue(
      undefined as never
    );
    vi.mocked(projectPostingService.createItemConsumption).mockResolvedValue(
      undefined as never
    );
    vi.mocked(warehousesService.getWarehouses).mockResolvedValue([
      new WarehouseDto({
        id: "a0000004-0000-4000-8000-000000000004",
        name: "Main",
        location: "A",
      }),
    ]);
  });

  it("CreateCurrencyDialog submits valid payload", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <CreateCurrencyDialog
        open
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />
    );
    await user.type(screen.getByLabelText(/code/i), "eur");
    await user.type(screen.getByLabelText(/description/i), "Euro");
    await user.click(screen.getByRole("button", { name: /^create$/i }));
    expect(projectCurrenciesService.createCurrency).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("CreateExchangeRateDialog submits", async () => {
    const onSuccess = vi.fn();
    render(
      <CreateExchangeRateDialog
        currencyCode="USD"
        open
        onOpenChange={vi.fn()}
        onSuccess={onSuccess}
      />
    );
    // Radix dialog + body pointer-events can block reliable click-to-submit in jsdom/happy-dom.
    fireEvent.submit(screen.getByRole("dialog").querySelector("form")!);
    await waitFor(() => {
      expect(projectCurrenciesService.createExchangeRate).toHaveBeenCalled();
    });
    expect(onSuccess).toHaveBeenCalled();
  });

  it("CreateResourceGroupDialog submits", async () => {
    const user = userEvent.setup();
    render(
      <CreateResourceGroupDialog
        open
        onOpenChange={vi.fn()}
        onSuccess={vi.fn()}
      />
    );
    await user.type(screen.getByLabelText(/code/i), "G1");
    await user.type(screen.getByLabelText(/name/i), "Group");
    await user.click(screen.getByRole("button", { name: /^create$/i }));
    expect(projectResourceGroupsService.createResourceGroup).toHaveBeenCalledWith({
      code: "G1",
      name: "Group",
    });
  });

  it("EditResourceGroupDialog submits", async () => {
    const user = userEvent.setup();
    render(
      <EditResourceGroupDialog
        group={{
          id: "a0000005-0000-4000-8000-000000000005",
          code: "X",
          name: "Old",
          createdAt: "",
          createdBy: "",
        }}
        open
        onOpenChange={vi.fn()}
        onSuccess={vi.fn()}
      />
    );
    await user.clear(screen.getAllByRole("textbox")[0]!);
    await user.type(screen.getAllByRole("textbox")[0]!, "NEW");
    await user.click(screen.getByRole("button", { name: /^save$/i }));
    expect(projectResourceGroupsService.updateResourceGroup).toHaveBeenCalled();
  });

  it("DeleteResourceGroupDialog deletes", async () => {
    const user = userEvent.setup();
    render(
      <DeleteResourceGroupDialog
        group={{
          id: "a0000006-0000-4000-8000-000000000006",
          code: "G",
          name: "N",
          createdAt: "",
          createdBy: "",
        }}
        open
        onOpenChange={vi.fn()}
        onSuccess={vi.fn()}
      />
    );
    await user.click(screen.getByRole("button", { name: /^delete$/i }));
    expect(projectResourceGroupsService.deleteResourceGroup).toHaveBeenCalled();
  });

  it("DeleteResourceDialog deletes", async () => {
    const user = userEvent.setup();
    render(
      <DeleteResourceDialog
        resource={{
          id: "a0000007-0000-4000-8000-000000000007",
          resourceNo: "R1",
          name: "R",
          type: "Person",
          baseUnitOfMeasure: "HOUR",
          unitCost: 1,
          unitPrice: 2,
          dailyCapacity: 8,
          blocked: false,
          createdAt: "",
          createdBy: "",
        }}
        open
        onOpenChange={vi.fn()}
        onSuccess={vi.fn()}
      />
    );
    await user.click(screen.getByRole("button", { name: /^delete$/i }));
    expect(projectResourcesService.deleteResource).toHaveBeenCalled();
  });

  it("CreateProjectTaskDialog creates and shows API error", async () => {
    const user = userEvent.setup();
    vi.mocked(projectTasksService.createTask).mockRejectedValueOnce(new Error("nope"));
    render(
      <CreateProjectTaskDialog
        projectId={projectId}
        open
        onOpenChange={vi.fn()}
        onSuccess={vi.fn()}
      />
    );
    await user.type(screen.getByLabelText(/task no/i), "T99");
    await user.type(screen.getByLabelText(/description/i), "Desc here long enough");
    await user.click(screen.getByRole("button", { name: /^create$/i }));
    expect(await screen.findByText("nope")).toBeInTheDocument();
  });

  it("DeleteProjectTaskDialog deletes", async () => {
    const user = userEvent.setup();
    render(
      <DeleteProjectTaskDialog
        projectId={projectId}
        task={sampleTask}
        open
        onOpenChange={vi.fn()}
        onSuccess={vi.fn()}
      />
    );
    await user.click(screen.getByRole("button", { name: /^delete$/i }));
    expect(projectTasksService.deleteTask).toHaveBeenCalledWith(projectId, sampleTask.id);
  });

  it("ProjectTaskTree renders empty and nested delete", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    const { rerender } = render(
      <ProjectTaskTree nodes={[]} onDelete={onDelete} canDelete={false} />
    );
    expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();

    rerender(
      <ProjectTaskTree
        nodes={[
          {
            task: sampleTask,
            level: 0,
            children: [
              {
                task: {
                  ...sampleTask,
                  id: "a0000008-0000-4000-8000-000000000008",
                  taskNo: "T2",
                },
                level: 1,
                children: [],
              },
            ],
          },
        ]}
        onDelete={onDelete}
        canDelete
      />
    );
    await user.click(screen.getByRole("button", { name: /delete task t2/i }));
    expect(onDelete).toHaveBeenCalled();
  });

  it("PostUsageDialog posts", async () => {
    render(
      <PostUsageDialog
        projectId={projectId}
        tasks={[sampleTask]}
        open
        onOpenChange={vi.fn()}
        onSuccess={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /^post$/i }));
    await waitFor(() => {
      expect(projectPostingService.postUsage).toHaveBeenCalled();
    });
  });

  it("CreateInvoiceRequestDialog requests", async () => {
    const user = userEvent.setup();
    render(
      <CreateInvoiceRequestDialog
        projectId={projectId}
        open
        onOpenChange={vi.fn()}
        onSuccess={vi.fn()}
      />
    );
    await user.click(screen.getByRole("button", { name: /^request$/i }));
    expect(projectPostingService.createInvoiceRequest).toHaveBeenCalled();
  });

  it("CreateItemConsumptionDialog consumes when open", async () => {
    render(
      <CreateItemConsumptionDialog
        projectId={projectId}
        itemLines={[sampleLine]}
        open
        onOpenChange={vi.fn()}
        onSuccess={vi.fn()}
      />
    );
    await waitFor(() => {
      expect(warehousesService.getWarehouses).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(
        screen.getByRole("combobox", { name: /warehouse/i })
      ).toHaveValue("a0000004-0000-4000-8000-000000000004");
    });
    fireEvent.click(screen.getByRole("button", { name: /^create$/i }));
    await waitFor(() => {
      expect(projectPostingService.createItemConsumption).toHaveBeenCalled();
    });
  });

  it("CreateProjectDialog submits", async () => {
    const user = userEvent.setup();
    render(
      <CreateProjectDialog open onOpenChange={vi.fn()} onSuccess={vi.fn()} />
    );
    await waitFor(() => {
      expect(customersService.getCustomers).toHaveBeenCalled();
    });
    await user.type(screen.getByLabelText(/description/i), "New project description");
    await user.selectOptions(screen.getByLabelText(/customer/i), customerId);
    fireEvent.submit(screen.getByRole("dialog").querySelector("form")!);
    await waitFor(() => {
      expect(projectsService.createProject).toHaveBeenCalled();
    });
  });

  it("EditProjectDialog submits", async () => {
    render(
      <EditProjectDialog
        project={sampleProject}
        open
        onOpenChange={vi.fn()}
        onSuccess={vi.fn()}
      />
    );
    await waitFor(() => {
      expect(customersService.getCustomers).toHaveBeenCalled();
    });
    fireEvent.submit(screen.getByRole("dialog").querySelector("form")!);
    await waitFor(() => {
      expect(projectsService.updateProject).toHaveBeenCalledWith(
        projectId,
        expect.any(Object)
      );
    });
  });

  it("DeleteProjectDialog deletes", async () => {
    const user = userEvent.setup();
    render(
      <DeleteProjectDialog
        project={sampleProject}
        open
        onOpenChange={vi.fn()}
        onSuccess={vi.fn()}
      />
    );
    await user.click(screen.getByRole("button", { name: /^delete$/i }));
    await waitFor(() => {
      expect(projectsService.deleteProject).toHaveBeenCalledWith(projectId);
    });
  });

  it("ChangeProjectStatusDialog submits", async () => {
    render(
      <ChangeProjectStatusDialog
        project={sampleProject}
        open
        onOpenChange={vi.fn()}
        onSuccess={vi.fn()}
      />
    );
    fireEvent.submit(screen.getByRole("dialog").querySelector("form")!);
    await waitFor(() => {
      expect(projectsService.changeProjectStatus).toHaveBeenCalled();
    });
  });

  it("CopyProjectDialog copies", async () => {
    const onSuccess = vi.fn();
    render(
      <CopyProjectDialog
        project={sampleProject}
        open
        onOpenChange={vi.fn()}
        onSuccess={onSuccess}
      />
    );
    fireEvent.submit(screen.getByRole("dialog").querySelector("form")!);
    await waitFor(() => {
      expect(projectsService.copyProject).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it("CreateResourceDialog creates", async () => {
    const user = userEvent.setup();
    render(
      <CreateResourceDialog open onOpenChange={vi.fn()} onSuccess={vi.fn()} />
    );
    await waitFor(() => {
      expect(projectResourceGroupsService.getResourceGroups).toHaveBeenCalled();
    });
    await user.type(screen.getByLabelText(/number/i), "R100");
    await user.type(screen.getByLabelText(/name/i), "Worker");
    fireEvent.submit(screen.getByRole("dialog").querySelector("form")!);
    await waitFor(() => {
      expect(projectResourcesService.createResource).toHaveBeenCalled();
    });
  });

  it("EditResourceDialog updates", async () => {
    render(
      <EditResourceDialog
        resource={{
          id: "a000000a-0000-4000-8000-00000000000a",
          resourceNo: "R1",
          name: "Person resource",
          type: "Person",
          baseUnitOfMeasure: "HOUR",
          unitCost: 1,
          unitPrice: 2,
          dailyCapacity: 8,
          blocked: false,
          createdAt: "",
          createdBy: "",
        }}
        open
        onOpenChange={vi.fn()}
        onSuccess={vi.fn()}
      />
    );
    await waitFor(() => {
      expect(projectResourceGroupsService.getResourceGroups).toHaveBeenCalled();
    });
    fireEvent.submit(screen.getByRole("dialog").querySelector("form")!);
    await waitFor(() => {
      expect(projectResourcesService.updateResource).toHaveBeenCalled();
    });
  });

  it("CreatePlanningLineDialog creates", async () => {
    render(
      <CreatePlanningLineDialog
        projectId={projectId}
        tasks={[sampleTask]}
        open
        onOpenChange={vi.fn()}
        onSuccess={vi.fn()}
      />
    );
    fireEvent.submit(screen.getByRole("dialog").querySelector("form")!);
    await waitFor(() => {
      expect(projectPlanningLinesService.createPlanningLine).toHaveBeenCalled();
    });
  });
});
