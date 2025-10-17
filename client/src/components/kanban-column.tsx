import { type KanbanColumn as KanbanColumnType } from "@/types/kanban";
import { TaskCard } from "./task-card";

interface KanbanColumnProps {
  column: KanbanColumnType;
}

const columnColors = {
  "backlog": "bg-muted/50",
  "a-fazer": "bg-primary/10",
  "em-progresso": "bg-chart-3/10",
  "concluido": "bg-chart-1/10",
};

export function KanbanColumn({ column }: KanbanColumnProps) {
  return (
    <div className="flex flex-col gap-4" data-testid={`column-${column.id}`}>
      <div className={`px-4 py-3 rounded-lg ${columnColors[column.id]}`}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm" data-testid={`text-column-title-${column.id}`}>
            {column.title}
          </h2>
          <span className="text-xs font-medium text-muted-foreground px-2 py-0.5 bg-background/60 rounded-full" data-testid={`text-task-count-${column.id}`}>
            {column.tasks.length}
          </span>
        </div>
      </div>
      
      <div className="flex flex-col gap-3 min-h-[200px]">
        {column.tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
        
        {column.tasks.length === 0 && (
          <div className="flex items-center justify-center h-32 border-2 border-dashed border-border rounded-lg">
            <p className="text-sm text-muted-foreground">Nenhuma tarefa</p>
          </div>
        )}
      </div>
    </div>
  );
}
