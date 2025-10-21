// src/api/projects.ts - VERSÃO CORRIGIDA
import { httpClient } from './client';
import type { ProjectCreate, ProjectResponse } from '@/types/api';

/**
 * API de Projetos
 */
export const projectsApi = {
  /**
   * Listar todos os projetos do usuário
   */
  async getAll(params?: { skip?: number; limit?: number }): Promise<ProjectResponse[]> {
    return httpClient.get<ProjectResponse[]>('/api/projects', {
      skip: params?.skip?.toString() || '0',
      limit: params?.limit?.toString() || '100',
    });
  },

  /**
   * Buscar projeto por ID
   */
  async getById(id: string): Promise<ProjectResponse> {
    return httpClient.get<ProjectResponse>(`/api/projects/${id}`);
  },

  /**
   * Criar novo projeto
   */
  async create(data: ProjectCreate): Promise<ProjectResponse> {
    return httpClient.post<ProjectResponse>('/api/projects', data);
  },

  /**
   * Atualizar projeto
   */
  async update(id: string, data: Partial<ProjectCreate>): Promise<ProjectResponse> {
    return httpClient.put<ProjectResponse>(`/api/projects/${id}`, data);
  },

  /**
   * Deletar projeto
   */
  async delete(id: string): Promise<void> {
    return httpClient.delete<void>(`/api/projects/${id}`);
  },
};