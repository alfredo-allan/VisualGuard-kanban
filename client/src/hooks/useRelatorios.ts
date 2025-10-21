// src/hooks/useRelatorios.ts
import { useKanbanReal } from "./useKanbanReal";
import { type Task } from "@/types/kanban";

export function useRelatorios() {
  const { currentBoard, isLoading, error } = useKanbanReal();

  // Pega todas as tasks do board atual
  const tasks: Task[] = currentBoard?.columns.flatMap(column => column.tasks) || [];

  const stats = {
    total: tasks.length,
    backlog: tasks.filter(t => t.status === "backlog").length,
    aTodo: tasks.filter(t => t.status === "a-fazer").length,
    inProgress: tasks.filter(t => t.status === "em-progresso").length,
    done: tasks.filter(t => t.status === "concluido").length,
  };

  const priorityData = [
    { name: "Urgente", value: tasks.filter(t => t.priority === "urgente").length, color: "hsl(var(--destructive))" },
    { name: "Alta", value: tasks.filter(t => t.priority === "alta").length, color: "hsl(var(--primary))" },
    { name: "Média", value: tasks.filter(t => t.priority === "media").length, color: "hsl(var(--chart-3))" },
    { name: "Baixa", value: tasks.filter(t => t.priority === "baixa").length, color: "hsl(var(--muted-foreground))" },
  ].filter(item => item.value > 0);

  const statusData = [
    { name: "Backlog", value: stats.backlog },
    { name: "A Fazer", value: stats.aTodo },
    { name: "Em Progresso", value: stats.inProgress },
    { name: "Concluído", value: stats.done },
  ];

  const completionRate = stats.total > 0 ? ((stats.done / stats.total) * 100).toFixed(1) : "0";

  return {
    tasks,
    stats,
    priorityData,
    statusData,
    completionRate,
    isLoading,
    error,
    hasData: tasks.length > 0
  };
}
