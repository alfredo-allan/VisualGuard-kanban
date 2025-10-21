// src/components/kanban-board.tsx - VERSÃO CORRIGIDA
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
  createDefaultColumn,
  debugColumn,
  debugTask,
} from "@/types/kanban";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

// 🔹 INTERFACE DE PROPS ATUALIZADA
interface KanbanBoardProps {
  tasks: Task[];
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  onMoveTask?: (taskId: string, newStatus: ColumnStatus) => void;
  isReadOnly?: boolean;
  movingTaskId?: string | null;
}

export function KanbanBoard({
  tasks,
  onEditTask,
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

  // 🔹 HANDLER DE INÍCIO DE DRAG - CORRIGIDO
  const handleDragStart = (event: DragStartEvent) => {
    console.group("🔄 DRAG START");

    if (isReadOnly) {
      console.log("⏸️  Modo leitura - drag ignorado");
      console.groupEnd();
      return;
    }

    const { active } = event;
    const taskId = active.id as string;
    const task = tasks.find((t) => t.id === taskId);

    if (task) {
      setActiveTask(task);
      console.log(`🎯 Iniciando drag da tarefa: "${task.title}"`);
      debugTask(task, "Tarefa ativa");
    } else {
      console.warn(`⚠️ Tarefa não encontrada para ID: ${taskId}`);
    }

    console.groupEnd();
  };

  // 🔹 HANDLER DE FIM DE DRAG - CORRIGIDO
  const handleDragEnd = (event: DragEndEvent) => {
    console.group("🎯 DRAG END");

    // Reset do estado visual independente do resultado
    const cleanup = () => {
      setActiveTask(null);
      console.log("🧹 Estado de drag resetado");
    };

    // Verificar se está em modo leitura ou sem handler de movimento
    if (isReadOnly || !onMoveTask) {
      console.log(isReadOnly ? "⏸️  Modo leitura" : "❌ Nenhum onMoveTask handler");
      cleanup();
      console.groupEnd();
      return;
    }

    const { active, over } = event;

    // Verificar se soltou em uma área válida
    if (!over) {
      console.log("❌ Soltou em área inválida");
      cleanup();
      console.groupEnd();
      return;
    }

    const taskId = active.id as string;
    const newStatus = over.id as ColumnStatus;

    console.log(`📤 Movendo tarefa ${taskId} para status: ${newStatus}`);

    // Encontrar a tarefa atual
    const task = tasks.find((t) => t.id === taskId);
    if (!task) {
      console.error(`❌ Tarefa não encontrada: ${taskId}`);
      cleanup();
      console.groupEnd();
      return;
    }

    // Verificar se realmente mudou de status
    if (task.status === newStatus) {
      console.log("✅ Mesmo status - nenhuma ação necessária");
      cleanup();
      console.groupEnd();
      return;
    }

    console.log(`🔄 Movendo de "${task.status}" para "${newStatus}"`);

    // Executar a movimentação
    try {
      onMoveTask(taskId, newStatus);
      console.log("✅ Movimentação iniciada com sucesso");
    } catch (error) {
      console.error("❌ Erro ao mover tarefa:", error);
    } finally {
      cleanup();
      console.groupEnd();
    }
  };

  // 🔹 COLUNAS DO KANBAN - CORRIGIDO
  const columns: KanbanColumnType[] = [
    createDefaultColumn('Backlog', 'backlog', 0, 'kanban-board'),
    createDefaultColumn('A Fazer', 'a-fazer', 1, 'kanban-board'),
    createDefaultColumn('Em Progresso', 'em-progresso', 2, 'kanban-board'),
    createDefaultColumn('Concluído', 'concluido', 3, 'kanban-board'),
  ].map(defaultColumn => {
    // Preencher cada coluna com suas tasks
    const columnTasks = tasks.filter(task => task.status === defaultColumn.status);

    const populatedColumn: KanbanColumnType = {
      ...defaultColumn,
      tasks: columnTasks,
    };

    // Debug para validação
    debugColumn(populatedColumn, `Coluna: ${defaultColumn.title}`);

    return populatedColumn;
  });

  // 🔹 RENDER DO DRAG OVERLAY - CORRIGIDO (PROBLEMA PRINCIPAL)
  const renderDragOverlay = () => {
    if (!activeTask) return null;

    return (
      <div className="opacity-90 rotate-3 cursor-grabbing transform-gpu transition-transform">
        <TaskCard
          task={activeTask}
          isReadOnly={true} // ✅ CORRIGIDO: usar isReadOnly em vez de onEditTask/onDeleteTask undefined
        />
      </div>
    );
  };

  // 🔹 ESTATÍSTICAS PARA DEBUG (opcional)
  const columnStats = columns.map(col => ({
    title: col.title,
    tasks: col.tasks.length,
    status: col.status
  }));

  console.log("📊 Estatísticas das colunas:", columnStats);

  return (
    <div className="w-full space-y-4">
      {/* 🔹 ALERTA DE MODO LEITURA */}
      {isReadOnly && (
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
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
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
              onMoveTask={onMoveTask}
              isReadOnly={isReadOnly}
              movingTaskId={movingTaskId}
            />
          ))}
        </div>

        {/* 🔹 OVERLAY DE DRAG (elemento que segue o cursor) */}
        <DragOverlay
          zIndex={999}
          dropAnimation={null}
        >
          {renderDragOverlay()}
        </DragOverlay>
      </DndContext>

      {/* 🔹 DEBUG VISUAL (apenas desenvolvimento) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-2 rounded-lg opacity-70">
          <div>Tasks: {tasks.length}</div>
          <div>Moving: {movingTaskId || 'Nenhuma'}</div>
          <div>Active: {activeTask?.title || 'Nenhuma'}</div>
        </div>
      )}
    </div>
  );
}

// 🔹 COMPONENTE DE PLACEHOLDER PARA ESTADOS VAZIOS
export function KanbanBoardPlaceholder({ message = "Carregando..." }: { message?: string }) {
  return (
    <div className="w-full space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {['Backlog', 'A Fazer', 'Em Progresso', 'Concluído'].map((title, index) => (
          <div key={title} className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <h3 className="font-semibold text-gray-600 mb-2">{title}</h3>
            <p className="text-sm text-gray-500">{message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// 🔹 COMPONENTE DE ERRO
export function KanbanBoardError({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <div className="w-full space-y-4">
      <Alert variant="destructive">
        <AlertDescription className="text-center">
          <div className="mb-2">❌ Erro ao carregar o board</div>
          <div className="text-sm opacity-80">{error}</div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Tentar Novamente
            </button>
          )}
        </AlertDescription>
      </Alert>

      {/* Mostrar colunas vazias em caso de erro */}
      <KanbanBoardPlaceholder message="Erro ao carregar dados" />
    </div>
  );
}