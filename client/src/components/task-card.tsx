import { useDraggable } from "@dnd-kit/core";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type Task, type ColumnStatus } from "@/types/kanban";
import { AlertCircle, ArrowUp, Minus, MoreVertical, Edit, Trash2, ArrowRight, GripVertical } from "lucide-react";

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onMove?: (taskId: string, newStatus: ColumnStatus) => void;
}

const priorityConfig = {
  baixa: {
    label: "Baixa",
    variant: "secondary" as const,
    icon: Minus,
  },
  media: {
    label: "Média",
    variant: "outline" as const,
    icon: Minus,
  },
  alta: {
    label: "Alta",
    variant: "default" as const,
    icon: ArrowUp,
  },
  urgente: {
    label: "Urgente",
    variant: "destructive" as const,
    icon: AlertCircle,
  },
};

const statusOptions: { value: ColumnStatus; label: string }[] = [
  { value: "backlog", label: "Backlog" },
  { value: "a-fazer", label: "A Fazer" },
  { value: "em-progresso", label: "Em Progresso" },
  { value: "concluido", label: "Concluído" },
];

export function TaskCard({ task, onEdit, onDelete, onMove }: TaskCardProps) {
  const priorityInfo = priorityConfig[task.priority];
  const PriorityIcon = priorityInfo.icon;

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className={`p-4 hover-elevate active-elevate-2 transition-all duration-200 group relative ${
        isDragging ? "opacity-50" : ""
      }`}
      data-testid={`card-task-${task.id}`}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div 
            {...attributes} 
            {...listeners}
            className="cursor-grab active:cursor-grabbing mr-2 flex items-center text-muted-foreground hover:text-foreground transition-colors"
            data-testid={`handle-drag-${task.id}`}
          >
            <GripVertical className="h-4 w-4" />
          </div>
          
          <h3 className="font-semibold text-sm leading-tight flex-1 group-hover:text-primary transition-colors" data-testid={`text-task-title-${task.id}`}>
            {task.title}
          </h3>
          
          <div className="flex items-center gap-1 shrink-0">
            <Badge 
              variant={priorityInfo.variant} 
              className="flex items-center gap-1"
              data-testid={`badge-priority-${task.id}`}
            >
              <PriorityIcon className="h-3 w-3" />
              <span className="text-xs">{priorityInfo.label}</span>
            </Badge>
            
            {(onEdit || onDelete || onMove) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    data-testid={`button-task-menu-${task.id}`}
                  >
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(task)} data-testid={`button-edit-task-${task.id}`}>
                      <Edit className="h-3 w-3 mr-2" />
                      Editar
                    </DropdownMenuItem>
                  )}
                  {onMove && (
                    <>
                      <DropdownMenuSeparator />
                      {statusOptions
                        .filter(status => status.value !== task.status)
                        .map((status) => (
                          <DropdownMenuItem 
                            key={status.value}
                            onClick={() => onMove(task.id, status.value)}
                            data-testid={`button-move-${task.id}-${status.value}`}
                          >
                            <ArrowRight className="h-3 w-3 mr-2" />
                            Mover para {status.label}
                          </DropdownMenuItem>
                        ))}
                    </>
                  )}
                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onDelete(task.id)}
                        className="text-destructive"
                        data-testid={`button-delete-task-${task.id}`}
                      >
                        <Trash2 className="h-3 w-3 mr-2" />
                        Deletar
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2" data-testid={`text-task-description-${task.id}`}>
            {task.description}
          </p>
        )}
      </div>
    </Card>
  );
}
