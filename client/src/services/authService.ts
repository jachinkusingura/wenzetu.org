import apiClient from './apiClient';
import { User } from '../types';

export interface RegisterPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, 'password'>;
}

export const authService = {
  async register(data: RegisterPayload): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/register', data);
    return response.data;
  },

  async login(data: LoginPayload): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', data);
    return response.data;
  },

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  },

  getToken(): string | null {
    return localStorage.getItem('authToken');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
