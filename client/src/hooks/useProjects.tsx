import { useState, useEffect, useCallback } from 'react';
import { projectsApi } from '@/api';
import type { ProjectResponse, ProjectCreate } from '@/types';
import { useToast } from './use-toast';

interface UseProjectsReturn {
  projects: ProjectResponse[];
  isLoading: boolean;
  error: string | null;
  loadProjects: () => Promise<void>;
  createProject: (data: ProjectCreate) => Promise<ProjectResponse>;
  deleteProject: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Hook para gerenciar projetos
 */
export function useProjects(): UseProjectsReturn {
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  /**
   * Carregar lista de projetos
   */
  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await projectsApi.getAll();
      setProjects(data);
    } catch (err: any) {
      const errorMsg = err.message || 'Erro ao carregar projetos';
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
   * Criar novo projeto
   */
  const createProject = useCallback(
    async (data: ProjectCreate): Promise<ProjectResponse> => {
      try {
        const newProject = await projectsApi.create(data);
        setProjects((prev) => [...prev, newProject]);
        
        toast({
          title: 'Sucesso',
          description: 'Projeto criado com sucesso!',
        });
        
        return newProject;
      } catch (err: any) {
        toast({
          title: 'Erro',
          description: err.message || 'Erro ao criar projeto',
          variant: 'destructive',
        });
        throw err;
      }
    },
    [toast]
  );

  /**
   * Deletar projeto
   */
  const deleteProject = useCallback(
    async (id: string) => {
      try {
        await projectsApi.delete(id);
        setProjects((prev) => prev.filter((p) => p.id !== id));
        
        toast({
          title: 'Sucesso',
          description: 'Projeto removido com sucesso!',
        });
      } catch (err: any) {
        toast({
          title: 'Erro',
          description: err.message || 'Erro ao deletar projeto',
          variant: 'destructive',
        });
        throw err;
      }
    },
    [toast]
  );

  /**
   * Recarregar projetos
   */
  const refresh = useCallback(async () => {
    await loadProjects();
  }, [loadProjects]);

  // Carregar projetos na montagem do componente
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return {
    projects,
    isLoading,
    error,
    loadProjects,
    createProject,
    deleteProject,
    refresh,
  };
}
