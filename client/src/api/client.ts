import type { ApiError } from '@/types/api';
// Configuração base da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Classe de erro customizada para a API
 */
export class ApiException extends Error {
  constructor(
    public message: string,
    public statusCode?: number,
    public errors?: any
  ) {
    super(message);
    this.name = 'ApiException';
  }
}

/**
 * Cliente HTTP base para comunicação com a API
 */
export class HttpClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Retorna headers de autenticação
   */
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  /**
   * Processa a resposta da API
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    // Resposta sem conteúdo (204 No Content)
    if (response.status === 204) {
      return undefined as T;
    }

    // Sucesso
    if (response.ok) {
      return response.json();
    }

    // Erro
    let error: ApiError;
    try {
      error = await response.json();
    } catch {
      error = {
        detail: 'Ocorreu um erro inesperado',
        status_code: response.status,
      };
    }

    throw new ApiException(
      error.detail || 'Falha na requisição',
      error.status_code || response.status,
      error
    );
  }

  /**
   * Requisição GET
   */
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    // Adicionar query params
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value);
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Requisição POST
   */
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Requisição PUT
   */
  async put<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Requisição PATCH
   */
  async patch<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Requisição DELETE
   */
  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<T>(response);
  }
}

/**
 * Instância global do cliente HTTP
 */
export const httpClient = new HttpClient();
