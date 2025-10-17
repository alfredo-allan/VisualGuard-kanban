import { useDroppable } from "@dnd-kit/core";
import { type KanbanColumn as KanbanColumnType, type Task, type ColumnStatus } from "@/types/kanban";
import { TaskCard } from "./task-card";

interface KanbanColumnProps {
  column: KanbanColumnType;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  onMoveTask?: (taskId: string, newStatus: ColumnStatus) => void;
}

const columnColors = {
  "backlog": "bg-muted/50",
  "a-fazer": "bg-primary/10",
  "em-progresso": "bg-chart-3/10",
  "concluido": "bg-chart-1/10",
};

export function KanbanColumn({ column, onEditTask, onDeleteTask, onMoveTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

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
      
      <div 
        ref={setNodeRef}
        className={`flex flex-col gap-3 min-h-[200px] p-2 rounded-lg transition-colors ${
          isOver ? "bg-primary/5 ring-2 ring-primary/20" : ""
        }`}
      >
        {column.tasks.map((task) => (
          <TaskCard 
            key={task.id} 
            task={task}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            onMove={onMoveTask}
          />
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
