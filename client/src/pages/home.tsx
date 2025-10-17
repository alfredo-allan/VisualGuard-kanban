import { KanbanBoard } from "@/components/kanban-board";
import { TaskDialog } from "@/components/task-dialog";
import { TaskFilters } from "@/components/task-filters";
import { type Task, type ColumnStatus, type Priority } from "@/types/kanban";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState, useMemo } from "react";
import { nanoid } from "nanoid";

const defaultTasks: Task[] = [
  {
    id: "1",
    title: "Configurar ambiente de desenvolvimento",
    description: "Instalar dependências e configurar ferramentas necessárias para o projeto",
    priority: "alta",
    status: "concluido",
  },
  {
    id: "2",
    title: "Criar design system",
    description: "Definir paleta de cores, tipografia e componentes base",
    priority: "alta",
    status: "concluido",
  },
  {
    id: "3",
    title: "Implementar autenticação de usuários",
    description: "Sistema de login e registro com validação de credenciais",
    priority: "alta",
    status: "em-progresso",
  },
  {
    id: "4",
    title: "Desenvolver dashboard principal",
    description: "Página inicial com métricas e visualizações de dados",
    priority: "media",
    status: "em-progresso",
  },
  {
    id: "5",
    title: "Integrar API de pagamentos",
    description: "Conectar com gateway de pagamento para processar transações",
    priority: "alta",
    status: "a-fazer",
  },
  {
    id: "6",
    title: "Implementar notificações em tempo real",
    description: "Sistema de notificações push para eventos importantes",
    priority: "media",
    status: "a-fazer",
  },
  {
    id: "7",
    title: "Otimizar performance da aplicação",
    description: "Melhorar tempo de carregamento e responsividade",
    priority: "media",
    status: "a-fazer",
  },
  {
    id: "8",
    title: "Criar documentação técnica",
    description: "Documentar APIs, componentes e fluxos da aplicação",
    priority: "baixa",
    status: "backlog",
  },
  {
    id: "9",
    title: "Implementar testes automatizados",
    description: "Configurar testes unitários e de integração",
    priority: "media",
    status: "backlog",
  },
  {
    id: "10",
    title: "Adicionar suporte multi-idioma",
    description: "Implementar internacionalização (i18n) para PT, EN e ES",
    priority: "baixa",
    status: "backlog",
  },
  {
    id: "11",
    title: "Configurar CI/CD pipeline",
    description: "Automatizar deploy e testes com GitHub Actions",
    priority: "media",
    status: "backlog",
  },
  {
    id: "12",
    title: "Implementar modo offline",
    description: "Cache de dados e sincronização quando voltar online",
    priority: "baixa",
    status: "backlog",
  },
];

export default function Home() {
  const [tasks, setTasks] = useLocalStorage<Task[]>("leap-tech-tasks", defaultTasks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        searchQuery === "" ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;

      return matchesSearch && matchesPriority;
    });
  }, [tasks, searchQuery, priorityFilter]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setPriorityFilter("all");
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
  };

  const handleMoveTask = (taskId: string, newStatus: ColumnStatus) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  const handleSaveTask = (taskData: Omit<Task, "id"> & { id?: string }) => {
    if (taskData.id) {
      setTasks(tasks.map((t) => (t.id === taskData.id ? { ...taskData, id: taskData.id } : t)));
    } else {
      setTasks([...tasks, { ...taskData, id: nanoid() }]);
    }
  };

  return (
    <div className="flex-1 w-full">
      <div className="container px-4 md:px-6 py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-[#E570FF] to-[#70E5FF] bg-clip-text text-transparent">
              Gerenciamento Ágil de Tarefas
            </h1>
            <p className="text-muted-foreground">
              Organize seu fluxo de trabalho com metodologia Kanban
            </p>
          </div>
          
          <Button 
            onClick={handleAddTask}
            className="gap-2"
            data-testid="button-add-task"
          >
            <Plus className="h-4 w-4" />
            Nova Tarefa
          </Button>
        </div>

        <TaskFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          priorityFilter={priorityFilter}
          onPriorityChange={setPriorityFilter}
          onClearFilters={handleClearFilters}
        />

        <KanbanBoard 
          tasks={filteredTasks} 
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onMoveTask={handleMoveTask}
        />

        <TaskDialog
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          task={editingTask}
          onSave={handleSaveTask}
        />
      </div>
    </div>
  );
}
