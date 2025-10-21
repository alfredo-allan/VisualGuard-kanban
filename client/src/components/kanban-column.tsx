// src/components/kanban-column.tsx - VERSÃO CORRIGIDA
import { useDroppable } from "@dnd-kit/core";
import {
  type KanbanColumn as KanbanColumnType,
  type Task,
  type ColumnStatus,
  debugColumn,
  debugTask
} from "@/types/kanban";
import { TaskCard } from "./task-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

// 🔹 INTERFACE DE PROPS ATUALIZADA
interface KanbanColumnProps {
  column: KanbanColumnType;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  onMoveTask?: (taskId: string, newStatus: ColumnStatus) => void;
  isReadOnly?: boolean;
  movingTaskId?: string | null;
}

// 🔹 CONFIGURAÇÃO DE CORES E ÍCONES
const columnConfig: Record<ColumnStatus, {
  color: string;
  icon: React.ReactNode;
  description: string;
}> = {
  "backlog": {
    color: "bg-slate-50 border-slate-200 dark:bg-slate-900/50 dark:border-slate-700",
    icon: "📥",
    description: "Tarefas a serem planejadas"
  },
  "a-fazer": {
    color: "bg-blue-50 border-blue-200 dark:bg-blue-900/50 dark:border-blue-700",
    icon: "📋",
    description: "Tarefas prontas para execução"
  },
  "em-progresso": {
    color: "bg-amber-50 border-amber-200 dark:bg-amber-900/50 dark:border-amber-700",
    icon: "⚡",
    description: "Tarefas em andamento"
  },
  "concluido": {
    color: "bg-green-50 border-green-200 dark:bg-green-900/50 dark:border-green-700",
    icon: "✅",
    description: "Tarefas finalizadas"
  },
};

// 🔹 ÍCONES PARA WIP LIMIT - CORRIGIDO
const WipLimitIcon = ({ current, limit }: { current: number; limit: number }) => {
  // ✅ CORREÇÃO: Garantir que limit seja um número válido
  const safeLimit = limit > 0 ? limit : 1; // Evitar divisão por zero

  if (current <= safeLimit * 0.7) return <CheckCircle2 className="h-3 w-3 text-green-500" />;
  if (current <= safeLimit * 0.9) return <Clock className="h-3 w-3 text-amber-500" />;
  return <AlertCircle className="h-3 w-3 text-red-500" />;
};

export function KanbanColumn({
  column,
  onEditTask,
  onDeleteTask,
  onMoveTask,
  isReadOnly = false,
  movingTaskId = null
}: KanbanColumnProps) {
  console.group(`🎯 KANBAN COLUMN: ${column.title}`);
  debugColumn(column, `Renderizando coluna`);

  // 🔹 CONFIG DROPPABLE - COM DEBUG
  const { setNodeRef, isOver } = useDroppable({
    id: column.status,
    disabled: isReadOnly,
  });

  console.log(`🔄 Droppable: isOver=${isOver}, disabled=${isReadOnly}`);

  // 🔹 CONFIGURAÇÃO DA COLUNA - CORRIGIDO
  const config = columnConfig[column.status] || columnConfig["backlog"];

  // ✅ CORREÇÃO: Lidar com wip_limit undefined/null
  const hasWipLimit = column.wip_limit !== null && column.wip_limit !== undefined && column.wip_limit > 0;
  const safeWipLimit = column.wip_limit || 0; // ✅ Valor seguro para comparações
  const isWipLimitExceeded = hasWipLimit && column.tasks.length > safeWipLimit;

  console.log(`📊 WIP: ${column.tasks.length}/${safeWipLimit} | Exceeded: ${isWipLimitExceeded}`);

  // 🔹 FILTRAR TAREFAS (excluir a que está sendo movida)
  const visibleTasks = column.tasks.filter(task =>
    task.id !== movingTaskId
  );

  console.log(`👀 Tasks visíveis: ${visibleTasks.length} (movendo: ${movingTaskId})`);

  // 🔹 RENDER HEADER DA COLUNA - CORRIGIDO
  const renderColumnHeader = () => (
    <div className={cn(
      "px-4 py-3 rounded-lg border transition-colors",
      config.color,
      isReadOnly && "opacity-80",
      isOver && !isReadOnly && "ring-2 ring-primary/50 bg-primary/5"
    )}>
      <div className="flex items-center justify-between">
        {/* LADO ESQUERDO: Título e Ícone */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-sm flex-shrink-0">{config.icon}</span>
          <div className="flex flex-col min-w-0">
            <h2
              className="font-semibold text-sm truncate"
              data-testid={`text-column-title-${column.id}`}
              title={column.title}
            >
              {column.title}
            </h2>
            <p className="text-xs text-muted-foreground truncate" title={config.description}>
              {config.description}
            </p>
          </div>

          {isReadOnly && (
            <Lock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          )}
        </div>

        {/* LADO DIREITO: Contadores e Badges - CORRIGIDO */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* WIP Limit Indicator - CORRIGIDO */}
          {hasWipLimit && (
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-xs",
              isWipLimitExceeded
                ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
                : "bg-muted text-muted-foreground"
            )}>
              <WipLimitIcon
                current={column.tasks.length}
                limit={safeWipLimit} // ✅ Usando valor seguro
              />
              <span>
                {column.tasks.length}/{safeWipLimit} {/* ✅ Usando valor seguro */}
              </span>
            </div>
          )}

          {/* Badge de Contagem */}
          <Badge
            variant={isWipLimitExceeded ? "destructive" : "secondary"}
            className={cn(
              "text-xs font-medium transition-colors",
              isWipLimitExceeded && "animate-pulse"
            )}
            data-testid={`text-task-count-${column.id}`}
          >
            {column.tasks.length}
            {movingTaskId && column.tasks.some(t => t.id === movingTaskId) && "🚀"}
          </Badge>
        </div>
      </div>
    </div>
  );

  // 🔹 RENDER ÁREA DE TAREFAS VAZIA
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-32 text-center p-4">
      <div className="text-2xl mb-2 opacity-50">{config.icon}</div>
      <p className="text-sm text-muted-foreground mb-1">
        {isReadOnly ? "Nenhuma tarefa" : "Nenhuma tarefa ainda"}
      </p>
      {!isReadOnly && (
        <p className="text-xs text-muted-foreground">
          Arraste tarefas para cá
        </p>
      )}
    </div>
  );

  // 🔹 RENDER LISTA DE TAREFAS
  const renderTaskList = () => (
    <div className="space-y-3">
      {visibleTasks.map((task) => {
        console.log(`🎯 Renderizando task: ${task.title} (${task.id})`);
        debugTask(task, `Task na coluna ${column.title}`);

        return (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            isReadOnly={isReadOnly}
            movingTaskId={movingTaskId}
          />
        );
      })}

      {/* 🔹 INDICADOR DE TAREFA SENDO MOVIDA */}
      {movingTaskId && column.tasks.some(t => t.id === movingTaskId) && (
        <div className={cn(
          "border-2 border-dashed border-primary/30 rounded-lg p-4",
          "bg-primary/5 animate-pulse transition-all"
        )}>
          <div className="flex items-center justify-center gap-2 text-sm text-primary/70">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            Movendo tarefa...
          </div>
        </div>
      )}
    </div>
  );

  // 🔹 RENDER WIP LIMIT WARNING - CORRIGIDO
  const renderWipWarning = () => {
    if (!isWipLimitExceeded || isReadOnly) return null;

    return (
      <div className="mx-3 -mt-2 mb-2">
        <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-center">
          <p className="text-xs text-red-700 font-medium">
            ⚠️ Limite WIP excedido!
          </p>
          <p className="text-xs text-red-600">
            {column.tasks.length} de {safeWipLimit} tarefas {/* ✅ Usando valor seguro */}
          </p>
        </div>
      </div>
    );
  };

  console.groupEnd();

  return (
    <div
      className="flex flex-col gap-4 h-full"
      data-testid={`column-${column.id}`}
      data-column-status={column.status}
    >
      {/* Header da Coluna */}
      {renderColumnHeader()}

      {/* Área de Tarefas */}
      <Card
        ref={setNodeRef}
        className={cn(
          "flex-1 transition-all duration-200 min-h-[200px] flex flex-col",
          "border-2",
          isOver && !isReadOnly
            ? "border-primary/50 bg-primary/5 ring-2 ring-primary/20"
            : "border-transparent",
          isReadOnly && "bg-muted/20 opacity-90",
          isWipLimitExceeded && "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-900/20"
        )}
      >
        {/* WIP Limit Warning */}
        {renderWipWarning()}

        {/* Conteúdo das Tarefas */}
        <CardContent className="p-3 flex-1 flex flex-col">
          {visibleTasks.length === 0 && !movingTaskId ? (
            renderEmptyState()
          ) : (
            <div className="flex-1 overflow-y-auto max-h-[calc(100vh-300px)]">
              {renderTaskList()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 🔹 DEBUG VISUAL (apenas desenvolvimento) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded text-center">
          Status: {column.status} | ID: {column.id.slice(0, 8)}... | WIP: {safeWipLimit}
        </div>
      )}
    </div>
  );
}

// 🔹 COMPONENTE DE PLACEHOLDER PARA COLUNAS CARREGANDO
export function KanbanColumnSkeleton({ title = "Carregando..." }: { title?: string }) {
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="px-4 py-3 rounded-lg border bg-muted/50 border-muted/30 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-20"></div>
          </div>
          <div className="w-8 h-6 bg-muted rounded-full"></div>
        </div>
      </div>

      <Card className="flex-1 min-h-[200px] animate-pulse">
        <CardContent className="p-3 space-y-3 h-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl mb-2 opacity-30">📥</div>
            <p className="text-sm text-muted-foreground">{title}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}