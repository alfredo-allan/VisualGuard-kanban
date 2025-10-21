export interface UserBase {
  username: string;
  email: string;
  full_name?: string;
}

export interface UserCreate extends UserBase {
  password: string;
  confirmPassword?: string;
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

export interface AuthError {
  detail: string;
}

export interface AuthState {
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}