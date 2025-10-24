// src/types/kanban.ts - VERSÃO CORRIGIDA COM CASE CORRETO
import type {
  TaskResponse,
  ColumnResponse,
  ProjectResponse,
  BoardResponse,
  TaskPriority
} from '@/types/api';

// ==================== TIPOS DO FRONTEND (UI) ====================

export type Priority = 'baixa' | 'media' | 'alta' | 'urgente';
export type ColumnStatus = 'backlog' | 'a-fazer' | 'em-progresso' | 'concluido';

// Task do Frontend (UI)
export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: ColumnStatus;
  assignee_id?: string;
  due_date?: string;
  created_at?: string;
  updated_at?: string;
  column_id?: string;
  position?: number;
  created_by?: string;
}

// Coluna do Kanban (UI)
export interface KanbanColumn {
  id: string; // ✅ UUID real da API
  title: string;
  status: ColumnStatus;
  tasks: Task[];
  position: number;
  wip_limit?: number | null;
  board_id: string;
  created_at?: string;
  updated_at?: string;
}

// Board completo (UI)
export interface KanbanBoard {
  id: string;
  name: string;
  project_id: string;
  columns: KanbanColumn[];
}

// Projeto (UI)
export interface Project {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  created_at?: string;
  updated_at?: string;
}

// ==================== MAPEAMENTOS ====================

// ✅ CORRIGIDO: Usar lowercase conforme a API
export const priorityMap: Record<Priority, TaskPriority> = {
  baixa: 'low',
  media: 'medium',
  alta: 'high',
  urgente: 'high',
};

export const priorityMapReverse: Record<TaskPriority, Priority> = {
  low: 'baixa',
  medium: 'media',
  high: 'alta',
};

// Mapeamento de status de coluna (Título -> Status Frontend)
export const columnStatusMap: Record<string, ColumnStatus> = {
  'Backlog': 'backlog',
  'A Fazer': 'a-fazer',
  'Em Progresso': 'em-progresso',
  'Concluído': 'concluido',
  'Concluido': 'concluido',
  'backlog': 'backlog',
  'a-fazer': 'a-fazer',
  'em-progresso': 'em-progresso',
  'concluido': 'concluido',
};

// Mapeamento reverso (Status Frontend -> Título)
export const statusToTitleMap: Record<ColumnStatus, string> = {
  'backlog': 'Backlog',
  'a-fazer': 'A Fazer',
  'em-progresso': 'Em Progresso',
  'concluido': 'Concluído'
};

// ==================== FUNÇÕES DE CONVERSÃO ====================

/**
 * Converter Task da API para Task do Frontend
 */
export const taskFromApi = (apiTask: TaskResponse, columnTitle: string): Task => {
  const status = columnStatusMap[columnTitle] || 'backlog';

  // Normalizar prioridade (garantir lowercase)
  const normalizedPriority = (apiTask.priority || 'medium').toLowerCase() as TaskPriority;
  const priority = priorityMapReverse[normalizedPriority] || 'media';

  return {
    id: apiTask.id,
    title: apiTask.title,
    description: apiTask.description || undefined,
    priority,
    status,
    assignee_id: apiTask.assignee_id || undefined,
    due_date: apiTask.due_date || undefined,
    created_at: apiTask.created_at,
    updated_at: apiTask.updated_at,
    column_id: apiTask.column_id,
    position: apiTask.position || 0,
    created_by: apiTask.created_by,
  };
};

/**
 * Converter Task do Frontend para API
 */
export const taskToApi = (task: Task, columnId: string): Omit<TaskResponse, 'id' | 'created_at' | 'updated_at'> => {
  const apiPriority = priorityMap[task.priority] || 'medium';

  return {
    title: task.title,
    description: task.description || null,
    priority: apiPriority,
    due_date: task.due_date || null,
    position: task.position || 0,
    column_id: columnId,
    assignee_id: task.assignee_id || null,
    created_by: task.created_by || '',
  };
};

/**
 * Converter Coluna da API para Coluna do Frontend
 * ✅ SEMPRE USA ID REAL DA API
 */
export const columnFromApi = (
  apiColumn: ColumnResponse,
  tasks: Task[] = [],
  status?: ColumnStatus
): KanbanColumn => {
  const detectedStatus = status || columnStatusMap[apiColumn.title] || 'backlog';

  if (!status && !columnStatusMap[apiColumn.title]) {
    console.warn(`⚠️ Status não detectado para coluna: "${apiColumn.title}". Usando "backlog".`);
  }

  return {
    id: apiColumn.id, // ✅ USA ID REAL DA API (UUID)
    title: apiColumn.title,
    status: detectedStatus,
    tasks: tasks,
    position: apiColumn.position,
    wip_limit: apiColumn.wip_limit || null,
    board_id: apiColumn.board_id,
    created_at: apiColumn.created_at,
    updated_at: apiColumn.updated_at,
  };
};

// ==================== TIPOS PARA FORMS ====================

export interface TaskFormData {
  title: string;
  description?: string;
  priority: Priority;
  status: ColumnStatus;
}

export interface ProjectFormData {
  name: string;
  description?: string;
}

// ==================== UTILITÁRIOS PARA DEBUG ====================

export const validateKanbanColumn = (column: any): column is KanbanColumn => {
  const required = ['id', 'title', 'status', 'tasks', 'position', 'board_id'];
  const isValid = required.every(prop => prop in column);

  if (!isValid) {
    console.warn('❌ Coluna inválida - faltam propriedades:',
      required.filter(prop => !(prop in column))
    );
  }

  return isValid;
};

export const debugColumn = (column: KanbanColumn, context: string = '') => {
  console.group(`🔍 DEBUG COLUMN ${context}`);
  console.log('ID:', column.id);
  console.log('Title:', column.title);
  console.log('Status:', column.status);
  console.log('Position:', column.position);
  console.log('Board ID:', column.board_id);
  console.log('Tasks:', column.tasks.length);
  console.log('WIP Limit:', column.wip_limit);
  console.groupEnd();
};

export const debugTask = (task: Task, context: string = '') => {
  console.group(`🔍 DEBUG TASK ${context}`);
  console.log('ID:', task.id);
  console.log('Title:', task.title);
  console.log('Status:', task.status);
  console.log('Priority:', task.priority);
  console.log('Column ID:', task.column_id);
  console.log('Position:', task.position);
  console.groupEnd();
};