import { UserCreate, UserLogin, UserResponse, Token, AuthError } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://0.0.0.0:8000';

class AuthApi {
    private baseURL: string;

    constructor() {
        this.baseURL = `${API_BASE_URL}/api/auth`;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;
        const config: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                const errorData: AuthError = await response.json();
                throw new Error(errorData.detail || 'Erro na requisição');
            }

            return await response.json();
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Erro de conexão');
        }
    }

    async register(userData: UserCreate): Promise<UserResponse> {
        const { confirmPassword, ...apiData } = userData;

        return this.request<UserResponse>('/register', {
            method: 'POST',
            body: JSON.stringify(apiData),
        });
    }

    async login(credentials: UserLogin): Promise<Token> {
        return this.request<Token>('/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    }

    async getMe(token: string): Promise<UserResponse> {
        return this.request<UserResponse>('/me', {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    }

    async refreshToken(refreshToken: string): Promise<Token> {
        return this.request<Token>('/refresh', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${refreshToken}`,
            },
        });
    }
}

export const authApi = new AuthApi();