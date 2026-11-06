import { Button } from "@/components/ui/button";
import type { ProjectTaskDto, ProjectTaskTreeNodeDto } from "@/types/api.types";
import { Trash2 } from "lucide-react";

interface ProjectTaskTreeProps {
  readonly nodes: ProjectTaskTreeNodeDto[];
  readonly onDelete: (task: ProjectTaskDto) => void;
  readonly canDelete: boolean;
}

function TaskTreeNode({
  node,
  onDelete,
  canDelete,
}: {
  node: ProjectTaskTreeNodeDto;
  onDelete: (task: ProjectTaskDto) => void;
  canDelete: boolean;
}) {
  const { task, level, children } = node;
  return (
    <div>
      <div
        className="flex items-center justify-between gap-2 py-1 border-b border-border/50"
        style={{ paddingLeft: `${level * 16}px` }}
      >
        <div className="text-sm">
          <span className="font-medium">{task.taskNo}</span> — {task.description}{" "}
          <span className="text-muted-foreground">({task.taskType})</span>
        </div>
        {canDelete ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onDelete(task)}
            aria-label={`Delete task ${task.taskNo}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
      {children.map((child) => (
        <TaskTreeNode
          key={child.task.id}
          node={child}
          onDelete={onDelete}
          canDelete={canDelete}
        />
      ))}
    </div>
  );
}

export function ProjectTaskTree({ nodes, onDelete, canDelete }: ProjectTaskTreeProps) {
  if (nodes.length === 0) {
    return <p className="text-sm text-muted-foreground">No tasks yet.</p>;
  }
  return (
    <div className="space-y-0">
      {nodes.map((node) => (
        <TaskTreeNode
          key={node.task.id}
          node={node}
          onDelete={onDelete}
          canDelete={canDelete}
        />
      ))}
    </div>
  );
}
