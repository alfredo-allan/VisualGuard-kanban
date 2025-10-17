export type Priority = "baixa" | "media" | "alta" | "urgente";

export type ColumnStatus = "backlog" | "a-fazer" | "em-progresso" | "concluido";

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: ColumnStatus;
}

export interface KanbanColumn {
  id: ColumnStatus;
  title: string;
  tasks: Task[];
}
