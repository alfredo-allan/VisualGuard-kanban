import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useState } from "react";
import { KanbanColumn } from "./kanban-column";
import { TaskCard } from "./task-card";
import { type KanbanColumn as KanbanColumnType, type Task, type ColumnStatus } from "@/types/kanban";

interface KanbanBoardProps {
  tasks: Task[];
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  onMoveTask?: (taskId: string, newStatus: ColumnStatus) => void;
}

export function KanbanBoard({ tasks, onEditTask, onDeleteTask, onMoveTask }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !onMoveTask) {
      setActiveTask(null);
      return;
    }

    const taskId = active.id as string;
    const newStatus = over.id as ColumnStatus;
    
    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status !== newStatus) {
      onMoveTask(taskId, newStatus);
    }
    
    setActiveTask(null);
  };
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
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((column) => (
            <KanbanColumn 
              key={column.id} 
              column={column}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
              onMoveTask={onMoveTask}
            />
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="opacity-90 rotate-3 cursor-grabbing">
            <TaskCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
