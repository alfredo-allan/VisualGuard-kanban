// src/hooks/useKanbanReal.ts - VERSÃO COMPLETAMENTE REFATORADA
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
  statusToTitleMap,
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
  deleteTask: (taskId: string) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>; // ✅ ADICIONAR ESTA LINHA
  syncBoard: () => Promise<void>;
  refresh: () => Promise<void>;
}

// 🔹 Função auxiliar robusta para encontrar coluna por status
const findColumnByStatus = (columns: KanbanColumn[], status: ColumnStatus): KanbanColumn | undefined => {
  console.log(`🔍 Buscando coluna para status: "${status}"`);

  // 1. Tentar match exato do status
  const exactMatch = columns.find(col => col.status === status);
  if (exactMatch) {
    console.log(`✅ Encontrada por status exato: "${exactMatch.title}"`);
    return exactMatch;
  }

  // 2. Tentar pelo título mapeado
  const expectedTitle = statusToTitleMap[status];
  if (expectedTitle) {
    const titleMatch = columns.find(col => col.title === expectedTitle);
    if (titleMatch) {
      console.log(`✅ Encontrada por título mapeado: "${titleMatch.title}"`);
      return titleMatch;
    }
  }

  // 3. Tentar match parcial no título (fallback)
  const searchTerm = status.replace('-', ' ').toLowerCase();
  const partialMatch = columns.find(col =>
    col.title.toLowerCase().includes(searchTerm)
  );

  if (partialMatch) {
    console.log(`✅ Encontrada por match parcial: "${partialMatch.title}"`);
    return partialMatch;
  }

  console.log(`❌ Nenhuma coluna encontrada para status: "${status}"`);
  console.log('📋 Colunas disponíveis:', columns.map(c => ({
    title: c.title,
    status: c.status
  })));

  return undefined;
};

export function useKanbanReal(): UseKanbanRealReturn {
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [currentProject, setCurrentProject] = useState<ProjectResponse | null>(null);
  const [currentBoard, setCurrentBoard] = useState<KanbanBoard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // 🔹 Cria colunas padrão automaticamente
  const createDefaultColumnsForBoard = async (boardId: string): Promise<void> => {
    console.group(`📋 CRIANDO COLUNAS PADRÃO: ${boardId}`);

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
    } finally {
      console.groupEnd();
    }
  };

  // 🔹 Carrega board com colunas e tarefas
  const loadBoard = async (boardId: string): Promise<KanbanBoard> => {
    console.group(`🎯 CARREGANDO BOARD: ${boardId}`);

    try {
      const [board, columns, allTasks] = await Promise.all([
        boardsApi.getById(boardId),
        columnsApi.getByBoard(boardId),
        tasksApi.getAll(),
      ]);

      console.log(`📊 Dados carregados: ${columns.length} colunas, ${allTasks.length} tasks`);

      // Processar colunas e tarefas
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

      // Log estatísticas detalhadas
      console.log("📊 Estatísticas das colunas:", sortedColumns.map(col => ({
        title: col.title,
        status: col.status,
        tasks: col.tasks.length,
        id: col.id
      })));

      const boardData: KanbanBoard = {
        id: board.id,
        name: board.name,
        project_id: board.project_id,
        columns: sortedColumns,
      };

      console.log(`✅ Board carregado: ${sortedColumns.length} colunas válidas`);
      return boardData;

    } catch (error) {
      console.error("❌ Erro ao carregar board:", error);
      throw error;
    } finally {
      console.groupEnd();
    }
  };

  // 🔹 Carrega projetos
  const loadProjects = useCallback(async () => {
    console.group("📂 CARREGANDO PROJETOS");

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
    } finally {
      console.groupEnd();
    }
  }, [currentProject]);

  // 🔹 Atualiza tudo
  const refresh = useCallback(async () => {
    console.group("🔄 REFRESH COMPLETO");

    try {
      if (currentProject) {
        await selectProjectInternal(currentProject.id);
      } else {
        await loadProjects();
      }
      console.log("✅ Refresh concluído");
    } catch (error) {
      console.error("❌ Erro no refresh:", error);
    } finally {
      console.groupEnd();
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
      throw error;
    } finally {
      console.groupEnd();
    }
  }, [currentProject, currentBoard]);

  // 🔹 Seleciona projeto e inicializa board
  // 🔹 Seleciona projeto e inicializa board - VERSÃO CORRIGIDA
  const selectProjectInternal = async (projectId: string) => {
    console.group(`🎯 SELECIONANDO PROJETO: ${projectId}`);
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

        // ✅ GARANTIR que as colunas são criadas
        await createDefaultColumnsForBoard(activeBoard.id);
      } else {
        activeBoard = boards[0];
        console.log(`✅ Board existente encontrado: ${activeBoard.name}`);

        // ✅ VERIFICAR se o board tem colunas
        const existingColumns = await columnsApi.getByBoard(activeBoard.id);
        console.log(`📊 Colunas existentes: ${existingColumns.length}`);

        if (existingColumns.length === 0) {
          console.log("⚠️ Board sem colunas! Criando colunas padrão...");
          await createDefaultColumnsForBoard(activeBoard.id);
        }
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
      console.group("🏗️ CRIANDO NOVO PROJETO");

      try {
        const newProject = await projectsApi.create(data);
        setProjects((prev) => [...prev, newProject]);
        await selectProjectInternal(newProject.id);

        toast({
          title: "Sucesso",
          description: "Projeto criado com sucesso!",
        });
        console.log("✅ Projeto criado com sucesso");
      } catch (err: any) {
        console.error("❌ Erro ao criar projeto:", err);
        toast({
          title: "Erro",
          description: err.message || "Erro ao criar projeto",
          variant: "destructive",
        });
        throw err;
      } finally {
        console.groupEnd();
      }
    },
    [toast]
  );

  // 🔹 Cria nova tarefa - VERSÃO CORRIGIDA
  const createTask = useCallback(
    async (task: Omit<Task, "id">) => {
      console.group("➕ CRIANDO NOVA TAREFA");
      console.log("📝 Dados da tarefa:", task);

      if (!currentBoard) {
        console.error("❌ Nenhum board selecionado");
        throw new Error("Nenhum board selecionado");
      }

      console.log("🏗️ Colunas disponíveis:", currentBoard.columns.map(c => ({
        title: c.title,
        status: c.status,
        id: c.id
      })));

      // ✅ USAR FUNÇÃO ROBUSTA PARA ENCONTRAR COLUNA
      const column = findColumnByStatus(currentBoard.columns, task.status);

      if (!column) {
        const availableColumns = currentBoard.columns.map(c => `"${c.title}" (${c.status})`).join(', ');
        console.error("❌ COLUNA NÃO ENCONTRADA - Detalhes:", {
          statusProcurado: task.status,
          colunasDisponiveis: availableColumns
        });
        throw new Error(`Coluna para status "${task.status}" não encontrada. Colunas disponíveis: ${availableColumns}`);
      }

      console.log("🎯 Coluna encontrada:", {
        title: column.title,
        status: column.status,
        id: column.id
      });

      const apiTask: ApiTaskCreate = {
        title: task.title,
        description: task.description || null,
        priority: priorityMap[task.priority],
        column_id: column.id, // ✅ Usar ID real da coluna
        assignee_id: task.assignee_id || null,
        due_date: task.due_date || null,
      };

      console.log("📤 Payload para API:", apiTask);

      try {
        await tasksApi.create(apiTask);
        console.log("✅ Tarefa criada na API");

        await syncBoard();
        console.log("✅ Board sincronizado");

        toast({
          title: "Sucesso",
          description: "Tarefa criada com sucesso!",
        });

      } catch (error) {
        console.error("❌ Erro ao criar tarefa:", error);
        throw error;
      } finally {
        console.groupEnd();
      }
    },
    [currentBoard, toast, syncBoard]
  );

  // 🔹 Mover tarefa entre colunas - VERSÃO CORRIGIDA
  const moveTask = useCallback(
    async (taskId: string, newStatus: ColumnStatus) => {
      console.group(`🚀 MOVENDO TAREFA: ${taskId} -> ${newStatus}`);

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

      // ✅ USAR FUNÇÃO ROBUSTA PARA ENCONTRAR COLUNA
      const targetColumn = findColumnByStatus(currentBoard.columns, newStatus);

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

  // 🔹 Deletar tarefa
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

  // 🔹 Adicionar esta função DENTRO do hook useKanbanReal, antes do return final:

  const deleteProject = useCallback(async (projectId: string) => {
    console.group(`🗑️ EXCLUINDO PROJETO: ${projectId}`);

    try {
      // Primeiro verificar se temos a API de projetos com delete
      await projectsApi.delete(projectId);

      // Atualizar lista de projetos localmente
      setProjects(prev => prev.filter(project => project.id !== projectId));

      // Se o projeto atual foi excluído, limpar estado
      if (currentProject?.id === projectId) {
        setCurrentProject(null);
        setCurrentBoard(null);
      }

      console.log("✅ Projeto excluído com sucesso");

      toast({
        title: "Sucesso",
        description: "Projeto excluído com sucesso!",
      });

    } catch (err: any) {
      console.error("❌ Erro ao excluir projeto:", err);

      toast({
        title: "Erro",
        description: err.message || "Erro ao excluir projeto",
        variant: "destructive",
      });

      throw err;
    } finally {
      console.groupEnd();
    }
  }, [currentProject, toast]); // ✅ Agora tem acesso a todas as dependências

  // 🔹 E adicionar ao return final do hook:
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
    deleteTask,
    deleteProject, // ✅ ADICIONAR AQUI
    syncBoard,
    refresh,
  }
};
