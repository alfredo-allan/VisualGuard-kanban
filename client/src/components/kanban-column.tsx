// src/components/kanban-column.tsx - VERSÃO REFATORADA COM FILTRO E ALTURA UNIFORME
import { useDroppable } from "@dnd-kit/core";
import {
  type KanbanColumn as KanbanColumnType,
  type Task,
  type ColumnStatus,
  debugColumn,
  debugTask,
} from "@/types/kanban";
import { TaskCard } from "./task-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, AlertCircle, Clock, CheckCircle2, Search } from "lucide-react";
import { cn } from "@/lib/utils";

// 🔹 INTERFACE DE PROPS ATUALIZADA COM onViewTask E filteredTaskIds
interface KanbanColumnProps {
  column: KanbanColumnType;
  onEditTask?: (task: Task) => void;
  onViewTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  onMoveTask?: (taskId: string, newStatus: ColumnStatus) => void;
  isReadOnly?: boolean;
  movingTaskId?: string | null;
  filteredTaskIds?: string[]; // ✅ IDs das tarefas que correspondem ao filtro
}

// 🔹 CONFIGURAÇÃO DE CORES E ÍCONES
const columnConfig: Record<
  ColumnStatus,
  {
    color: string;
    icon: React.ReactNode;
    description: string;
    gradient: string;
  }
> = {
  backlog: {
    color:
      "bg-slate-50 border-slate-200 dark:bg-slate-900/50 dark:border-slate-700",
    icon: "📥",
    description: "Tarefas a serem planejadas",
    gradient:
      "from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800",
  },
  "a-fazer": {
    color:
      "bg-blue-50 border-blue-200 dark:bg-blue-900/50 dark:border-blue-700",
    icon: "📋",
    description: "Tarefas prontas para execução",
    gradient: "from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900",
  },
  "em-progresso": {
    color:
      "bg-amber-50 border-amber-200 dark:bg-amber-900/50 dark:border-amber-700",
    icon: "⚡",
    description: "Tarefas em andamento",
    gradient:
      "from-amber-50 to-orange-50 dark:from-amber-900 dark:to-orange-900",
  },
  concluido: {
    color:
      "bg-green-50 border-green-200 dark:bg-green-900/50 dark:border-green-700",
    icon: "✅",
    description: "Tarefas finalizadas",
    gradient:
      "from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900",
  },
};

// 🔹 ÍCONES PARA WIP LIMIT
const WipLimitIcon = ({
  current,
  limit,
}: {
  current: number;
  limit: number;
}) => {
  const safeLimit = limit > 0 ? limit : 1;

  if (current <= safeLimit * 0.7)
    return <CheckCircle2 className="h-3 w-3 text-green-500" />;
  if (current <= safeLimit * 0.9)
    return <Clock className="h-3 w-3 text-amber-500" />;
  return <AlertCircle className="h-3 w-3 text-red-500" />;
};

export function KanbanColumn({
  column,
  onEditTask,
  onViewTask,
  onDeleteTask,
  onMoveTask,
  isReadOnly = false,
  movingTaskId = null,
  filteredTaskIds,
}: KanbanColumnProps) {
  console.group(`🎯 KANBAN COLUMN: ${column.title}`);
  debugColumn(column, `Renderizando coluna`);

  // 🔹 CONFIG DROPPABLE
  const { setNodeRef, isOver } = useDroppable({
    id: column.status,
    disabled: isReadOnly,
  });

  console.log(`🔄 Droppable: isOver=${isOver}, disabled=${isReadOnly}`);

  // 🔹 CONFIGURAÇÃO DA COLUNA
  const config = columnConfig[column.status] || columnConfig["backlog"];

  // 🔹 CONFIG WIP LIMIT
  const hasWipLimit =
    column.wip_limit !== null &&
    column.wip_limit !== undefined &&
    column.wip_limit > 0;
  const safeWipLimit = column.wip_limit || 0;
  const isWipLimitExceeded = hasWipLimit && column.tasks.length > safeWipLimit;

  console.log(
    `📊 WIP: ${column.tasks.length}/${safeWipLimit} | Exceeded: ${isWipLimitExceeded}`
  );

  // 🔹 FILTRAR TAREFAS
  const visibleTasks = column.tasks.filter((task) => task.id !== movingTaskId);

  // ✅ VERIFICA SE HÁ FILTRO ATIVO
  const hasFilter =
    Array.isArray(filteredTaskIds) && filteredTaskIds.length > 0;

  // ✅ CALCULA TAREFAS QUE CORRESPONDEM AO FILTRO
  const filteredTasks = hasFilter
    ? visibleTasks.filter((task) => filteredTaskIds.includes(task.id))
    : visibleTasks;

  // ✅ VERIFICA SE NENHUMA TAREFA CORRESPONDE AO FILTRO (mas há tarefas na coluna)
  const noTasksMatchFilter =
    hasFilter && filteredTasks.length === 0 && visibleTasks.length > 0;

  console.log(
    `👀 Tasks: ${visibleTasks.length} total | ${filteredTasks.length} filtradas | Filtro ativo: ${hasFilter}`
  );

  // 🔹 RENDER HEADER DA COLUNA
  const renderColumnHeader = () => (
    <div
      className={cn(
        "px-4 py-3 rounded-lg border transition-all duration-300",
        config.color,
        isReadOnly && "opacity-80",
        isOver &&
          !isReadOnly &&
          "ring-2 ring-primary/50 bg-primary/5 border-primary/30",
        `bg-gradient-to-r ${config.gradient}`,
        hasFilter && "opacity-90" // ✅ Destaque visual quando filtro está ativo
      )}
    >
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
            <p
              className="text-xs text-muted-foreground truncate"
              title={config.description}
            >
              {config.description}
            </p>
          </div>

          {isReadOnly && (
            <Lock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          )}

          {/* ✅ INDICADOR DE FILTRO ATIVO */}
          {hasFilter && (
            <Search className="h-3 w-3 text-primary flex-shrink-0 animate-pulse hidden" />
          )}
        </div>

        {/* LADO DIREITO: Contadores e Badges */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* WIP Limit Indicator */}
          {hasWipLimit && (
            <div
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors",
                isWipLimitExceeded
                  ? "bg-gradient-to-r from-red-100 to-orange-100 text-red-700 dark:from-red-900/50 dark:to-orange-900/50 dark:text-red-300"
                  : "bg-gradient-to-r from-muted/50 to-muted/30 text-muted-foreground",
                hasFilter && "opacity-70" // ✅ Reduz opacidade quando filtro está ativo
              )}
            >
              <WipLimitIcon
                current={column.tasks.length}
                limit={safeWipLimit}
              />
              <span>
                {column.tasks.length}/{safeWipLimit}
              </span>
            </div>
          )}

          {/* Badge de Contagem - MOSTRA CONTAGEM FILTRADA */}
          <Badge
            variant={isWipLimitExceeded ? "destructive" : "secondary"}
            className={cn(
              "text-xs font-medium transition-all duration-300",
              isWipLimitExceeded && "animate-pulse",
              "bg-gradient-to-r from-primary/90 to-primary text-primary-foreground",
              hasFilter && "ring-2 ring-primary/50" // ✅ Destaque quando filtro está ativo
            )}
            data-testid={`text-task-count-${column.id}`}
          >
            {/* ✅ MOSTRA CONTAGEM FILTRADA SE HOUVER FILTRO */}
            {hasFilter
              ? `${filteredTasks.length}/${visibleTasks.length}`
              : column.tasks.length}
            {movingTaskId &&
              column.tasks.some((t) => t.id === movingTaskId) &&
              "🚀"}
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
        <p className="text-xs text-muted-foreground">Arraste tarefas para cá</p>
      )}
    </div>
  );

  // 🔹 RENDER ESTADO DE NENHUMA TAREFA CORRESPONDE AO FILTRO
  const renderNoFilterMatchState = () => (
    <div className="flex flex-col items-center justify-center h-32 text-center p-4">
      <div className="text-2xl mb-2 opacity-50">🔍</div>
      <p className="text-sm text-muted-foreground mb-1">
        Nenhuma tarefa corresponde ao filtro
      </p>
      <p className="text-xs text-muted-foreground">
        {column.tasks.length} tarefas nesta coluna
      </p>
    </div>
  );

  // 🔹 RENDER LISTA DE TAREFAS COM ALTURA UNIFORME
  const renderTaskList = () => (
    <div className="grid gap-3 auto-rows-fr">
      {" "}
      {/* ✅ Grid com altura igual para todas as tarefas */}
      {filteredTasks.map((task) => {
        console.log(`🎯 Renderizando task: ${task.title} (${task.id})`);
        debugTask(task, `Task na coluna ${column.title}`);

        const isTaskInFilter = hasFilter
          ? filteredTaskIds.includes(task.id)
          : true;

        return (
          <div
            key={task.id}
            className="min-h-[120px] h-full" // ✅ Container com altura mínima definida
          >
            <TaskCard
              task={task}
              onEdit={onEditTask}
              onView={onViewTask}
              onDelete={onDeleteTask}
              isReadOnly={isReadOnly}
              movingTaskId={movingTaskId}
              isFilteredMatch={isTaskInFilter} // ✅ Passa informação de filtro para TaskCard
            />
          </div>
        );
      })}
      {/* 🔹 INDICADOR DE TAREFA SENDO MOVIDA */}
      {movingTaskId && column.tasks.some((t) => t.id === movingTaskId) && (
        <div
          className={cn(
            "border-2 border-dashed border-primary/30 rounded-lg p-4",
            "bg-gradient-to-r from-primary/5 to-primary/10 animate-pulse transition-all",
            "min-h-[120px] flex items-center justify-center" // ✅ Mesma altura das outras tarefas
          )}
        >
          <div className="flex items-center justify-center gap-2 text-sm text-primary/70">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            Movendo tarefa...
          </div>
        </div>
      )}
    </div>
  );

  // 🔹 RENDER WIP LIMIT WARNING
  const renderWipWarning = () => {
    if (!isWipLimitExceeded || isReadOnly) return null;

    return (
      <div className="mx-3 -mt-2 mb-2">
        <div className="bg-gradient-to-r from-red-50/80 to-orange-50/80 border border-red-200 dark:border-red-800 rounded-lg p-2 text-center">
          <p className="text-xs text-red-700 dark:text-red-300 font-medium flex items-center justify-center gap-1">
            <AlertCircle className="h-3 w-3" />
            ⚠️ Limite WIP excedido!
          </p>
          <p className="text-xs text-red-600 dark:text-red-400">
            {column.tasks.length} de {safeWipLimit} tarefas
          </p>
        </div>
      </div>
    );
  };

  // 🔹 RENDER INDICADOR DE FILTRO ATIVO
  const renderFilterIndicator = () => {
    if (!hasFilter || noTasksMatchFilter) return null;

    return (
      <div className="mx-3 -mt-2 mb-2 hidden">
        <div className="bg-gradient-to-r from-primary/10 to-blue-50/80 border border-primary/30 dark:border-primary/70 rounded-lg p-2 text-center">
          <p className="text-xs text-primary dark:text-primary-300 font-medium flex items-center justify-center gap-1">
            <Search className="h-3 w-3" />
            🔍 Filtro ativo: {filteredTasks.length} de {visibleTasks.length}{" "}
            tarefas
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
      data-has-filter={hasFilter} // ✅ Atributo para testes
    >
      {/* Header da Coluna */}
      {renderColumnHeader()}

      {/* Área de Tarefas */}
      <Card
        ref={setNodeRef}
        className={cn(
          "flex-1 transition-all duration-300 flex flex-col",
          "border-2",
          isOver && !isReadOnly
            ? "border-primary/50 bg-primary/5 ring-2 ring-primary/20 shadow-lg shadow-primary/10"
            : "border-transparent hover:border-border/50",
          isReadOnly && "bg-muted/20 opacity-90",
          isWipLimitExceeded &&
            "border-red-200 bg-gradient-to-b from-red-50/30 to-transparent dark:border-red-800 dark:from-red-900/10",
          hasFilter && "border-primary/20" // ✅ Destaque quando filtro está ativo
        )}
      >
        {/* WIP Limit Warning */}
        {renderWipWarning()}

        {/* Indicador de Filtro Ativo */}
        {renderFilterIndicator()}

        {/* Conteúdo das Tarefas */}
        <CardContent className="p-3 flex-1 flex flex-col">
          {visibleTasks.length === 0 && !movingTaskId ? (
            renderEmptyState()
          ) : noTasksMatchFilter ? (
            renderNoFilterMatchState()
          ) : (
            <div className="flex-1 overflow-y-auto max-h-[calc(100vh-300px)]">
              {renderTaskList()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 🔹 DICA DE USO (apenas quando não há tarefas sendo movidas) */}
      {!movingTaskId && !isReadOnly && visibleTasks.length > 0 && (
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            {/* Dicas de uso podem ser adicionadas aqui */}
          </p>
        </div>
      )}
    </div>
  );
}

// 🔹 COMPONENTE DE PLACEHOLDER PARA COLUNAS CARREGANDO
export function KanbanColumnSkeleton({
  title = "Carregando...",
}: {
  title?: string;
}) {
  return (
    <div className="flex flex-col gap-4 h-full animate-pulse">
      <div className="px-4 py-3 rounded-lg border bg-gradient-to-r from-muted/50 to-muted/30 border-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-24"></div>
          </div>
          <div className="w-10 h-6 bg-muted rounded-full"></div>
        </div>
      </div>

      <Card className="flex-1 flex flex-col">
        <CardContent className="p-3 flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl mb-2 opacity-30">📥</div>
            <p className="text-sm text-muted-foreground">{title}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
