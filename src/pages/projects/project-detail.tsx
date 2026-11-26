import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { projectsService } from "@/api/services/projects.service";
import { projectTasksService } from "@/api/services/project-tasks.service";
import { projectPlanningLinesService } from "@/api/services/project-planning-lines.service";
import { projectPostingService } from "@/api/services/project-posting.service";
import type {
  ConsumptionOrderDto,
  InvoiceRequestDto,
  PlanningLineDto,
  ProjectDto,
  ProjectLedgerEntryDto,
  ProjectStatisticsDto,
  ProjectTaskDto,
  ProjectTaskTreeNodeDto,
} from "@/types/api.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useModulePermissions } from "@/hooks/use-permissions";
import { EditProjectDialog } from "@/components/projects/edit-project-dialog";
import { DeleteProjectDialog } from "@/components/projects/delete-project-dialog";
import { ChangeProjectStatusDialog } from "@/components/projects/change-project-status-dialog";
import { CopyProjectDialog } from "@/components/projects/copy-project-dialog";
import { CreateProjectTaskDialog } from "@/components/projects/create-project-task-dialog";
import { DeleteProjectTaskDialog } from "@/components/projects/delete-project-task-dialog";
import { ProjectTaskTree } from "@/components/projects/project-task-tree";
import { CreatePlanningLineDialog } from "@/components/projects/create-planning-line-dialog";
import { PostUsageDialog } from "@/components/projects/post-usage-dialog";
import { CreateItemConsumptionDialog } from "@/components/projects/create-item-consumption-dialog";
import { CreateInvoiceRequestDialog } from "@/components/projects/create-invoice-request-dialog";
export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canUpdate, canDelete, canExecute, canCreate } =
    useModulePermissions("projects");

  const [project, setProject] = useState<ProjectDto | null>(null);
  const [statistics, setStatistics] = useState<ProjectStatisticsDto | null>(null);
  const [taskTree, setTaskTree] = useState<ProjectTaskTreeNodeDto[]>([]);
  const [flatTasks, setFlatTasks] = useState<ProjectTaskDto[]>([]);
  const [planningLines, setPlanningLines] = useState<PlanningLineDto[]>([]);
  const [ledger, setLedger] = useState<ProjectLedgerEntryDto[]>([]);
  const [consumptionOrders, setConsumptionOrders] = useState<ConsumptionOrderDto[]>(
    []
  );
  const [invoiceRequests, setInvoiceRequests] = useState<InvoiceRequestDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isCopyOpen, setIsCopyOpen] = useState(false);
  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const [deletingTask, setDeletingTask] = useState<ProjectTaskDto | null>(null);
  const [isPlanningOpen, setIsPlanningOpen] = useState(false);
  const [isUsageOpen, setIsUsageOpen] = useState(false);
  const [isConsumptionOpen, setIsConsumptionOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  const itemPlanningLines = useMemo(
    () =>
      planningLines.filter((l) =>
        l.kind.toLowerCase().includes("item")
      ),
    [planningLines]
  );

  const refreshAll = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const [proj, stats, tree, tasks, lines, entries, consumption, invoices] =
        await Promise.all([
          projectsService.getProjectById(id),
          projectsService.getProjectStatistics(id),
          projectTasksService.getTaskTree(id),
          projectTasksService.getTasks(id),
          projectPlanningLinesService.getPlanningLines(id),
          projectPostingService.getLedgerEntries(id),
          projectPostingService.getItemConsumptionOrders(id),
          projectPostingService.getInvoiceRequests(id),
        ]);
      setProject(proj);
      setStatistics(stats);
      setTaskTree(tree);
      setFlatTasks(tasks);
      setPlanningLines(lines);
      setLedger(entries);
      setConsumptionOrders(consumption);
      setInvoiceRequests(invoices);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load project");
      setProject(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  if (isLoading && !project) {
    return <p className="p-6 text-muted-foreground">Loading project…</p>;
  }

  if (error || !project || !id) {
    return (
      <div className="p-6 space-y-4">
        <Link to="/projects">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <Alert variant="destructive">
          <AlertDescription>{error ?? "Project not found"}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link to="/projects">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to projects
          </Button>
        </Link>
        <div className="flex flex-wrap gap-2">
          {canUpdate ? (
            <Button variant="outline" onClick={() => setIsEditOpen(true)}>
              Edit
            </Button>
          ) : null}
          {canExecute ? (
            <>
              <Button variant="outline" onClick={() => setIsStatusOpen(true)}>
                Change status
              </Button>
              <Button variant="outline" onClick={() => setIsCopyOpen(true)}>
                Copy
              </Button>
            </>
          ) : null}
          {canDelete ? (
            <Button variant="destructive" onClick={() => setIsDeleteOpen(true)}>
              Delete
            </Button>
          ) : null}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {project.projectNumber} — {project.description}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-2 text-sm">
          <p>Status: {project.status}</p>
          <p>Blocked: {project.blocked}</p>
          <p>Currency: {project.currencyCode}</p>
          <p>Customer: {project.customerId}</p>
          {project.externalReference ? (
            <p>External ref: {project.externalReference}</p>
          ) : null}
        </CardContent>
      </Card>

      <Tabs defaultValue="statistics">
        <TabsList>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="planning">Planning</TabsTrigger>
          <TabsTrigger value="ledger">Ledger</TabsTrigger>
          <TabsTrigger value="posting">Posting</TabsTrigger>
        </TabsList>

        <TabsContent value="statistics" className="space-y-4">
          {statistics ? (
            <Card>
              <CardHeader>
                <CardTitle>Totals ({statistics.currencyCode})</CardTitle>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-2 text-sm">
                <p>Budget cost (LCY): {statistics.totals.budgetCostLcy}</p>
                <p>Usage cost (LCY): {statistics.totals.usageCostLcy}</p>
                <p>Invoiced: {statistics.totals.invoicedPrice}</p>
                <p>Billable: {statistics.totals.billablePrice}</p>
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          {canCreate ? (
            <Button onClick={() => setIsTaskOpen(true)}>Add task</Button>
          ) : null}
          <ProjectTaskTree
            nodes={taskTree}
            onDelete={setDeletingTask}
            canDelete={canDelete}
          />
        </TabsContent>

        <TabsContent value="planning" className="space-y-4">
          {canCreate ? (
            <Button onClick={() => setIsPlanningOpen(true)}>Add planning line</Button>
          ) : null}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-2">Line</th>
                  <th className="p-2">Task</th>
                  <th className="p-2">Kind</th>
                  <th className="p-2">Qty</th>
                  <th className="p-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {planningLines.map((line) => (
                  <tr key={line.id} className="border-b border-border/50">
                    <td className="p-2">{line.lineNo}</td>
                    <td className="p-2">{line.projectTaskId.slice(0, 8)}…</td>
                    <td className="p-2">{line.kind}</td>
                    <td className="p-2">{line.quantity}</td>
                    <td className="p-2">{line.lineAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="ledger" className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-2">#</th>
                  <th className="p-2">Date</th>
                  <th className="p-2">Type</th>
                  <th className="p-2">Description</th>
                  <th className="p-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((entry) => (
                  <tr key={entry.id} className="border-b border-border/50">
                    <td className="p-2">{entry.entryNo}</td>
                    <td className="p-2">{entry.postingDate.slice(0, 10)}</td>
                    <td className="p-2">{entry.entryType}</td>
                    <td className="p-2">{entry.description}</td>
                    <td className="p-2">{entry.lineAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="posting" className="space-y-4">
          {canExecute ? (
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setIsUsageOpen(true)}>Post usage</Button>
              <Button onClick={() => setIsConsumptionOpen(true)}>
                Item consumption
              </Button>
              <Button onClick={() => setIsInvoiceOpen(true)}>Request invoice</Button>
            </div>
          ) : null}
          <Card>
            <CardHeader>
              <CardTitle>Consumption orders</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              {consumptionOrders.length === 0 ? (
                <p className="text-muted-foreground">None</p>
              ) : (
                consumptionOrders.map((o) => (
                  <p key={o.id}>
                    {o.orderNumber} — {o.status}
                  </p>
                ))
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Invoice requests</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              {invoiceRequests.length === 0 ? (
                <p className="text-muted-foreground">None</p>
              ) : (
                invoiceRequests.map((r) => (
                  <p key={r.id}>
                    {r.status} — {r.totalAmount} {r.currencyCode}
                    {r.invoiceNumber ? ` (${r.invoiceNumber})` : ""}
                  </p>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <EditProjectDialog
        project={project}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSuccess={refreshAll}
      />
      <DeleteProjectDialog
        project={project}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onSuccess={() => navigate("/projects")}
      />
      <ChangeProjectStatusDialog
        project={project}
        open={isStatusOpen}
        onOpenChange={setIsStatusOpen}
        onSuccess={refreshAll}
      />
      <CopyProjectDialog
        project={project}
        open={isCopyOpen}
        onOpenChange={setIsCopyOpen}
        onSuccess={(newId) => navigate(`/projects/${newId}`)}
      />
      <CreateProjectTaskDialog
        projectId={id}
        open={isTaskOpen}
        onOpenChange={setIsTaskOpen}
        onSuccess={refreshAll}
      />
      {deletingTask ? (
        <DeleteProjectTaskDialog
          projectId={id}
          task={deletingTask}
          open={!!deletingTask}
          onOpenChange={(open) => !open && setDeletingTask(null)}
          onSuccess={refreshAll}
        />
      ) : null}
      <CreatePlanningLineDialog
        projectId={id}
        tasks={flatTasks}
        open={isPlanningOpen}
        onOpenChange={setIsPlanningOpen}
        onSuccess={refreshAll}
      />
      <PostUsageDialog
        projectId={id}
        tasks={flatTasks}
        open={isUsageOpen}
        onOpenChange={setIsUsageOpen}
        onSuccess={refreshAll}
      />
      <CreateItemConsumptionDialog
        projectId={id}
        itemLines={itemPlanningLines}
        open={isConsumptionOpen}
        onOpenChange={setIsConsumptionOpen}
        onSuccess={refreshAll}
      />
      <CreateInvoiceRequestDialog
        projectId={id}
        open={isInvoiceOpen}
        onOpenChange={setIsInvoiceOpen}
        onSuccess={refreshAll}
      />
    </div>
  );
}
