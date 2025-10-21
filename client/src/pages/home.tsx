// src/pages/Home.tsx - VERSÃO COMPLETA COM DELETE
import { KanbanBoard } from "@/components/kanban-board";
import { TaskDialog } from "@/components/task-dialog";
import { TaskFilters } from "@/components/task-filters";
import { type Task, type ColumnStatus, type Priority } from "@/types/kanban";
import { Button } from "@/components/ui/button";
import { Plus, FolderOpen, Kanban, Move, AlertCircle, Trash2 } from "lucide-react";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useKanbanReal } from "@/hooks/useKanbanReal";
import { ProjectDialog } from "@/components/ProjectDialog";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

export default function Home() {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [movingTaskId, setMovingTaskId] = useState<string | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Hook do Kanban
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
    deleteTask, // ✅ NOVA FUNÇÃO
    refresh,
    syncBoard,
  } = useKanbanReal();

  // Tasks do board atual
  const tasks = useMemo(() => {
    return currentBoard?.columns?.flatMap((column) => column.tasks || []) || [];
  }, [currentBoard]);

  // Tasks filtradas
  const filteredTasks = useMemo(() => {
    const safeTasks = Array.isArray(tasks) ? tasks : [];

    const filtered = safeTasks.filter((task) => {
      if (!task || typeof task !== 'object') return false;

      const matchesSearch =
        searchQuery === "" ||
        (task.title && task.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;

      return matchesSearch && matchesPriority;
    });

    return filtered;
  }, [tasks, searchQuery, priorityFilter]);

  // 🔹 HANDLER DE EXCLUSÃO DE TAREFAS
  const handleDeleteTask = useCallback(async (taskId: string) => {
    console.group(`🗑️ HOME: Solicitada exclusão da tarefa: ${taskId}`);

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Encontrar a tarefa para mostrar no diálogo de confirmação
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (!taskToDelete) {
      console.error("❌ Tarefa não encontrada para exclusão:", taskId);
      toast({
        title: "Erro",
        description: "Tarefa não encontrada.",
        variant: "destructive",
      });
      return;
    }

    // Abrir diálogo de confirmação
    setDeleteTaskId(taskId);
    console.log("📋 Diálogo de confirmação aberto");
    console.groupEnd();
  }, [isAuthenticated, tasks, toast, navigate]);

  // 🔹 CONFIRMAR EXCLUSÃO
  const confirmDeleteTask = useCallback(async () => {
    if (!deleteTaskId) return;

    console.group(`✅ HOME: Confirmando exclusão da tarefa: ${deleteTaskId}`);
    setIsDeleting(true);

    try {
      await deleteTask(deleteTaskId);
      console.log("✅ Exclusão confirmada e executada");

    } catch (error) {
      console.error("❌ Erro na exclusão:", error);
    } finally {
      setDeleteTaskId(null);
      setIsDeleting(false);
      console.groupEnd();
    }
  }, [deleteTaskId, deleteTask]);

  // 🔹 CANCELAR EXCLUSÃO
  const cancelDeleteTask = useCallback(() => {
    console.log("❌ HOME: Exclusão cancelada pelo usuário");
    setDeleteTaskId(null);
  }, []);

  // 🔹 HANDLER DE MOVIMENTO DE TAREFAS
  const handleMoveTask = useCallback(async (taskId: string, newStatus: ColumnStatus) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (movingTaskId) return;

    setMovingTaskId(taskId);

    try {
      await moveTask(taskId, newStatus);
      toast({
        title: "Tarefa movida!",
        description: `Tarefa movida para ${newStatus.replace('-', ' ')}`,
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
  }, [isAuthenticated, movingTaskId, moveTask, syncBoard, toast, navigate]);

  // 🔹 HANDLERS GERAIS
  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setPriorityFilter("all");
  }, []);

  const handleAddTask = useCallback(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!currentProject) {
      toast({
        title: "Selecione um projeto",
        description: "Você precisa selecionar um projeto antes de criar tarefas.",
        variant: "destructive",
      });
      return;
    }

    setEditingTask(null);
    setIsTaskModalOpen(true);
  }, [isAuthenticated, currentProject, toast, navigate]);

  const handleEditTask = useCallback((task: Task) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setEditingTask(task);
    setIsTaskModalOpen(true);
  }, [isAuthenticated, navigate]);

  const handleSaveTask = useCallback(async (taskData: Omit<Task, "id"> & { id?: string }) => {
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
  }, [isAuthenticated, createTask, syncBoard, toast, navigate]);

  const handleCreateProject = useCallback(async (projectData: { name: string; description?: string }) => {
    try {
      await createProject(projectData);
      toast({
        title: "Projeto criado!",
        description: "Seu projeto foi criado com sucesso.",
        variant: "default",
      });
      setIsProjectDialogOpen(false);
    } catch (error) {
      console.error("❌ Erro ao criar projeto:", error);
      toast({
        title: "Erro ao criar projeto",
        description: "Não foi possível criar o projeto.",
        variant: "destructive",
      });
    }
  }, [createProject, toast]);

  const handleProjectSelect = useCallback(async (projectId: string) => {
    if (projectId === "new") {
      setIsProjectDialogOpen(true);
      return;
    }
    await selectProject(projectId);
  }, [selectProject]);

  // 🔹 DEBUG STATE
  useEffect(() => {
    if (isAuthenticated) {
      console.group("🏠 HOME STATE UPDATE");
      console.log("📋 Projetos:", projects?.length);
      console.log("🎯 Projeto atual:", currentProject?.name);
      console.log("📊 Board atual:", currentBoard);
      console.log("🔄 Loading:", isLoading);
      console.log("❌ Error:", error);
      console.log("🚀 Moving task:", movingTaskId);
      console.groupEnd();
    }
  }, [projects, currentProject, currentBoard, isLoading, error, movingTaskId, isAuthenticated]);

  // 🔹 RENDER HEADER PARA USUÁRIOS AUTENTICADOS
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
          {currentProject?.description || "Organize seu fluxo de trabalho com metodologia Kanban"}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Select value={currentProject?.id || ""} onValueChange={handleProjectSelect}>
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
          disabled={!currentProject || !!movingTaskId}
        >
          <Plus className="h-4 w-4" />
          Nova Tarefa
        </Button>
      </div>
    </div>
  );

  // 🔹 RENDER KANBAN STATS
  const renderKanbanStats = () => {
    const safeTasks = Array.isArray(tasks) ? tasks : [];

    const stats = [
      { status: "a-fazer" as ColumnStatus, label: "A Fazer" },
      { status: "em-progresso" as ColumnStatus, label: "Em Progresso" },
      { status: "concluido" as ColumnStatus, label: "Concluído" },
    ];

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ status, label }) => {
          const count = safeTasks.filter((t) => t.status === status).length;
          return (
            <Card key={status} className={cn("transition-all", movingTaskId && "opacity-80")}>
              <CardContent className="pt-6">
                <div className={cn(
                  "text-2xl font-bold transition-colors",
                  count > 0 ? "text-foreground" : "text-muted-foreground"
                )}>
                  {count}
                </div>
                <p className="text-sm text-muted-foreground">{label}</p>
              </CardContent>
            </Card>
          );
        })}
        <Card className={cn(movingTaskId && "opacity-80")}>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">{safeTasks.length}</div>
            <p className="text-sm text-muted-foreground">Total</p>
          </CardContent>
        </Card>
      </div>
    );
  };

  // 🔹 RENDER KANBAN CONTENT
  const renderKanbanContent = () => (
    <>
      {renderKanbanStats()}

      <TaskFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        onClearFilters={handleClearFilters}
      />

      {movingTaskId && (
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
          <Move className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-pulse" />
          <AlertDescription className="text-blue-800 dark:text-blue-300">
            Movimentação em andamento... Aguarde a conclusão.
          </AlertDescription>
        </Alert>
      )}

      <KanbanBoard
        tasks={filteredTasks}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
        onMoveTask={handleMoveTask}
        movingTaskId={movingTaskId}
      />
    </>
  );

  // 🔹 RENDER DIALOG DE CONFIRMAÇÃO DE EXCLUSÃO
  const renderDeleteConfirmationDialog = () => {
    const taskToDelete = deleteTaskId ? tasks.find(t => t.id === deleteTaskId) : null;

    return (
      <AlertDialog open={!!deleteTaskId} onOpenChange={(open) => !open && cancelDeleteTask()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Confirmar exclusão
            </AlertDialogTitle>
            <AlertDialogDescription>
              {taskToDelete ? (
                <div className="space-y-3">
                  <p>
                    Tem certeza que deseja excluir a tarefa <strong>"{taskToDelete.title}"</strong>?
                  </p>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm font-medium">Detalhes da tarefa:</p>
                    <p className="text-sm text-muted-foreground">
                      Prioridade: <span className="capitalize">{taskToDelete.priority}</span>
                    </p>
                    {taskToDelete.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Descrição: {taskToDelete.description}
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-destructive font-medium">
                    ⚠️ Esta ação não pode ser desfeita.
                  </p>
                </div>
              ) : (
                <p>Carregando detalhes da tarefa...</p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={cancelDeleteTask}
              disabled={isDeleting}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteTask}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
  };

  // 🔹 RENDER NO PROJECT STATE
  const renderNoProjectState = () => {
    if (projects.length === 0) {
      return (
        <Card className="text-center py-12">
          <CardContent>
            <Kanban className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum projeto criado</h3>
            <p className="text-muted-foreground mb-6">
              Crie seu primeiro projeto para começar a usar o Kanban
            </p>
            <Button onClick={() => setIsProjectDialogOpen(true)}>
              Criar Primeiro Projeto
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="text-center py-12">
        <CardContent>
          <Kanban className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum projeto selecionado</h3>
          <p className="text-muted-foreground mb-6">
            Selecione um projeto existente ou crie um novo para começar
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => selectProject(projects[0].id)}>
              Selecionar Projeto
            </Button>
            <Button variant="outline" onClick={() => setIsProjectDialogOpen(true)}>
              Criar Novo Projeto
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // 🔹 RENDER UNAUTHENTICATED STATE (VISUALIZAÇÃO PÚBLICA)
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
            <Button onClick={() => navigate("/register")} className="gap-2">
              <Plus className="h-4 w-4" />
              Começar Agora
            </Button>
            <Button variant="outline" onClick={() => navigate("/login")}>
              Fazer Login
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">
                👋 Bem-vindo ao KanbanFlow
              </CardTitle>
              <CardDescription>
                Experimente nossa plataforma de gerenciamento de tarefas.
                Faça login ou crie uma conta para começar a usar todas as funcionalidades.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="font-semibold">📊 Visualização Kanban</div>
                  <p className="text-muted-foreground">
                    Organize tarefas em colunas visuais intuitivas
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="font-semibold">⚡ Gestão Ágil</div>
                  <p className="text-muted-foreground">
                    Metodologia comprovada para aumentar produtividade
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="font-semibold">👥 Colaboração</div>
                  <p className="text-muted-foreground">
                    Trabalhe em equipe de forma eficiente
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Demonstração do Sistema</h3>
              <Button variant="outline" size="sm" onClick={() => navigate("/register")}>
                Criar Conta para Usar
              </Button>
            </div>

            <KanbanBoard
              tasks={[]}
              onEditTask={() => navigate("/login")}
              onDeleteTask={() => navigate("/login")}
              onMoveTask={() => navigate("/login")}
              isReadOnly={true}
            />
          </div>
        </div>
      </div>
    </div>
  );

  // 🔹 RENDER LOADING STATE
  if (isAuthenticated && isLoading) {
    return (
      <div className="flex-1 w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando seus projetos...</p>
        </div>
      </div>
    );
  }

  // 🔹 RENDER ERROR STATE
  if (isAuthenticated && error) {
    return (
      <div className="flex-1 w-full flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  // 🔹 RENDER UNAUTHENTICATED (VISUALIZAÇÃO PÚBLICA)
  if (!isAuthenticated) {
    return renderUnauthenticatedState();
  }

  // 🔹 RENDER MAIN CONTENT (USUÁRIOS AUTENTICADOS)
  return (
    <div className="flex-1 w-full">
      <div className="container px-4 md:px-6 py-8 space-y-8">
        {renderAuthenticatedHeader()}

        {!currentProject ? renderNoProjectState() : renderKanbanContent()}

        {/* Modais */}
        <TaskDialog
          open={isTaskModalOpen}
          onOpenChange={setIsTaskModalOpen}
          task={editingTask}
          onSave={handleSaveTask}
        />

        <ProjectDialog
          open={isProjectDialogOpen}
          onOpenChange={setIsProjectDialogOpen}
          onSave={handleCreateProject}
        />

        {/* ✅ DIALOG DE CONFIRMAÇÃO DE EXCLUSÃO */}
        {renderDeleteConfirmationDialog()}
      </div>
    </div>
  );
}