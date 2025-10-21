// src/api/index.ts - VERSÃO CORRIGIDA
/**
 * Export central de todas as APIs
 */

export { httpClient, ApiException } from './client';
export { projectsApi } from './projects';
export { boardsApi } from './boards';
export { columnsApi } from './columns';
export { tasksApi } from './tasks';

// Re-export dos tipos para facilitar imports
export type * from '@/types/api';