// src/providers/AuthProvider.tsx
import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
  useCallback,
} from "react";

// Interfaces
interface UserBase {
  username: string;
  email: string;
  full_name?: string;
}

interface UserCreate extends UserBase {
  password: string;
  confirmPassword?: string;
}

interface UserLogin {
  username: string;
  password: string;
}

interface UserResponse extends UserBase {
  id: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
}

interface Token {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

interface AuthState {
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (credentials: UserLogin) => Promise<void>;
  register: (userData: UserCreate) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  initializeAuth: () => Promise<void>; // ✅ exportado para o AppInitializer
}

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

// API base
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

const authApi = {
  async login(credentials: UserLogin): Promise<Token> {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    if (!res.ok) throw new Error("Login failed");
    return res.json();
  },

  async register(userData: UserCreate): Promise<UserResponse> {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    if (!res.ok) throw new Error("Registration failed");
    return res.json();
  },

  async getMe(token: string): Promise<UserResponse> {
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error("Failed to fetch user data");
    return res.json();
  },

  async refreshToken(refreshToken: string): Promise<Token> {
    const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${refreshToken}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error("Token refresh failed");
    return res.json();
  },
};

// Provider
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem("access_token"),
    isAuthenticated: false,
    isLoading: true,
  });

  // ✅ Tornamos a função reutilizável externamente
  const initializeAuth = useCallback(async () => {
    const token = localStorage.getItem("access_token");

    if (token) {
      try {
        const user = await authApi.getMe(token);
        setState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } else {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (credentials: UserLogin) => {
    setState((p) => ({ ...p, isLoading: true }));
    try {
      const tokens = await authApi.login(credentials);
      localStorage.setItem("access_token", tokens.access_token);
      localStorage.setItem("refresh_token", tokens.refresh_token);
      const user = await authApi.getMe(tokens.access_token);
      setState({
        user,
        token: tokens.access_token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      setState((p) => ({ ...p, isLoading: false }));
      throw new Error("Login failed");
    }
  };

  const register = async (userData: UserCreate) => {
    setState((p) => ({ ...p, isLoading: true }));
    try {
      await authApi.register(userData);
      setState((p) => ({ ...p, isLoading: false }));
    } catch {
      setState((p) => ({ ...p, isLoading: false }));
      throw new Error("Registration failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const refreshToken = async () => {
    const refresh = localStorage.getItem("refresh_token");
    if (!refresh) throw new Error("No refresh token available");

    try {
      const tokens = await authApi.refreshToken(refresh);
      localStorage.setItem("access_token", tokens.access_token);
      localStorage.setItem("refresh_token", tokens.refresh_token);
      const user = await authApi.getMe(tokens.access_token);
      setState({
        user,
        token: tokens.access_token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      logout();
      throw new Error("Token refresh failed");
    }
  };

  useEffect(() => {
    initializeAuth(); // mantém comportamento atual
  }, [initializeAuth]);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshToken,
    initializeAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
