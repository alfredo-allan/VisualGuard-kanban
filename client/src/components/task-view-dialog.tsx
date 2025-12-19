// src/components/task-view-dialog.tsx (versão corrigida)
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Tag, User, FileText } from "lucide-react";
import type { Task } from "@/types/kanban";
import { cn } from "@/lib/utils";

interface TaskViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
}

export function TaskViewDialog({
  open,
  onOpenChange,
  task,
}: TaskViewDialogProps) {
  if (!task) return null;

  // ✅ CALCULAR DATA FINAL (15 DIAS APÓS A CRIAÇÃO)
  const getFinalDate = () => {
    if (!task.created_at) return "Não definido";

    const createdDate = new Date(task.created_at);
    const finalDate = new Date(createdDate);
    finalDate.setDate(finalDate.getDate() + 15); // Adiciona 15 dias

    return finalDate.toLocaleDateString("pt-BR");
  };

  const finalDate = getFinalDate();
  const isOverdue =
    new Date() >
    new Date(
      new Date(task.created_at || new Date()).getTime() +
        15 * 24 * 60 * 60 * 1000
    );

  const createdAt = task.created_at
    ? new Date(task.created_at).toLocaleDateString("pt-BR")
    : null;

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

  const statusConfig = {
    backlog: {
      label: "Backlog",
      color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    },
    "a-fazer": {
      label: "A Fazer",
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    },
    "em-progresso": {
      label: "Em Progresso",
      color:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
    },
    concluido: {
      label: "Concluído",
      color:
        "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    },
  };

  const priority = priorityConfig[task.priority] || priorityConfig.media;
  const status = statusConfig[task.status] || statusConfig["a-fazer"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">
                {task.title}
              </DialogTitle>
              <DialogDescription className="mt-2">
                Detalhes completos da tarefa
              </DialogDescription>
            </div>

            <div className="flex gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "text-sm px-3 py-1.5 font-semibold",
                  priority.color
                )}
              >
                <span className="mr-2">{priority.icon}</span> {priority.label}
              </Badge>

              <Badge
                variant="outline"
                className={cn(
                  "text-sm px-3 py-1.5 font-semibold",
                  status.color
                )}
              >
                {status.label}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Descrição */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="h-4 w-4" />
              <h3 className="font-medium">Descrição</h3>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 min-h-[100px]">
              {task.description ? (
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                  {task.description}
                </p>
              ) : (
                <p className="text-muted-foreground italic">
                  Nenhuma descrição fornecida
                </p>
              )}
            </div>
          </div>

          {/* Metadados */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ✅ DATA FINAL (15 DIAS APÓS CRIAÇÃO) */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <h3 className="font-medium">Data Final</h3>
              </div>
              <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
                <span
                  className={cn(
                    "font-medium",
                    isOverdue && "text-red-600 font-bold"
                  )}
                >
                  {finalDate}
                </span>
                {isOverdue && (
                  <Badge variant="destructive" className="text-xs">
                    Atrasado
                  </Badge>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Tag className="h-4 w-4" />
                <h3 className="font-medium">Status</h3>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <span className="font-medium">{status.label}</span>
              </div>
            </div>

            {/* Data de Criação */}
            {createdAt && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <h3 className="font-medium">Criado em</h3>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <span className="font-medium">{createdAt}</span>
                  <div className="text-xs text-muted-foreground mt-1">
                    +15 dias para conclusão
                  </div>
                </div>
              </div>
            )}

            {/* ID da Tarefa */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Tag className="h-4 w-4" />
                <h3 className="font-medium">ID da Tarefa</h3>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <code className="text-xs font-mono bg-background px-2 py-1 rounded">
                  {task.id}
                </code>
              </div>
            </div>
          </div>

          {/* Informações Adicionais */}
          {task.assigned_to && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <h3 className="font-medium">Atribuído a</h3>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <span className="font-medium">{task.assigned_to}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-6 mt-6 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
