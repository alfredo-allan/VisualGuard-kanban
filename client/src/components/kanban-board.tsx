// src/components/kanban-board.tsx - VERSÃO SIMPLIFICADA
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
import {
  type KanbanColumn as KanbanColumnType,
  type Task,
  type ColumnStatus,
} from "@/types/kanban";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Move } from "lucide-react";
import { cn } from "@/lib/utils";

// 🔹 INTERFACE DE PROPS
interface KanbanBoardProps {
  tasks: Task[];
  columns?: KanbanColumnType[];
  onEditTask?: (task: Task) => void;
  onViewTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  onMoveTask?: (taskId: string, newStatus: ColumnStatus) => void;
  isReadOnly?: boolean;
  movingTaskId?: string | null;
}

// 🔹 COMPONENTE PRINCIPAL - EXPORTADO CORRETAMENTE
export function KanbanBoard({
  tasks,
  columns,
  onEditTask,
  onViewTask,
  onDeleteTask,
  onMoveTask,
  isReadOnly = false,
  movingTaskId = null,
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // 🔹 SENSORES PARA DRAG AND DROP
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // 🔹 HANDLER DE INÍCIO DE DRAG
  const handleDragStart = (event: DragStartEvent) => {
    if (isReadOnly) return;

    const { active } = event;
    const taskId = active.id as string;
    const task = tasks.find((t) => t.id === taskId);

    if (task) {
      setActiveTask(task);
    }
  };

  // 🔹 HANDLER DE FIM DE DRAG
  const handleDragEnd = (event: DragEndEvent) => {
    const cleanup = () => {
      setActiveTask(null);
    };

    if (isReadOnly || !onMoveTask) {
      cleanup();
      return;
    }

    const { active, over } = event;

    if (!over) {
      cleanup();
      return;
    }

    const taskId = active.id as string;
    const newStatus = over.id as ColumnStatus;

    const task = tasks.find((t) => t.id === taskId);
    if (!task) {
      cleanup();
      return;
    }

    if (task.status === newStatus) {
      cleanup();
      return;
    }

    try {
      onMoveTask(taskId, newStatus);
    } catch (error) {
      console.error("❌ Erro ao mover tarefa:", error);
    } finally {
      cleanup();
    }
  };

  // 🔹 COLUNAS DO KANBAN - usando as tasks recebidas
  const displayColumns: KanbanColumnType[] = columns || [
    {
      id: "backlog",
      title: "Backlog",
      status: "backlog",
      tasks: tasks.filter((t) => t.status === "backlog"),
      position: 0,
      board_id: "default-board",
      wip_limit: null,
    },
    {
      id: "a-fazer",
      title: "A Fazer",
      status: "a-fazer",
      tasks: tasks.filter((t) => t.status === "a-fazer"),
      position: 1,
      board_id: "default-board",
      wip_limit: 5,
    },
    {
      id: "em-progresso",
      title: "Em Progresso",
      status: "em-progresso",
      tasks: tasks.filter((t) => t.status === "em-progresso"),
      position: 2,
      board_id: "default-board",
      wip_limit: 3,
    },
    {
      id: "concluido",
      title: "Concluído",
      status: "concluido",
      tasks: tasks.filter((t) => t.status === "concluido"),
      position: 3,
      board_id: "default-board",
      wip_limit: null,
    },
  ];

  // 🔹 IDs DAS TAREFAS PARA FILTRO
  const filteredTaskIds = tasks.map((task) => task.id);

  // 🔹 RENDER DO DRAG OVERLAY
  const renderDragOverlay = () => {
    if (!activeTask) return null;

    return (
      <div className="opacity-90 rotate-3 cursor-grabbing transform-gpu transition-transform shadow-2xl">
        <TaskCard
          task={activeTask}
          onEdit={onEditTask}
          onView={onViewTask}
          onDelete={onDeleteTask}
          isReadOnly={true}
          movingTaskId={movingTaskId}
          isFilteredMatch={true}
        />
      </div>
    );
  };

  return (
    <div className="w-full space-y-4">
      {/* 🔹 ALERTA DE MODO LEITURA */}
      {isReadOnly && (
        <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-950 dark:to-indigo-950 dark:border-blue-800">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-800 dark:text-blue-300">
            Esta é uma demonstração. <strong>Faça login</strong> para arrastar e
            editar tarefas.
          </AlertDescription>
        </Alert>
      )}

      {/* 🔹 CONTEXT DE DRAG AND DROP */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* 🔹 GRID DE COLUNAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {displayColumns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              onEditTask={onEditTask}
              onViewTask={onViewTask}
              onDeleteTask={onDeleteTask}
              onMoveTask={onMoveTask}
              isReadOnly={isReadOnly}
              movingTaskId={movingTaskId}
              // ✅ PASSANDO OS IDs DAS TAREFAS FILTRADAS
              filteredTaskIds={filteredTaskIds}
            />
          ))}
        </div>

        {/* 🔹 OVERLAY DE DRAG */}
        <DragOverlay zIndex={999} dropAnimation={null}>
          {renderDragOverlay()}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

// 🔹 SE VOCÊ PRECISAR DOS COMPONENTES AUXILIARES, ADICIONE AQUI:
// export function KanbanBoardPlaceholder() { ... }
// export function KanbanBoardError() { ... }
