import { KanbanColumn } from "./kanban-column";
import { type KanbanColumn as KanbanColumnType, type Task, type ColumnStatus } from "@/types/kanban";

interface KanbanBoardProps {
  tasks: Task[];
}

export function KanbanBoard({ tasks }: KanbanBoardProps) {
  const columns: KanbanColumnType[] = [
    {
      id: "backlog" as ColumnStatus,
      title: "Backlog",
      tasks: tasks.filter(task => task.status === "backlog"),
    },
    {
      id: "a-fazer" as ColumnStatus,
      title: "A Fazer",
      tasks: tasks.filter(task => task.status === "a-fazer"),
    },
    {
      id: "em-progresso" as ColumnStatus,
      title: "Em Progresso",
      tasks: tasks.filter(task => task.status === "em-progresso"),
    },
    {
      id: "concluido" as ColumnStatus,
      title: "Concluído",
      tasks: tasks.filter(task => task.status === "concluido"),
    },
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((column) => (
          <KanbanColumn key={column.id} column={column} />
        ))}
      </div>
    </div>
  );
}
