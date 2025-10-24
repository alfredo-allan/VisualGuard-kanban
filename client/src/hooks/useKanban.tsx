// src/hooks/useKanban.tsx - VERSÃO CORRIGIDA COM IMPORTS
import { useState, useEffect, useCallback } from 'react';
import { boardsApi, columnsApi, tasksApi } from '@/api';
import type {
  BoardResponse,
  ColumnResponse,
  TaskResponse,
  TaskCreate,
  TaskUpdate,
  TaskMove,
} from '@/types/api'; // ✅ CORRIGIDO: Import de @/types/api
import { useToast } from './use-toast';

interface UseKanbanReturn {
  board: BoardResponse | null;
  columns: ColumnResponse[];
  tasks: TaskResponse[];
  isLoading: boolean;
  error: string | null;
  // Ações
  loadBoard: (boardId: string) => Promise<void>;
  createTask: (data: TaskCreate) => Promise<void>;
  updateTask: (id: string, data: TaskUpdate) => Promise<void>;
  moveTask: (id: string, data: TaskMove) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Hook principal para gerenciar o Kanban Board
 * Carrega board, colunas e tarefas de forma integrada
 */
export function useKanban(boardId?: string): UseKanbanReturn {
  const [board, setBoard] = useState<BoardResponse | null>(null);
  const [columns, setColumns] = useState<ColumnResponse[]>([]);
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  /**
   * Carrega o board completo com colunas e tarefas
   */
  const loadBoard = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Buscar board
      const boardData = await boardsApi.getById(id);
      setBoard(boardData);

      // Buscar colunas do board
      const columnsData = await columnsApi.getByBoard(id);
      setColumns(columnsData);

      // Buscar todas as tarefas
      const tasksData = await tasksApi.getAll();

      // Filtrar apenas tasks que pertencem às colunas deste board
      const columnIds = columnsData.map((col) => col.id);
      const filteredTasks = tasksData.filter((task) =>
        columnIds.includes(task.column_id)
      );

      setTasks(filteredTasks);
    } catch (err: any) {
      const errorMsg = err.message || 'Erro ao carregar board';
      setError(errorMsg);
      toast({
        title: 'Erro',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  /**
   * Criar nova tarefa
   */
  const createTask = useCallback(
    async (data: TaskCreate) => {
      try {
        const newTask = await tasksApi.create(data);
        setTasks((prev) => [...prev, newTask]);

        toast({
          title: 'Sucesso',
          description: 'Tarefa criada com sucesso!',
        });
      } catch (err: any) {
        toast({
          title: 'Erro',
          description: err.message || 'Erro ao criar tarefa',
          variant: 'destructive',
        });
        throw err;
      }
    },
    [toast]
  );

  /**
   * Atualizar tarefa
   */
  const updateTask = useCallback(
    async (id: string, data: TaskUpdate) => {
      try {
        const updatedTask = await tasksApi.update(id, data);
        setTasks((prev) =>
          prev.map((task) => (task.id === id ? updatedTask : task))
        );

        toast({
          title: 'Sucesso',
          description: 'Tarefa atualizada com sucesso!',
        });
      } catch (err: any) {
        toast({
          title: 'Erro',
          description: err.message || 'Erro ao atualizar tarefa',
          variant: 'destructive',
        });
        throw err;
      }
    },
    [toast]
  );

  /**
   * Mover tarefa (drag and drop)
   */
  const moveTask = useCallback(
    async (id: string, data: TaskMove) => {
      try {
        const movedTask = await tasksApi.move(id, data);
        setTasks((prev) =>
          prev.map((task) => (task.id === id ? movedTask : task))
        );
      } catch (err: any) {
        toast({
          title: 'Erro',
          description: err.message || 'Erro ao mover tarefa',
          variant: 'destructive',
        });
        throw err;
      }
    },
    [toast]
  );

  /**
   * Deletar tarefa
   */
  const deleteTask = useCallback(
    async (id: string) => {
      try {
        await tasksApi.delete(id);
        setTasks((prev) => prev.filter((task) => task.id !== id));

        toast({
          title: 'Sucesso',
          description: 'Tarefa removida com sucesso!',
        });
      } catch (err: any) {
        toast({
          title: 'Erro',
          description: err.message || 'Erro ao deletar tarefa',
          variant: 'destructive',
        });
        throw err;
      }
    },
    [toast]
  );

  /**
   * Recarregar dados
   */
  const refresh = useCallback(async () => {
    if (board) {
      await loadBoard(board.id);
    }
  }, [board, loadBoard]);

  // Carregar board automaticamente se boardId for fornecido
  useEffect(() => {
    if (boardId) {
      loadBoard(boardId);
    }
  }, [boardId, loadBoard]);

  return {
    board,
    columns,
    tasks,
    isLoading,
    error,
    loadBoard,
    createTask,
    updateTask,
    moveTask,
    deleteTask,
    refresh,
  };
}