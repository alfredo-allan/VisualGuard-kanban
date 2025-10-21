/**
 * Tipos da API (Backend Python/FastAPI)
 * Mantém compatibilidade com os schemas Pydantic
 */

// ============================================
// AUTH & USER TYPES
// ============================================

export interface UserBase {
  username: string;
  email: string;
  full_name?: string | null;
}

export interface UserCreate extends UserBase {
  password: string;
}

export interface UserLogin {
  username: string;
  password: string;
}

export interface UserResponse extends UserBase {
  id: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
}

export interface Token {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface TokenData {
  user_id?: string | null;
  username?: string | null;
}

// ============================================
// PROJECT TYPES
// ============================================

export interface ProjectBase {
  name: string;
  description?: string | null;
}

export interface ProjectCreate extends ProjectBase {}

export interface ProjectUpdate {
  name?: string | null;
  description?: string | null;
}

export interface ProjectResponse extends ProjectBase {
  id: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// BOARD TYPES
// ============================================

export interface BoardBase {
  name: string;
}

export interface BoardCreate extends BoardBase {
  project_id: string;
}

export interface BoardResponse extends BoardBase {
  id: string;
  project_id: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// COLUMN TYPES
// ============================================

export interface ColumnBase {
  title: string;
  position: number;
  wip_limit?: number | null;
}

export interface ColumnCreate extends ColumnBase {
  board_id: string;
}

export interface ColumnResponse extends ColumnBase {
  id: string;
  board_id: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// TASK TYPES
// ============================================

export type TaskPriority = 'low' | 'medium' | 'high';

export interface TaskBase {
  title: string;
  description?: string | null;
  priority: TaskPriority;
  due_date?: string | null;
}

export interface TaskCreate extends TaskBase {
  column_id: string;
  assignee_id?: string | null;
}

export interface TaskUpdate {
  title?: string | null;
  description?: string | null;
  priority?: TaskPriority | null;
  due_date?: string | null;
  assignee_id?: string | null;
}

export interface TaskMove {
  column_id: string;
  position: number;
}

export interface TaskResponse extends TaskBase {
  id: string;
  position: number;
  column_id: string;
  assignee_id?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// API ERROR TYPES
// ============================================

export interface ApiError {
  detail: string;
  status_code?: number;
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface ValidationErrorResponse {
  detail: ValidationError[];
}
