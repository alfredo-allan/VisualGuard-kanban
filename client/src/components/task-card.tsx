import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Task } from "@/types/kanban";
import { AlertCircle, ArrowUp, Minus } from "lucide-react";

interface TaskCardProps {
  task: Task;
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

export function TaskCard({ task }: TaskCardProps) {
  const priorityInfo = priorityConfig[task.priority];
  const PriorityIcon = priorityInfo.icon;

  return (
    <Card 
      className="p-4 hover-elevate active-elevate-2 transition-all duration-200 cursor-pointer group"
      data-testid={`card-task-${task.id}`}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm leading-tight flex-1 group-hover:text-primary transition-colors" data-testid={`text-task-title-${task.id}`}>
            {task.title}
          </h3>
          <Badge 
            variant={priorityInfo.variant} 
            className="flex items-center gap-1 shrink-0"
            data-testid={`badge-priority-${task.id}`}
          >
            <PriorityIcon className="h-3 w-3" />
            <span className="text-xs">{priorityInfo.label}</span>
          </Badge>
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
