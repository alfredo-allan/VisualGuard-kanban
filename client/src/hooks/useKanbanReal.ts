// src/hooks/useKanbanReal.ts - VERSÃO COMPLETA COM DELETE
import { useState, useEffect, useCallback } from "react";
import { projectsApi, boardsApi, columnsApi, tasksApi } from "@/api";
import type {
  ProjectResponse,
  BoardResponse,
  TaskCreate as ApiTaskCreate,
} from "@/types/api";
import type {
  Task,
  KanbanBoard,
  KanbanColumn,
  ColumnStatus,
} from "@/types/kanban";
import {
  taskFromApi,
  columnFromApi,
  priorityMap,
  validateKanbanColumn,
  debugColumn,
  debugTask,
} from "@/types/kanban";
import { useToast } from "./use-toast";

interface UseKanbanRealReturn {
  projects: ProjectResponse[];
  currentProject: ProjectResponse | null;
  currentBoard: KanbanBoard | null;
  isLoading: boolean;
  error: string | null;
  selectProject: (projectId: string) => Promise<void>;
  createProject: (data: { name: string; description?: string }) => Promise<void>;
  createTask: (task: Omit<Task, "id">) => Promise<void>;
  moveTask: (taskId: string, newStatus: ColumnStatus) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>; // ✅ NOVA FUNÇÃO
  syncBoard: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useKanbanReal(): UseKanbanRealReturn {
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [currentProject, setCurrentProject] = useState<ProjectResponse | null>(null);
  const [currentBoard, setCurrentBoard] = useState<KanbanBoard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // 🔹 Cria colunas padrão automaticamente
  const createDefaultColumnsForBoard = async (boardId: string): Promise<void> => {
    console.log(`📋 Criando colunas padrão para board: ${boardId}`);

    const defaultColumns = [
      { title: "Backlog", position: 0, wip_limit: null },
      { title: "A Fazer", position: 1, wip_limit: 5 },
      { title: "Em Progresso", position: 2, wip_limit: 3 },
      { title: "Concluído", position: 3, wip_limit: null },
    ];

    try {
      await Promise.all(
        defaultColumns.map(col =>
          columnsApi.create({
            ...col,
            board_id: boardId
          })
        )
      );
      console.log("✅ Colunas padrão criadas com sucesso");
    } catch (error) {
      console.error("❌ Erro ao criar colunas padrão:", error);
      throw new Error("Falha ao criar colunas padrão do board");
    }
  };

  // 🔹 Carrega board com colunas e tarefas
  const loadBoard = async (boardId: string): Promise<KanbanBoard> => {
    console.group(`🎯 LOAD BOARD: ${boardId}`);

    try {
      const [board, columns, allTasks] = await Promise.all([
        boardsApi.getById(boardId),
        columnsApi.getByBoard(boardId),
        tasksApi.getAll(),
      ]);

      console.log(`📊 Dados carregados: ${columns.length} colunas, ${allTasks.length} tasks`);

      const kanbanColumns: KanbanColumn[] = columns.map((column) => {
        const columnTasks = allTasks
          .filter((task) => task.column_id === column.id)
          .sort((a, b) => (a.position || 0) - (b.position || 0));

        const tasks: Task[] = columnTasks.map((apiTask) =>
          taskFromApi(apiTask, column.title)
        );

        const kanbanColumn = columnFromApi(column, tasks);

        if (!validateKanbanColumn(kanbanColumn)) {
          console.warn(`⚠️ Coluna inválida detectada:`, kanbanColumn);
        }

        debugColumn(kanbanColumn, `Coluna: ${column.title}`);

        return kanbanColumn;
      });

      const sortedColumns = kanbanColumns.sort((a, b) => a.position - b.position);

      const boardData: KanbanBoard = {
        id: board.id,
        name: board.name,
        project_id: board.project_id,
        columns: sortedColumns,
      };

      console.log(`✅ Board carregado: ${sortedColumns.length} colunas válidas`);
      console.groupEnd();

      return boardData;

    } catch (error) {
      console.error("❌ Erro ao carregar board:", error);
      console.groupEnd();
      throw error;
    }
  };

  // 🔹 Carrega projetos
  const loadProjects = useCallback(async () => {
    console.log("📂 Carregando projetos...");

    try {
      const projectsData = await projectsApi.getAll();
      setProjects(projectsData);
      console.log(`✅ ${projectsData.length} projetos carregados`);

      if (projectsData.length > 0 && !currentProject) {
        console.log(`🔄 Auto-selecionando projeto: ${projectsData[0].name}`);
        await selectProjectInternal(projectsData[0].id);
      } else {
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error("❌ Erro ao carregar projetos:", err);
      setError(err.message || "Erro ao carregar projetos");
      setIsLoading(false);
    }
  }, [currentProject]);

  // 🔹 Atualiza tudo
  const refresh = useCallback(async () => {
    console.log("🔄 Refresh completo solicitado");

    if (currentProject) {
      await selectProjectInternal(currentProject.id);
    } else {
      await loadProjects();
    }
  }, [currentProject, loadProjects]);

  // 🔹 Sincroniza o board atual
  const syncBoard = useCallback(async () => {
    if (!currentProject || !currentBoard) {
      console.log("⏸️  Sync ignorado: projeto ou board não disponível");
      return;
    }

    console.group("🔄 SINCRONIZANDO BOARD");

    try {
      const [updatedBoard, updatedColumns, updatedTasks] = await Promise.all([
        boardsApi.getById(currentBoard.id),
        columnsApi.getByBoard(currentBoard.id),
        tasksApi.getAll(),
      ]);

      const syncedBoard: KanbanBoard = {
        id: updatedBoard.id,
        name: updatedBoard.name,
        project_id: updatedBoard.project_id,
        columns: updatedColumns.map((column) => {
          const columnTasks = updatedTasks
            .filter((task) => task.column_id === column.id)
            .sort((a, b) => (a.position || 0) - (b.position || 0))
            .map(apiTask => taskFromApi(apiTask, column.title));

          return columnFromApi(column, columnTasks);
        }).sort((a, b) => a.position - b.position),
      };

      setCurrentBoard(syncedBoard);
      console.log(`✅ Board sincronizado: ${syncedBoard.columns.length} colunas, ${updatedTasks.length} tasks`);

    } catch (error) {
      console.error("❌ Erro ao sincronizar board:", error);
    } finally {
      console.groupEnd();
    }
  }, [currentProject, currentBoard]);

  // 🔹 Seleciona projeto e inicializa board
  const selectProjectInternal = async (projectId: string) => {
    console.group(`🎯 SELECT PROJECT: ${projectId}`);
    setIsLoading(true);
    setError(null);

    try {
      const project = await projectsApi.getById(projectId);
      setCurrentProject(project);
      console.log(`✅ Projeto selecionado: ${project.name}`);

      const boards = await boardsApi.getByProject(projectId);
      let activeBoard: BoardResponse;

      if (boards.length === 0) {
        console.log("📋 Criando novo board...");
        activeBoard = await boardsApi.create({
          name: `${project.name} - Board Principal`,
          project_id: projectId,
        });
        console.log(`✅ Board criado: ${activeBoard.id}`);

        await createDefaultColumnsForBoard(activeBoard.id);
      } else {
        activeBoard = boards[0];
        console.log(`✅ Board existente encontrado: ${activeBoard.name}`);
      }

      const boardData = await loadBoard(activeBoard.id);
      setCurrentBoard(boardData);

      console.log("🎉 Projeto e board carregados com sucesso");

    } catch (err: any) {
      console.error("❌ Erro ao selecionar projeto:", err);
      const errorMessage = err.message || "Erro ao selecionar projeto";
      setError(errorMessage);

      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      console.groupEnd();
    }
  };

  // 🔹 Cria novo projeto
  const createProject = useCallback(
    async (data: { name: string; description?: string }) => {
      try {
        const newProject = await projectsApi.create(data);
        setProjects((prev) => [...prev, newProject]);
        await selectProjectInternal(newProject.id);

        toast({
          title: "Sucesso",
          description: "Projeto criado com sucesso!",
        });
      } catch (err: any) {
        toast({
          title: "Erro",
          description: err.message || "Erro ao criar projeto",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  // 🔹 Cria nova tarefa
  const createTask = useCallback(
    async (task: Omit<Task, "id">) => {
      console.log("➕ Criando nova tarefa:", task.title);

      if (!currentBoard) throw new Error("Nenhum board selecionado");

      const column = currentBoard.columns.find(
        (col) => col.status === task.status
      );

      if (!column) {
        throw new Error(`Coluna com status "${task.status}" não encontrada`);
      }

      const apiTask: ApiTaskCreate = {
        title: task.title,
        description: task.description || null,
        priority: priorityMap[task.priority],
        column_id: column.id,
        assignee_id: task.assignee_id || null,
        due_date: task.due_date || null,
      };

      await tasksApi.create(apiTask);

      await syncBoard();

      toast({
        title: "Sucesso",
        description: "Tarefa criada com sucesso!",
      });
    },
    [currentBoard, toast, syncBoard]
  );

  // 🔹 Mover tarefa entre colunas
  const moveTask = useCallback(
    async (taskId: string, newStatus: ColumnStatus) => {
      console.group(`🚀 MOVER TAREFA: ${taskId} -> ${newStatus}`);

      if (!currentBoard) {
        console.error("❌ Nenhum board selecionado");
        throw new Error("Nenhum board selecionado");
      }

      const currentTask = currentBoard.columns
        .flatMap((col) => col.tasks)
        .find((t) => t.id === taskId);

      if (!currentTask) {
        console.error("❌ Tarefa não encontrada:", taskId);
        throw new Error("Tarefa não encontrada");
      }

      debugTask(currentTask, "Tarefa atual");

      const targetColumn = currentBoard.columns.find(
        (col) => col.status === newStatus
      );

      if (!targetColumn) {
        console.error("❌ Coluna de destino não encontrada para status:", newStatus);
        console.log("Colunas disponíveis:", currentBoard.columns.map(c => ({ title: c.title, status: c.status })));
        throw new Error(`Coluna com status "${newStatus}" não encontrada`);
      }

      debugColumn(targetColumn, "Coluna de destino");

      console.log("⚡ Aplicando atualização otimista...");
      setCurrentBoard((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          columns: prev.columns.map((column) => {
            if (column.tasks.some(task => task.id === taskId)) {
              const filteredTasks = column.tasks.filter(task => task.id !== taskId);
              console.log(`📤 Removendo da coluna: ${column.title} (${filteredTasks.length} tasks restantes)`);
              return { ...column, tasks: filteredTasks };
            }

            if (column.id === targetColumn.id) {
              const updatedTask = {
                ...currentTask,
                status: newStatus,
                column_id: targetColumn.id
              };
              const newTasks = [...column.tasks, updatedTask];
              console.log(`📥 Adicionando na coluna: ${column.title} (${newTasks.length} tasks agora)`);
              return { ...column, tasks: newTasks };
            }

            return column;
          })
        };
      });

      try {
        console.log("📦 Enviando para backend...");
        await tasksApi.move(taskId, {
          column_id: targetColumn.id,
          position: 0
        });
        console.log("✅ Backend atualizado");

        console.log("🔄 Sincronizando estado...");
        await syncBoard();
        console.log("✅ Sincronização concluída");

        toast({
          title: "Tarefa movida!",
          description: `Movida para "${targetColumn.title}"`,
          variant: "default",
        });

      } catch (err: any) {
        console.error("❌ Erro ao mover tarefa:", err);

        console.log("🔄 Revertendo atualização otimista...");
        await refresh();

        toast({
          title: "Erro ao mover tarefa",
          description: "Não foi possível mover a tarefa. Alterações revertidas.",
          variant: "destructive",
        });

        throw err;
      } finally {
        console.groupEnd();
      }
    },
    [currentBoard, toast, syncBoard, refresh]
  );

  // 🔹 Deletar tarefa - NOVA FUNÇÃO
  const deleteTask = useCallback(async (taskId: string) => {
    console.group(`🗑️ DELETANDO TAREFA: ${taskId}`);

    if (!currentBoard) {
      console.error("❌ Nenhum board selecionado");
      throw new Error("Nenhum board selecionado");
    }

    // Encontrar a tarefa para debug
    const taskToDelete = currentBoard.columns
      .flatMap((col) => col.tasks)
      .find((t) => t.id === taskId);

    if (!taskToDelete) {
      console.error("❌ Tarefa não encontrada:", taskId);
      throw new Error("Tarefa não encontrada");
    }

    console.log(`🎯 Encontrada tarefa para deletar: "${taskToDelete.title}"`);

    // Atualização otimista - remover da UI imediatamente
    console.log("⚡ Aplicando atualização otimista...");
    setCurrentBoard((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        columns: prev.columns.map((column) => ({
          ...column,
          tasks: column.tasks.filter((task) => task.id !== taskId)
        }))
      };
    });

    try {
      console.log("📦 Enviando delete para backend...");
      await tasksApi.delete(taskId);
      console.log("✅ Tarefa deletada no backend");

      // Sincronização leve para garantir consistência
      await syncBoard();
      console.log("✅ Sincronização concluída");

      toast({
        title: "Tarefa excluída!",
        description: `"${taskToDelete.title}" foi excluída com sucesso.`,
        variant: "default",
      });

    } catch (err: any) {
      console.error("❌ Erro ao deletar tarefa:", err);

      // Reverter atualização otimista em caso de erro
      console.log("🔄 Revertendo atualização otimista...");
      await refresh();

      toast({
        title: "Erro ao excluir tarefa",
        description: "Não foi possível excluir a tarefa. Tente novamente.",
        variant: "destructive",
      });

      throw err;
    } finally {
      console.groupEnd();
    }
  }, [currentBoard, toast, syncBoard, refresh]);

  // 🔹 Selecionar projeto (wrapper público)
  const selectProject = useCallback(async (projectId: string) => {
    await selectProjectInternal(projectId);
  }, []);

  // ==================== INICIALIZAÇÃO ====================

  useEffect(() => {
    console.log("🎬 Inicializando useKanbanReal...");
    loadProjects();
  }, [loadProjects]);

  // ==================== RETORNO DO HOOK ====================

  return {
    projects,
    currentProject,
    currentBoard,
    isLoading,
    error,
    selectProject,
    createProject,
    createTask,
    moveTask,
    deleteTask, // ✅ ADICIONAR AO RETORNO
    syncBoard,
    refresh,
  };
}