import { apiClient } from '@/lib/api';

// Types for authentication
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'user';
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Authentication service
class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.login(credentials);

    // Store token in localStorage
    localStorage.setItem('token', response.token);

    return response;
  }

  async register(userData: RegisterData) {
    return apiClient.register(userData);
  }

  async verifyToken(): Promise<{ user: User } | null> {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const response = await apiClient.verifyToken();
      return response;
    } catch (error) {
      // Token is invalid, remove it
      this.logout();
      return null;
    }
  }

  logout() {
    localStorage.removeItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();