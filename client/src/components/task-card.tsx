// src/components/task-card.tsx - VERSÃO 100% REFATORADA
import { useDraggable } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, Lock, Move, Calendar, User } from "lucide-react";
import type { Task, ColumnStatus } from "@/types/kanban";
import { cn } from "@/lib/utils";
import { debugTask } from "@/types/kanban";

// 🔹 INTERFACE DE PROPS ATUALIZADA
interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onMove?: (taskId: string, newStatus: ColumnStatus) => void;
  isReadOnly?: boolean;
  movingTaskId?: string | null; // ✅ NOVA PROP ADICIONADA
}

export function TaskCard({
  task,
  onEdit,
  onDelete,
  onMove,
  isReadOnly = false,
  movingTaskId = null // ✅ PROP ADICIONADA
}: TaskCardProps) {
  console.group(`🎯 TASK CARD: ${task.title}`);
  debugTask(task, "Renderizando task card");

  // 🔹 DRAGGABLE CONFIG - COM DEBUG
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: task.id,
    disabled: isReadOnly || !!movingTaskId, // ✅ DESABILITA SE TAREFA ESTÁ SENDO MOVIDA
  });

  console.log(`🔄 Draggable: isDragging=${isDragging}, disabled=${isReadOnly || !!movingTaskId}`);

  const style = transform
    ? {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${isDragging ? 0.95 : 1})`,
    }
    : undefined;

  // 🔹 VERIFICAR SE ESTÁ SENDO MOVIDA
  const isBeingMoved = movingTaskId === task.id;
  const isDisabled = isReadOnly || isBeingMoved;

  console.log(`🎯 Estado: isBeingMoved=${isBeingMoved}, isDisabled=${isDisabled}`);

  // 🔹 CONFIGURAÇÃO DE PRIORIDADE - REFATORADA
  const priorityConfig = {
    "urgente": {
      color: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800",
      label: "Urgente",
      icon: "🔥"
    },
    "alta": {
      color: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-800",
      label: "Alta",
      icon: "⚡"
    },
    "media": {
      color: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-800",
      label: "Média",
      icon: "📋"
    },
    "baixa": {
      color: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800",
      label: "Baixa",
      icon: "🌱"
    },
  };

  // 🔹 HANDLERS - COM VALIDAÇÃO
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDisabled && onEdit) {
      console.log(`✏️ Editando tarefa: ${task.title}`);
      onEdit(task);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDisabled && onDelete) {
      console.log(`🗑️ Deletando tarefa: ${task.title}`);
      onDelete(task.id);
    }
  };

  // 🔹 FORMATAR DATA
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return null;
    }
  };

  const dueDate = formatDate(task.due_date);
  const isOverdue = dueDate && new Date(task.due_date!) < new Date();

  // 🔹 RENDER BADGE DE PRIORIDADE
  const renderPriorityBadge = () => {
    const config = priorityConfig[task.priority] || priorityConfig.media;

    return (
      <Badge
        variant="outline"
        className={cn(
          "text-xs font-medium capitalize transition-all",
          config.color,
          isBeingMoved && "opacity-50"
        )}
        data-testid={`badge-priority-${task.id}`}
      >
        <span className="mr-1">{config.icon}</span>
        {config.label}
      </Badge>
    );
  };

  // 🔹 RENDER AÇÕES
  const renderActions = () => {
    if (isDisabled) return null;

    return (
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
        {onEdit && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-blue-100 dark:hover:bg-blue-900"
            onClick={handleEdit}
            data-testid={`button-edit-task-${task.id}`}
            title="Editar tarefa"
          >
            <Edit2 className="h-3 w-3" />
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive hover:bg-destructive/10"
            onClick={handleDelete}
            data-testid={`button-delete-task-${task.id}`}
            title="Excluir tarefa"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  };

  // 🔹 RENDER METADADOS
  const renderMetadata = () => {
    if (!dueDate && !task.assignee_id) return null;

    return (
      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
        {dueDate && (
          <div className={cn(
            "flex items-center gap-1",
            isOverdue && "text-red-500 font-medium"
          )}>
            <Calendar className="h-3 w-3" />
            <span>{dueDate}</span>
            {isOverdue && <span className="text-xs">(Atrasada)</span>}
          </div>
        )}

        {task.assignee_id && (
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{task.assignee_id.slice(0, 8)}...</span>
          </div>
        )}
      </div>
    );
  };

  console.groupEnd();

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...(!isDisabled ? { ...listeners, ...attributes } : {})}
      className={cn(
        "group transition-all duration-200 border-2",
        "hover:shadow-md hover:border-primary/20",

        // Estados de drag
        isDragging && "opacity-70 scale-95 shadow-lg z-50",
        isBeingMoved && "opacity-40 pointer-events-none bg-muted/50",

        // Estados de disabled
        isDisabled && "cursor-default",
        !isDisabled && "cursor-grab active:cursor-grabbing",

        // Modo read-only
        isReadOnly && "bg-muted/30 border-dashed",

        // Overdue task
        isOverdue && "border-red-200 bg-red-50/30 dark:border-red-800 dark:bg-red-900/20"
      )}
      data-testid={`task-card-${task.id}`}
      data-task-status={task.status}
      data-task-priority={task.priority}
      data-being-moved={isBeingMoved}
    >
      <CardContent className="p-4 space-y-3">
        {/* 🔹 HEADER COM TÍTULO E AÇÕES */}
        <div className="flex items-start justify-between gap-2">
          {/* Título */}
          <h3 className={cn(
            "font-medium text-sm leading-tight flex-1 break-words",
            isDisabled ? "text-muted-foreground" : "text-foreground",
            isBeingMoved && "italic"
          )}>
            {task.title}
            {isBeingMoved && " (movendo...)"}
          </h3>

          {/* Ações */}
          {renderActions()}

          {/* Ícone de estado */}
          <div className="flex-shrink-0">
            {isReadOnly && (
              <Lock
                className="h-3 w-3 text-muted-foreground mt-0.5"
                data-testid={`icon-lock-task-${task.id}`}
              />
            )}
            {isBeingMoved && (
              <Move className="h-3 w-3 text-primary animate-pulse mt-0.5" />
            )}
          </div>
        </div>

        {/* 🔹 DESCRIÇÃO */}
        {task.description && (
          <p className={cn(
            "text-xs leading-relaxed break-words line-clamp-3",
            isDisabled ? "text-muted-foreground" : "text-muted-foreground"
          )}>
            {task.description}
          </p>
        )}

        {/* 🔹 METADADOS (Data e Assignee) */}
        {renderMetadata()}

        {/* 🔹 FOOTER COM PRIORIDADE */}
        <div className="flex justify-between items-center pt-2">
          {renderPriorityBadge()}

          {/* Indicador de demonstração */}
          {isReadOnly && (
            <div
              className="text-xs text-muted-foreground italic"
              data-testid={`text-demo-${task.id}`}
            >
              Demonstração
            </div>
          )}
        </div>

        {/* 🔹 DEBUG VISUAL (apenas desenvolvimento) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-muted-foreground border-t pt-2 mt-2">
            ID: {task.id.slice(0, 8)}... | Status: {task.status}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 🔹 COMPONENTE DE PLACEHOLDER PARA TAREFA CARREGANDO
export function TaskCardSkeleton() {
  return (
    <Card className="animate-pulse border-2 border-dashed">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="h-4 bg-muted rounded flex-1"></div>
          <div className="flex gap-1">
            <div className="h-6 w-6 bg-muted rounded"></div>
            <div className="h-6 w-6 bg-muted rounded"></div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="h-3 bg-muted rounded w-full"></div>
          <div className="h-3 bg-muted rounded w-3/4"></div>
        </div>

        <div className="flex justify-between items-center">
          <div className="h-6 w-16 bg-muted rounded-full"></div>
          <div className="h-4 w-20 bg-muted rounded"></div>
        </div>
      </CardContent>
    </Card>
  );
}

// 🔹 COMPONENTE DE TAREFA SENDO MOVIDA (Placeholder)
export function TaskCardMovingPlaceholder({ task }: { task: Task }) {
  return (
    <Card className="border-2 border-dashed border-primary/50 bg-primary/5 animate-pulse">
      <CardContent className="p-4 text-center">
        <Move className="h-6 w-6 text-primary mx-auto mb-2 animate-bounce" />
        <p className="text-sm text-primary font-medium">Movendo tarefa...</p>
        <p className="text-xs text-muted-foreground mt-1">{task.title}</p>
      </CardContent>
    </Card>
  );
}