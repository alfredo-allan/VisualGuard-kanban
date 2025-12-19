// src/hooks/useKanbanReal.ts
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

// Chave para persistência
const ACTIVE_PROJECT_KEY = "visualguard_active_project_id";

interface UseKanbanRealReturn {
  projects: ProjectResponse[];
  currentProject: ProjectResponse | null;
  currentBoard: KanbanBoard | null;
  isLoading: boolean;
  error: string | null;
  selectProject: (projectId: string) => Promise<void>;
  createProject: (data: {
    name: string;
    description?: string;
  }) => Promise<void>;
  createTask: (task: Omit<Task, "id">) => Promise<void>;
  moveTask: (taskId: string, newStatus: ColumnStatus) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  syncBoard: () => Promise<void>;
  refresh: () => Promise<void>;
}

const findColumnByStatus = (
  columns: KanbanColumn[],
  status: ColumnStatus
): KanbanColumn | undefined => {
  const exactMatch = columns.find((col) => col.status === status);
  if (exactMatch) return exactMatch;

  const expectedTitle = statusToTitleMap[status];
  if (expectedTitle) {
    const titleMatch = columns.find((col) => col.title === expectedTitle);
    if (titleMatch) return titleMatch;
  }

  const searchTerm = status.replace("-", " ").toLowerCase();
  return columns.find((col) => col.title.toLowerCase().includes(searchTerm));
};

export function useKanbanReal(): UseKanbanRealReturn {
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [currentProject, setCurrentProject] = useState<ProjectResponse | null>(
    null
  );
  const [currentBoard, setCurrentBoard] = useState<KanbanBoard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const createDefaultColumnsForBoard = async (
    boardId: string
  ): Promise<void> => {
    const defaultColumns = [
      { title: "Backlog", position: 0, wip_limit: null },
      { title: "A Fazer", position: 1, wip_limit: 5 },
      { title: "Em Progresso", position: 2, wip_limit: 3 },
      { title: "Concluído", position: 3, wip_limit: null },
    ];
    try {
      await Promise.all(
        defaultColumns.map((col) =>
          columnsApi.create({ ...col, board_id: boardId })
        )
      );
    } catch (error) {
      throw new Error("Falha ao criar colunas padrão");
    }
  };

  const loadBoard = async (boardId: string): Promise<KanbanBoard> => {
    try {
      const [board, columns, allTasks] = await Promise.all([
        boardsApi.getById(boardId),
        columnsApi.getByBoard(boardId),
        tasksApi.getAll(),
      ]);

      const kanbanColumns: KanbanColumn[] = columns.map((column) => {
        const tasks = allTasks
          .filter((task) => task.column_id === column.id)
          .sort((a, b) => (a.position || 0) - (b.position || 0))
          .map((apiTask) => taskFromApi(apiTask, column.title));

        return columnFromApi(column, tasks);
      });

      return {
        id: board.id,
        name: board.name,
        project_id: board.project_id,
        columns: kanbanColumns.sort((a, b) => a.position - b.position),
      };
    } catch (error) {
      throw error;
    }
  };

  // ✅ REFATORADO: Agora respeita o projeto salvo no localStorage
  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const projectsData = await projectsApi.getAll();
      setProjects(projectsData);

      if (projectsData.length > 0) {
        // Tenta pegar o ID salvo ou usa o primeiro da lista
        const savedProjectId = localStorage.getItem(ACTIVE_PROJECT_KEY);
        const projectToLoad =
          projectsData.find((p) => p.id === savedProjectId) || projectsData[0];

        await selectProjectInternal(projectToLoad.id);
      } else {
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao carregar projetos");
      setIsLoading(false);
    }
  }, []);

  const selectProjectInternal = async (projectId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const project = await projectsApi.getById(projectId);
      setCurrentProject(project);

      // ✅ PERSISTÊNCIA: Salva o ID para que o Relatório saiba qual carregar
      localStorage.setItem(ACTIVE_PROJECT_KEY, projectId);

      const boards = await boardsApi.getByProject(projectId);
      let activeBoard: BoardResponse;

      if (boards.length === 0) {
        activeBoard = await boardsApi.create({
          name: `${project.name} - Board Principal`,
          project_id: projectId,
        });
        await createDefaultColumnsForBoard(activeBoard.id);
      } else {
        activeBoard = boards[0];
        const existingColumns = await columnsApi.getByBoard(activeBoard.id);
        if (existingColumns.length === 0)
          await createDefaultColumnsForBoard(activeBoard.id);
      }

      const boardData = await loadBoard(activeBoard.id);
      setCurrentBoard(boardData);
    } catch (err: any) {
      setError(err.message || "Erro ao selecionar projeto");
    } finally {
      setIsLoading(false);
    }
  };

  const syncBoard = useCallback(async () => {
    if (!currentProject || !currentBoard) return;
    try {
      const [updatedBoard, updatedColumns, updatedTasks] = await Promise.all([
        boardsApi.getById(currentBoard.id),
        columnsApi.getByBoard(currentBoard.id),
        tasksApi.getAll(),
      ]);
      setCurrentBoard({
        id: updatedBoard.id,
        name: updatedBoard.name,
        project_id: updatedBoard.project_id,
        columns: updatedColumns
          .map((col) =>
            columnFromApi(
              col,
              updatedTasks
                .filter((t) => t.column_id === col.id)
                .map((t) => taskFromApi(t, col.title))
            )
          )
          .sort((a, b) => a.position - b.position),
      });
    } catch (e) {}
  }, [currentProject, currentBoard]);

  const refresh = useCallback(async () => {
    if (currentProject) await selectProjectInternal(currentProject.id);
    else await loadProjects();
  }, [currentProject, loadProjects]);

  const createTask = useCallback(
    async (task: Omit<Task, "id">) => {
      if (!currentBoard) throw new Error("Nenhum board selecionado");
      const column = findColumnByStatus(currentBoard.columns, task.status);
      if (!column) throw new Error("Coluna não encontrada");

      await tasksApi.create({
        title: task.title,
        description: task.description || null,
        priority: priorityMap[task.priority],
        column_id: column.id,
        assignee_id: task.assignee_id || null,
        due_date: task.due_date || null,
      });
      await syncBoard();
    },
    [currentBoard, syncBoard]
  );

  const moveTask = useCallback(
    async (taskId: string, newStatus: ColumnStatus) => {
      if (!currentBoard) return;
      const targetColumn = findColumnByStatus(currentBoard.columns, newStatus);
      if (!targetColumn) return;

      try {
        await tasksApi.move(taskId, {
          column_id: targetColumn.id,
          position: 0,
        });
        await syncBoard();
      } catch (e) {
        await refresh();
      }
    },
    [currentBoard, syncBoard, refresh]
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      try {
        await tasksApi.delete(taskId);
        await syncBoard();
      } catch (e) {
        await refresh();
      }
    },
    [syncBoard, refresh]
  );

  const deleteProject = useCallback(
    async (projectId: string) => {
      try {
        await projectsApi.delete(projectId);
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
        if (currentProject?.id === projectId) {
          localStorage.removeItem(ACTIVE_PROJECT_KEY);
          setCurrentProject(null);
          setCurrentBoard(null);
        }
      } catch (e) {
        throw e;
      }
    },
    [currentProject]
  );

  const selectProject = useCallback(async (projectId: string) => {
    await selectProjectInternal(projectId);
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return {
    projects,
    currentProject,
    currentBoard,
    isLoading,
    error,
    selectProject,
    createProject: async (data) => {
      const p = await projectsApi.create(data);
      setProjects((prev) => [...prev, p]);
      await selectProjectInternal(p.id);
    },
    createTask,
    moveTask,
    deleteTask,
    deleteProject,
    syncBoard,
    refresh,
  };
}
