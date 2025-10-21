// src/api/columns.ts
import { httpClient } from './client';
import type { ColumnResponse, ColumnCreate } from '@/types/api';

/**
 * API de Colunas
 */
export const columnsApi = {
  /**
   * Listar colunas de um board
   */
  async getByBoard(boardId: string): Promise<ColumnResponse[]> {
    return httpClient.get<ColumnResponse[]>(`/api/columns/board/${boardId}`);
  },

  /**
   * Buscar coluna por ID
   */
  async getById(id: string): Promise<ColumnResponse> {
    return httpClient.get<ColumnResponse>(`/api/columns/${id}`);
  },

  /**
   * Criar nova coluna
   */
  async create(data: ColumnCreate): Promise<ColumnResponse> {
    return httpClient.post<ColumnResponse>('/api/columns', data);
  },

  /**
   * Atualizar coluna
   */
  async update(id: string, data: Partial<ColumnCreate>): Promise<ColumnResponse> {
    return httpClient.put<ColumnResponse>(`/api/columns/${id}`, data);
  },

  /**
   * Deletar coluna
   */
  async delete(id: string): Promise<void> {
    return httpClient.delete<void>(`/api/columns/${id}`);
  },
};