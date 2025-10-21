// src/api/tasks.ts - VERSÃO CORRIGIDA
import { httpClient } from './client';
import type { TaskCreate, TaskUpdate, TaskMove, TaskResponse } from '@/types/api';

/**
 * API de Tarefas
 */
export const tasksApi = {
  /**
   * Listar todas as tarefas com filtros opcionais
   */
  async getAll(filters?: {
    column_id?: string;
    priority?: string;
    assignee_id?: string;
    skip?: number;
    limit?: number;
  }): Promise<TaskResponse[]> {
    const params: Record<string, string> = {};

    if (filters?.column_id) params.column_id = filters.column_id;
    if (filters?.priority) params.priority = filters.priority;
    if (filters?.assignee_id) params.assignee_id = filters.assignee_id;
    if (filters?.skip !== undefined) params.skip = filters.skip.toString();
    if (filters?.limit !== undefined) params.limit = filters.limit.toString();

    return httpClient.get<TaskResponse[]>('/api/tasks', params);
  },

  /**
   * Buscar tarefa por ID
   */
  async getById(id: string): Promise<TaskResponse> {
    return httpClient.get<TaskResponse>(`/api/tasks/${id}`);
  },

  /**
   * Criar nova tarefa
   */
  async create(data: TaskCreate): Promise<TaskResponse> {
    return httpClient.post<TaskResponse>('/api/tasks', data);
  },

  /**
   * Atualizar tarefa
   */
  async update(id: string, data: TaskUpdate): Promise<TaskResponse> {
    return httpClient.put<TaskResponse>(`/api/tasks/${id}`, data);
  },

  /**
   * Mover tarefa para outra coluna ou posição
   */
  async move(id: string, data: TaskMove): Promise<TaskResponse> {
    return httpClient.patch<TaskResponse>(`/api/tasks/${id}/move`, data);
  },

  /**
   * Deletar tarefa
   */
  async delete(id: string): Promise<void> {
    return httpClient.delete<void>(`/api/tasks/${id}`);
  },

  /**
   * Buscar tarefas de um board específico (através das colunas)
   */
  async getByBoard(boardId: string): Promise<TaskResponse[]> {
    // Nota: Este endpoint requer que você busque as colunas primeiro
    // e depois busque as tasks de cada coluna
    // Vamos implementar isso no hook useKanban
    return this.getAll();
  },

  /**
   * Buscar tarefas por coluna
   */
  async getByColumn(columnId: string): Promise<TaskResponse[]> {
    return this.getAll({ column_id: columnId });
  },
};