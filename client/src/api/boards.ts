// src/api/boards.ts - VERSÃO CORRIGIDA
import { httpClient } from './client';
import type { BoardCreate, BoardResponse } from '@/types/api';

/**
 * API de Boards
 */
export const boardsApi = {
  /**
   * Listar boards de um projeto
   */
  async getByProject(projectId: string): Promise<BoardResponse[]> {
    return httpClient.get<BoardResponse[]>(`/api/boards/project/${projectId}`);
  },

  /**
   * Buscar board por ID
   */
  async getById(id: string): Promise<BoardResponse> {
    return httpClient.get<BoardResponse>(`/api/boards/${id}`);
  },

  /**
   * Criar novo board
   */
  async create(data: BoardCreate): Promise<BoardResponse> {
    return httpClient.post<BoardResponse>('/api/boards', data);
  },

  /**
   * Atualizar board
   */
  async update(id: string, data: Partial<BoardCreate>): Promise<BoardResponse> {
    return httpClient.put<BoardResponse>(`/api/boards/${id}`, data);
  },

  /**
   * Deletar board
   */
  async delete(id: string): Promise<void> {
    return httpClient.delete<void>(`/api/boards/${id}`);
  },
};