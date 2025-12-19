// src/components/task-card.tsx - VERSÃO COM ALTURA UNIFORME
import { useDraggable } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Edit2,
  Trash2,
  Lock,
  Move,
  Calendar,
  User,
  Eye,
  Filter,
} from "lucide-react";
import type { Task, ColumnStatus } from "@/types/kanban";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onView?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  isReadOnly?: boolean;
  movingTaskId?: string | null;
  isFilteredMatch?: boolean;
}

export function TaskCard({
  task,
  onEdit,
  onView,
  onDelete,
  isReadOnly = false,
  movingTaskId = null,
  isFilteredMatch = true,
}: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
      disabled: isReadOnly || !!movingTaskId,
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${
          isDragging ? 1.02 : 1
        })`,
        zIndex: isDragging ? 50 : 1,
      }
    : undefined;

  const isDisabled = isReadOnly || movingTaskId === task.id;

  const priorityConfig = {
    urgente: {
      color:
        "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300",
      label: "Urgente",
      icon: "🔥",
    },
    alta: {
      color:
        "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300",
      label: "Alta",
      icon: "⚡",
    },
    media: {
      color:
        "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300",
      label: "Média",
      icon: "📋",
    },
    baixa: {
      color:
        "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300",
      label: "Baixa",
      icon: "🌱",
    },
  };

  const dueDate = task.due_date
    ? new Date(task.due_date).toLocaleDateString("pt-BR")
    : null;
  const isOverdue = dueDate && new Date(task.due_date!) < new Date();

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...(!isDisabled ? { ...listeners, ...attributes } : {})}
      className={cn(
        "group transition-all duration-300 border-2 relative overflow-hidden",
        "hover:shadow-md hover:border-primary/30",
        isDragging && "opacity-50 shadow-2xl rotate-2",
        isDisabled ? "cursor-default" : "cursor-grab active:cursor-grabbing",
        isOverdue && "border-red-300 bg-red-50/50 dark:bg-red-900/10",
        // ✅ ESTILO PARA TAREFAS QUE NÃO CORRESPONDEM AO FILTRO
        !isFilteredMatch && [
          "opacity-50", // Reduz opacidade
          "border-dashed border-muted-foreground/30", // Borda tracejada
          "bg-muted/30", // Fundo mais claro
          "hover:opacity-70", // Efeito hover suave
        ],
        // ✅ ALTURA FLEXÍVEL PARA UNIFORMIZAR
        "h-full min-h-[120px] flex flex-col"
      )}
    >
      {/* ✅ INDICADOR DE FILTRO (quando a tarefa corresponde) */}
      {isFilteredMatch && (
        <div className="absolute top-2 right-2 z-10">
          <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
        </div>
      )}

      {/* ✅ OVERLAY QUANDO NÃO CORRESPONDE AO FILTRO */}
      {!isFilteredMatch && (
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent pointer-events-none rounded-lg z-0"></div>
      )}

      <CardContent className="p-4 flex-1 flex flex-col justify-between gap-2">
        {/* CABEÇALHO: Título e Botões */}
        <div className="flex items-start justify-between gap-2">
          <h3
            className={cn(
              "font-semibold text-sm leading-tight flex-1 line-clamp-2",
              isDisabled && "text-muted-foreground",
              // ✅ ESTILO PARA TÍTULO QUANDO NÃO CORRESPONDE
              !isFilteredMatch && "text-muted-foreground/70"
            )}
          >
            {task.title}
            {/* ✅ BADGE INDICANDO QUE NÃO CORRESPONDE AO FILTRO */}
            {!isFilteredMatch && (
              <span className="ml-2 inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-muted rounded">
                <Filter className="h-2.5 w-2.5" />
                oculto
              </span>
            )}
          </h3>

          {/* BOTÕES DE AÇÃO - APENAS PARA TAREFAS QUE CORRESPONDEM */}
          {!isDisabled && isFilteredMatch && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                onClick={(e) => {
                  e.stopPropagation();
                  onView?.(task);
                }}
                title="Visualizar"
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(task);
                }}
                title="Editar"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:bg-destructive/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(task.id);
                }}
                title="Excluir"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>

        {/* DESCRIÇÃO (se houver) */}
        {task.description && (
          <p
            className={cn(
              "text-xs text-muted-foreground line-clamp-2 leading-relaxed italic flex-1",
              // ✅ ESTILO PARA DESCRIÇÃO QUANDO NÃO CORRESPONDE
              !isFilteredMatch && "opacity-60"
            )}
          >
            {task.description}
          </p>
        )}

        {/* RODAPÉ: Prioridade e Data */}
        <div className="flex justify-between items-center pt-2 mt-auto">
          {(() => {
            const config =
              priorityConfig[task.priority] || priorityConfig.media;
            return (
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] px-1.5 h-5 font-medium transition-colors flex-shrink-0",
                  config.color,
                  // ✅ ESTILO PARA BADGE QUANDO NÃO CORRESPONDE
                  !isFilteredMatch && "opacity-60 border-dashed"
                )}
              >
                <span className="mr-1">{config.icon}</span> {config.label}
              </Badge>
            );
          })()}

          <div className="flex gap-2 text-muted-foreground">
            {dueDate && (
              <span
                className={cn(
                  "text-[10px] flex items-center gap-1 flex-shrink-0",
                  isOverdue && "text-red-600 font-bold",
                  // ✅ ESTILO PARA DATA QUANDO NÃO CORRESPONDE
                  !isFilteredMatch && "opacity-60"
                )}
              >
                <Calendar className="h-3 w-3" /> {dueDate}
              </span>
            )}
          </div>
        </div>

        {/* INFO ADICIONAL (assigned_to) */}
        {task.assigned_to && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1 border-t border-muted/30">
            <User className="h-3 w-3" />
            <span className="truncate">{task.assigned_to}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
