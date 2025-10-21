// src/types/kanban.ts - VERSÃO 100% REFATORADA
import type {
  TaskResponse,
  ColumnResponse,
  ProjectResponse,
  BoardResponse,
  TaskPriority
} from '@/types/api';

// ==================== TIPOS DO FRONTEND (UI) ====================

// Mantém compatibilidade com código existente do frontend
export type Priority = 'baixa' | 'media' | 'alta' | 'urgente';
export type ColumnStatus = 'backlog' | 'a-fazer' | 'em-progresso' | 'concluido';

// Task do Frontend (UI) - Compatível com componentes existentes
export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: ColumnStatus; // Mantém para compatibilidade
  assignee_id?: string;
  due_date?: string;
  created_at?: string;
  updated_at?: string;

  // Campos para integração com API
  column_id?: string; // UUID da coluna no backend
  position?: number;
  created_by?: string;
}

// Coluna do Kanban (UI) - REFATORADA COM TODAS AS PROPRIEDADES NECESSÁRIAS
export interface KanbanColumn {
  id: string; // UUID da coluna no backend
  title: string;
  status: ColumnStatus; // ✅ PROPRIEDADE CRÍTICA ADICIONADA
  tasks: Task[];
  position: number;
  wip_limit?: number | null;
  board_id: string; // ✅ TORNANDO OBRIGATÓRIO
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

// ==================== MAPEAMENTOS APRIMORADOS ====================

// Mapeamento de prioridades (Frontend <-> Backend)
export const priorityMap: Record<Priority, TaskPriority> = {
  baixa: 'low',
  media: 'medium',
  alta: 'high',
  urgente: 'high', // Mapeia 'urgente' para 'high' no backend
};

export const priorityMapReverse: Record<TaskPriority, Priority> = {
  low: 'baixa',
  medium: 'media',
  high: 'alta', // 'urgente' não tem reverso direto, usa 'alta'
};

// Mapeamento de status de coluna (Título -> Status Frontend) - APRIMORADO
export const columnStatusMap: Record<string, ColumnStatus> = {
  'Backlog': 'backlog',
  'A Fazer': 'a-fazer',
  'Em Progresso': 'em-progresso',
  'Concluído': 'concluido',
  'Concluido': 'concluido', // Fallback para possível variação
  'backlog': 'backlog', // Fallback direto
  'a-fazer': 'a-fazer',
  'em-progresso': 'em-progresso',
  'concluido': 'concluido',
};

// Mapeamento reverso (Status Frontend -> Título esperado) - APRIMORADO
export const statusToTitleMap: Record<ColumnStatus, string> = {
  'backlog': 'Backlog',
  'a-fazer': 'A Fazer',
  'em-progresso': 'Em Progresso',
  'concluido': 'Concluído'
};

// Mapeamento reverso (Status Frontend -> ID de coluna esperado) - NOVO
export const statusToColumnIdMap: Record<ColumnStatus, string> = {
  'backlog': 'backlog-column',
  'a-fazer': 'todo-column',
  'em-progresso': 'progress-column',
  'concluido': 'done-column'
};

// ==================== FUNÇÕES DE CONVERSÃO APRIMORADAS ====================

/**
 * Converter Task da API para Task do Frontend
 * AGORA COM DETECÇÃO AUTOMÁTICA DE STATUS BASEADA NA COLUNA
 */
export const taskFromApi = (apiTask: TaskResponse, columnTitle: string): Task => {
  // Detectar status baseado no título da coluna
  const status = columnStatusMap[columnTitle] || 'backlog';

  // Log para debugging (remover em produção)
  if (!columnStatusMap[columnTitle]) {
    console.warn(`❌ Título de coluna não mapeado: "${columnTitle}". Usando "backlog" como fallback.`);
  }

  return {
    id: apiTask.id,
    title: apiTask.title,
    description: apiTask.description || undefined,
    priority: priorityMapReverse[apiTask.priority] || 'media',
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
 * AGORA COM VALIDAÇÃO DE PRIORIDADE
 */
export const taskToApi = (task: Task, columnId: string): Omit<TaskResponse, 'id' | 'created_at' | 'updated_at'> => {
  // Validar e mapear prioridade
  const apiPriority = priorityMap[task.priority] || 'medium';

  return {
    title: task.title,
    description: task.description || null,
    priority: apiPriority,
    due_date: task.due_date || null,
    position: task.position || 0,
    column_id: columnId,
    assignee_id: task.assignee_id || null,
    created_by: task.created_by || '', // Será preenchido pelo backend
  };
};

/**
 * Converter Coluna da API para Coluna do Frontend
 * AGORA COM DETECÇÃO AUTOMÁTICA DE STATUS
 */
export const columnFromApi = (
  apiColumn: ColumnResponse,
  tasks: Task[] = [],
  status?: ColumnStatus // Opcional - será detectado automaticamente se não fornecido
): KanbanColumn => {
  // Detectar status baseado no título da coluna se não fornecido
  const detectedStatus = status || columnStatusMap[apiColumn.title] || 'backlog';

  // Log para debugging (remover em produção)
  if (!status && !columnStatusMap[apiColumn.title]) {
    console.warn(`❌ Não foi possível detectar status para coluna: "${apiColumn.title}". Usando "backlog".`);
  }

  return {
    id: apiColumn.id,
    title: apiColumn.title,
    status: detectedStatus, // ✅ SEMPRE PREENCHIDO
    tasks: tasks,
    position: apiColumn.position,
    wip_limit: apiColumn.wip_limit || null,
    board_id: apiColumn.board_id,
    created_at: apiColumn.created_at,
    updated_at: apiColumn.updated_at,
  };
};

/**
 * Criar coluna padrão para uso no frontend
 * Útil para estados iniciais e demonstração
 */
export const createDefaultColumn = (
  title: string,
  status: ColumnStatus,
  position: number,
  boardId: string = 'default-board'
): KanbanColumn => ({
  id: statusToColumnIdMap[status] || `column-${status}`,
  title,
  status,
  tasks: [],
  position,
  wip_limit: null,
  board_id: boardId,
});

/**
 * Gerar colunas padrão para um novo board
 */
export const createDefaultColumns = (boardId: string): KanbanColumn[] => [
  createDefaultColumn('Backlog', 'backlog', 0, boardId),
  createDefaultColumn('A Fazer', 'a-fazer', 1, boardId),
  createDefaultColumn('Em Progresso', 'em-progresso', 2, boardId),
  createDefaultColumn('Concluído', 'concluido', 3, boardId),
];

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

/**
 * Validar se uma coluna tem todas as propriedades necessárias
 */
export const validateKanbanColumn = (column: any): column is KanbanColumn => {
  const required = ['id', 'title', 'status', 'tasks', 'position', 'board_id'];
  return required.every(prop => prop in column);
};

/**
 * Log detalhado para debugging de colunas
 */
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

/**
 * Log detalhado para debugging de tasks
 */
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