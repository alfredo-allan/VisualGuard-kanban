// src/pages/Home.tsx - VERSÃO REFATORADA COM FILTRO FUNCIONAL
import { KanbanBoard } from "@/components/kanban-board";
import { TaskDialog } from "@/components/task-dialog";
import { TaskViewDialog } from "@/components/task-view-dialog";
import { TaskFilters } from "@/components/task-filters";
import { type Task, type ColumnStatus, type Priority } from "@/types/kanban";
import { Button } from "@/components/ui/button";
import {
  Plus,
  FolderOpen,
  Kanban,
  Move,
  AlertCircle,
  Trash2,
  Eye,
  Search,
  Filter,
  X,
} from "lucide-react";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useKanbanReal } from "@/hooks/useKanbanReal";
import { ProjectDialog } from "@/components/ProjectDialog";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  // ==================== STATE ====================
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [movingTaskId, setMovingTaskId] = useState<string | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  // ==================== HOOKS ====================
  const { isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const {
    projects,
    currentProject,
    currentBoard,
    isLoading,
    error,
    selectProject,
    createProject,
    createTask,
    moveTask,
    deleteTask,
    syncBoard,
  } = useKanbanReal();

  // ==================== MEMOIZED VALUES ====================
  const tasks = useMemo(() => {
    const allTasks =
      currentBoard?.columns?.flatMap((column) => column.tasks || []) || [];
    console.log(`📊 Total de tarefas carregadas: ${allTasks.length}`);
    return allTasks;
  }, [currentBoard]);

  // ==================== FILTRO OTIMIZADO ====================
  const { filteredTasks, activeFilterCount } = useMemo(() => {
    const hasSearchFilter = searchQuery.trim() !== "";
    const hasPriorityFilter = priorityFilter !== "all";
    const activeFilters =
      (hasSearchFilter ? 1 : 0) + (hasPriorityFilter ? 1 : 0);

    if (!hasSearchFilter && !hasPriorityFilter) {
      return { filteredTasks: tasks, activeFilterCount: 0 };
    }

    const searchLower = searchQuery.toLowerCase().trim();

    const result = tasks.filter((task) => {
      // Filtro por busca (título OU descrição)
      const matchesSearch =
        !hasSearchFilter ||
        task.title?.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower);

      // Filtro por prioridade
      const matchesPriority =
        !hasPriorityFilter || task.priority === priorityFilter;

      return matchesSearch && matchesPriority;
    });

    console.log(`🔍 Filtro aplicado:`, {
      busca: hasSearchFilter ? `"${searchQuery}"` : "não",
      prioridade: hasPriorityFilter ? priorityFilter : "todas",
      tarefasTotais: tasks.length,
      tarefasFiltradas: result.length,
      filtrosAtivos: activeFilters,
    });

    return { filteredTasks: result, activeFilterCount: activeFilters };
  }, [tasks, searchQuery, priorityFilter]);

  // ==================== TASK HANDLERS ====================
  const handleAddTask = useCallback(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!currentProject) {
      toast({
        title: "Selecione um projeto",
        description:
          "Você precisa selecionar um projeto antes de criar tarefas.",
        variant: "destructive",
      });
      return;
    }

    setEditingTask(null);
    setIsTaskModalOpen(true);
  }, [isAuthenticated, currentProject, toast, navigate]);

  const handleEditTask = useCallback(
    (task: Task) => {
      if (!isAuthenticated) {
        navigate("/login");
        return;
      }
      setEditingTask(task);
      setIsTaskModalOpen(true);
    },
    [isAuthenticated, navigate]
  );

  const handleViewTask = useCallback(
    (task: Task) => {
      if (!isAuthenticated) {
        navigate("/login");
        return;
      }
      setViewingTask(task);
      setIsViewDialogOpen(true);
    },
    [isAuthenticated, navigate]
  );

  const handleSaveTask = useCallback(
    async (taskData: Omit<Task, "id"> & { id?: string }) => {
      if (!isAuthenticated) {
        navigate("/login");
        return;
      }

      try {
        if (taskData.id) {
          toast({
            title: "Funcionalidade em desenvolvimento",
            description: "Edição de tarefas estará disponível em breve.",
            variant: "default",
          });
        } else {
          await createTask(taskData);
          await syncBoard();
          toast({
            title: "Tarefa criada!",
            description: "Sua tarefa foi criada com sucesso.",
            variant: "default",
          });
        }
        setIsTaskModalOpen(false);
      } catch (error) {
        console.error("❌ Erro ao salvar tarefa:", error);
        toast({
          title: "Erro ao salvar tarefa",
          description: "Não foi possível salvar a tarefa.",
          variant: "destructive",
        });
      }
    },
    [isAuthenticated, createTask, syncBoard, toast, navigate]
  );

  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      if (!isAuthenticated) {
        navigate("/login");
        return;
      }

      const taskToDelete = tasks.find((t) => t.id === taskId);
      if (!taskToDelete) {
        toast({
          title: "Erro",
          description: "Tarefa não encontrada.",
          variant: "destructive",
        });
        return;
      }

      setDeleteTaskId(taskId);
    },
    [isAuthenticated, tasks, toast, navigate]
  );

  const confirmDeleteTask = useCallback(async () => {
    if (!deleteTaskId) return;

    setIsDeleting(true);
    try {
      await deleteTask(deleteTaskId);
      toast({
        title: "Tarefa excluída",
        description: "A tarefa foi removida com sucesso.",
        variant: "default",
      });
    } catch (error) {
      console.error("❌ Erro na exclusão:", error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a tarefa.",
        variant: "destructive",
      });
    } finally {
      setDeleteTaskId(null);
      setIsDeleting(false);
    }
  }, [deleteTaskId, deleteTask, toast]);

  const cancelDeleteTask = useCallback(() => {
    setDeleteTaskId(null);
  }, []);

  const handleMoveTask = useCallback(
    async (taskId: string, newStatus: ColumnStatus) => {
      if (!isAuthenticated || movingTaskId) return;

      setMovingTaskId(taskId);
      try {
        await moveTask(taskId, newStatus);
        toast({
          title: "Tarefa movida!",
          description: `Tarefa movida para ${newStatus.replace("-", " ")}`,
          variant: "default",
        });
      } catch (error) {
        toast({
          title: "Erro ao mover tarefa",
          description: "Não foi possível mover a tarefa. Tente novamente.",
          variant: "destructive",
        });
        await syncBoard();
      } finally {
        setMovingTaskId(null);
      }
    },
    [isAuthenticated, movingTaskId, moveTask, syncBoard, toast, navigate]
  );

  // ==================== PROJECT HANDLERS ====================
  const handleCreateProject = useCallback(
    async (projectData: { name: string; description?: string }) => {
      setIsCreatingProject(true);
      try {
        await createProject(projectData);
        setTimeout(() => window.location.reload(), 800);
        toast({
          title: "Projeto criado!",
          description: "Recarregando para carregar seu novo projeto...",
          variant: "default",
        });
      } catch (error) {
        console.error("❌ Erro ao criar projeto:", error);
        toast({
          title: "Erro ao criar projeto",
          description: "Não foi possível criar o projeto.",
          variant: "destructive",
        });
        setIsProjectDialogOpen(false);
      } finally {
        setIsCreatingProject(false);
      }
    },
    [createProject, toast]
  );

  const handleProjectSelect = useCallback(
    async (projectId: string) => {
      if (projectId === "new") {
        setIsProjectDialogOpen(true);
        return;
      }
      await selectProject(projectId);
    },
    [selectProject]
  );

  // ==================== FILTER HANDLERS ====================
  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setPriorityFilter("all");
    toast({
      title: "Filtros limpos",
      description: "Todos os filtros foram removidos.",
      variant: "default",
    });
  }, [toast]);

  // ==================== RENDER FUNCTIONS ====================
  const renderAuthenticatedHeader = () => (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="space-y-2 flex-1">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">
            {currentProject ? currentProject.name : "Meu Kanban"}
          </h1>
          {movingTaskId && (
            <Badge variant="secondary" className="animate-pulse">
              <Move className="h-3 w-3 mr-1" />
              Movendo tarefa...
            </Badge>
          )}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
            👋 Olá, {user?.username}!
          </div>
        </div>
        <p className="text-muted-foreground">
          {currentProject?.description ||
            "Organize seu fluxo de trabalho com metodologia Kanban"}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Select
          value={currentProject?.id || ""}
          onValueChange={handleProjectSelect}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Selecionar projeto">
              {currentProject ? (
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  {currentProject.name}
                </div>
              ) : (
                "Selecionar projeto"
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  {project.name}
                </div>
              </SelectItem>
            ))}
            <SelectItem value="new">
              <div className="flex items-center gap-2 text-primary">
                <Plus className="h-4 w-4" />
                Criar novo projeto
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={handleAddTask}
          className="gap-2"
          disabled={!currentProject || !!movingTaskId || isCreatingProject}
        >
          <Plus className="h-4 w-4" />
          Nova Tarefa
        </Button>
      </div>
    </div>
  );

  const renderKanbanStats = () => {
    const stats = [
      { status: "a-fazer" as ColumnStatus, label: "A Fazer", icon: "📋" },
      {
        status: "em-progresso" as ColumnStatus,
        label: "Em Progresso",
        icon: "⚡",
      },
      { status: "concluido" as ColumnStatus, label: "Concluído", icon: "✅" },
    ];

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ status, label, icon }) => {
          const count = tasks.filter((t) => t.status === status).length;
          const filteredCount = filteredTasks.filter(
            (t) => t.status === status
          ).length;
          const isFiltered = activeFilterCount > 0;

          return (
            <Card
              key={status}
              className={cn(
                "transition-all hover:shadow-md hover:border-primary/20",
                (movingTaskId || isCreatingProject) && "opacity-80"
              )}
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg">{icon}</span>
                  {isFiltered && filteredCount !== count && (
                    <Badge variant="outline" className="text-xs">
                      {filteredCount}/{count}
                    </Badge>
                  )}
                </div>
                <div
                  className={cn(
                    "text-2xl md:text-3xl font-bold transition-colors",
                    count > 0 ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {isFiltered ? filteredCount : count}
                </div>
                <p className="text-sm text-muted-foreground">{label}</p>
              </CardContent>
            </Card>
          );
        })}

        <Card
          className={cn(
            "transition-all hover:shadow-md hover:border-primary/20",
            (movingTaskId || isCreatingProject) && "opacity-80"
          )}
        >
          <CardContent className="pt-6">
            {/* 🔹 ÍCONE DE CONCLUSÃO */}
            <div className="flex items-center justify-between mb-2">
              <div className="text-lg">🎯</div>
              {activeFilterCount > 0 &&
                filteredTasks.length !== tasks.length && (
                  <Badge variant="outline" className="text-xs">
                    {filteredTasks.length}/{tasks.length}
                  </Badge>
                )}
            </div>

            <div className="text-2xl md:text-3xl font-bold text-foreground">
              {activeFilterCount > 0 ? filteredTasks.length : tasks.length}
            </div>
            <p className="text-sm text-muted-foreground">Total de Tarefas</p>

            {activeFilterCount > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {filteredTasks.length} de {tasks.length} visíveis
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderFilterSection = () => (
    <div className="bg-gradient-to-r from-purple-50 to-cyan-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-4 border">
      {/* Cabeçalho com dicas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" />
          <h3 className="font-medium">Filtros e Busca</h3>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFilterCount}{" "}
              {activeFilterCount === 1 ? "filtro" : "filtros"} ativo
              {activeFilterCount > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Eye className="h-4 w-4" />
          <span>Clique no ícone 👁️ para ver detalhes</span>
        </div>
      </div>

      {/* Componente de filtros */}
      <TaskFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        onClearFilters={handleClearFilters}
      />

      {/* Status do filtro */}
      {activeFilterCount > 0 && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex flex-wrap gap-2">
            {searchQuery && (
              <Badge variant="outline" className="gap-1">
                <Search className="h-3 w-3" />
                Busca: "{searchQuery}"
              </Badge>
            )}
            {priorityFilter !== "all" && (
              <Badge variant="outline" className="gap-1">
                <Filter className="h-3 w-3" />
                Prioridade: {priorityFilter}
              </Badge>
            )}
            <Badge variant="secondary" className="ml-auto">
              {filteredTasks.length} tarefas encontradas
            </Badge>
          </div>

          {filteredTasks.length === 0 && tasks.length > 0 && (
            <Alert className="mt-3 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 dark:text-amber-300">
                Nenhuma tarefa corresponde aos filtros atuais
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );

  const renderKanbanContent = () => (
    <>
      {renderKanbanStats()}
      {renderFilterSection()}

      {/* Status de operação */}
      {movingTaskId && (
        <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-950 dark:to-indigo-950 dark:border-blue-800">
          <Move className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-pulse" />
          <AlertDescription className="text-blue-800 dark:text-blue-300">
            Movimentação em andamento... Aguarde a conclusão.
          </AlertDescription>
        </Alert>
      )}

      {isCreatingProject && (
        <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-950 dark:to-indigo-950 dark:border-blue-800">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          <AlertDescription className="text-blue-800 dark:text-blue-300">
            Criando projeto... Aguarde a conclusão.
          </AlertDescription>
        </Alert>
      )}

      {/* Board Kanban */}
      <div className="transition-all duration-300">
        <KanbanBoard
          tasks={filteredTasks}
          columns={currentBoard?.columns}
          onEditTask={handleEditTask}
          onViewTask={handleViewTask}
          onDeleteTask={handleDeleteTask}
          onMoveTask={handleMoveTask}
          movingTaskId={movingTaskId}
        />
      </div>
    </>
  );

  const renderDeleteConfirmationDialog = () => (
    <AlertDialog
      open={!!deleteTaskId}
      onOpenChange={(open) => !open && cancelDeleteTask()}
    >
      <AlertDialogContent className="max-w-[500px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            Confirmar exclusão
          </AlertDialogTitle>
          <AlertDialogDescription>
            {deleteTaskId ? (
              <div className="space-y-3">
                <p>Tem certeza que deseja excluir esta tarefa?</p>
                <div className="bg-gradient-to-r from-muted/50 to-muted/30 p-3 rounded-lg border">
                  <p className="text-sm font-medium">
                    Esta ação não pode ser desfeita.
                  </p>
                </div>
              </div>
            ) : (
              <p>Carregando detalhes da tarefa...</p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={cancelDeleteTask} disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmDeleteTask}
            disabled={isDeleting}
            className="bg-gradient-to-r from-destructive to-destructive/90 text-destructive-foreground hover:from-destructive/90 hover:to-destructive"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Excluindo...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir Tarefa
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  const renderNoProjectState = () => {
    if (projects.length === 0) {
      return (
        <Card className="text-center py-12 bg-gradient-to-br from-purple-50 to-cyan-50 dark:from-gray-800 dark:to-gray-900 border-2 border-dashed">
          <CardContent className="max-w-md mx-auto">
            <div className="bg-gradient-to-r from-purple-500 to-cyan-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Kanban className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent mb-2">
              Nenhum projeto criado
            </h3>
            <p className="text-muted-foreground mb-6">
              Crie seu primeiro projeto para começar a usar o Kanban
            </p>
            <Button
              onClick={() => setIsProjectDialogOpen(true)}
              disabled={isCreatingProject}
              className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
            >
              {isCreatingProject ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Criando...
                </>
              ) : (
                "Criar Primeiro Projeto"
              )}
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="text-center py-12 bg-gradient-to-br from-purple-50 to-cyan-50 dark:from-gray-800 dark:to-gray-900 border-2">
        <CardContent className="max-w-md mx-auto">
          <div className="bg-gradient-to-r from-purple-500 to-cyan-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Kanban className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            Nenhum projeto selecionado
          </h3>
          <p className="text-muted-foreground mb-6">
            Selecione um projeto existente ou crie um novo para começar
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => selectProject(projects[0].id)}
              disabled={isCreatingProject}
              className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 border-none"
            >
              Selecionar Projeto
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsProjectDialogOpen(true)}
              disabled={isCreatingProject}
              className="border-purple-500 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 border-none"
            >
              {isCreatingProject ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                  Criando...
                </>
              ) : (
                "Criar Novo Projeto"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderUnauthenticatedState = () => (
    <div className="flex-1 w-full">
      <div className="container px-4 md:px-6 py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">
              KanbanFlow - Gestão Ágil
            </h1>
            <p className="text-muted-foreground">
              Organize seu fluxo de trabalho com metodologia Kanban
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => navigate("/register")}
              className="gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 border-none"
            >
              <Plus className="h-4 w-4" />
              Começar Agora
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/login")}
              className="border-purple-500 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
            >
              Fazer Login
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-purple-50 to-cyan-50 dark:from-gray-800 dark:to-gray-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">
                👋 Bem-vindo ao KanbanFlow
              </CardTitle>
              <CardDescription>
                Experimente nossa plataforma de gerenciamento de tarefas. Faça
                login ou crie uma conta para começar a usar todas as
                funcionalidades.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="space-y-2 bg-white/50 dark:bg-gray-700/50 p-4 rounded-lg">
                  <div className="font-semibold text-purple-700 dark:text-purple-400">
                    📊 Visualização Kanban
                  </div>
                  <p className="text-muted-foreground">
                    Organize tarefas em colunas visuais intuitivas
                  </p>
                </div>
                <div className="space-y-2 bg-white/50 dark:bg-gray-700/50 p-4 rounded-lg">
                  <div className="font-semibold text-cyan-700 dark:text-cyan-400">
                    ⚡ Gestão Ágil
                  </div>
                  <p className="text-muted-foreground">
                    Metodologia comprovada para aumentar produtividade
                  </p>
                </div>
                <div className="space-y-2 bg-white/50 dark:bg-gray-700/50 p-4 rounded-lg">
                  <div className="font-semibold text-emerald-700 dark:text-emerald-400">
                    👁️ Visualização Detalhada
                  </div>
                  <p className="text-muted-foreground">
                    Veja todos os detalhes das tarefas em modais elegantes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                Demonstração do Sistema
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/register")}
                className="border-purple-500 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              >
                Criar Conta para Usar
              </Button>
            </div>

            <div className="bg-gradient-to-r from-purple-50/50 to-cyan-50/50 dark:from-gray-800/50 dark:to-gray-900/50 p-4 rounded-lg border">
              <KanbanBoard
                tasks={[]}
                columns={undefined}
                onEditTask={() => navigate("/login")}
                onViewTask={() => navigate("/login")}
                onDeleteTask={() => navigate("/login")}
                onMoveTask={() => navigate("/login")}
                isReadOnly={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ==================== CONDITIONAL RENDERS ====================
  if (isAuthenticated && isLoading) {
    return (
      <div className="flex-1 w-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-cyan-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando seus projetos...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && error) {
    return (
      <div className="flex-1 w-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-cyan-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center max-w-md">
          <div className="bg-gradient-to-r from-destructive/20 to-destructive/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Erro ao carregar</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
          >
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return renderUnauthenticatedState();
  }

  // ==================== MAIN RENDER ====================
  return (
    <div className="flex-1 w-full">
      <div className="container px-4 md:px-6 py-8 space-y-8">
        {renderAuthenticatedHeader()}
        {!currentProject ? renderNoProjectState() : renderKanbanContent()}

        <TaskDialog
          open={isTaskModalOpen}
          onOpenChange={setIsTaskModalOpen}
          task={editingTask}
          onSave={handleSaveTask}
        />

        <TaskViewDialog
          open={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
          task={viewingTask}
        />

        <ProjectDialog
          open={isProjectDialogOpen}
          onOpenChange={setIsProjectDialogOpen}
          onSave={handleCreateProject}
        />

        {renderDeleteConfirmationDialog()}
      </div>
    </div>
  );
}
