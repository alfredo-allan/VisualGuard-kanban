import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { type Task, type Priority, type ColumnStatus } from "@/types/kanban";
import { useEffect } from "react";

const taskSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(100, "Título muito longo"),
  description: z.string().max(500, "Descrição muito longa").optional(),
  priority: z.enum(["baixa", "media", "alta", "urgente"]),
  status: z.enum(["backlog", "a-fazer", "em-progresso", "concluido"]),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  onSave: (task: Omit<Task, "id"> & { id?: string }) => void;
}

export function TaskDialog({ open, onOpenChange, task, onSave }: TaskDialogProps) {
  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "media",
      status: "a-fazer",
    },
  });

  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        status: task.status,
      });
    } else {
      form.reset({
        title: "",
        description: "",
        priority: "media",
        status: "a-fazer",
      });
    }
  }, [task, form]);

  const onSubmit = (data: TaskFormData) => {
    onSave({
      ...data,
      id: task?.id,
    });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" data-testid="dialog-task">
        <DialogHeader>
          <DialogTitle>{task ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle>
          <DialogDescription>
            {task ? "Atualize os detalhes da tarefa" : "Preencha os detalhes da nova tarefa"}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título*</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Digite o título da tarefa" 
                      {...field} 
                      data-testid="input-task-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Digite uma descrição (opcional)" 
                      className="resize-none min-h-[100px]"
                      {...field} 
                      data-testid="input-task-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridade*</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-task-priority">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="baixa" data-testid="option-priority-baixa">Baixa</SelectItem>
                        <SelectItem value="media" data-testid="option-priority-media">Média</SelectItem>
                        <SelectItem value="alta" data-testid="option-priority-alta">Alta</SelectItem>
                        <SelectItem value="urgente" data-testid="option-priority-urgente">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status*</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-task-status">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="backlog" data-testid="option-status-backlog">Backlog</SelectItem>
                        <SelectItem value="a-fazer" data-testid="option-status-a-fazer">A Fazer</SelectItem>
                        <SelectItem value="em-progresso" data-testid="option-status-em-progresso">Em Progresso</SelectItem>
                        <SelectItem value="concluido" data-testid="option-status-concluido">Concluído</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-task"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                data-testid="button-save-task"
              >
                {task ? "Salvar Alterações" : "Criar Tarefa"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
