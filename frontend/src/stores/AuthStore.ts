// frontend/src/stores/AuthStore.ts
import { makeAutoObservable, action, runInAction } from 'mobx';
import { authApi } from '../api/requests';
import type { RootStore } from './RootStore';

interface User {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  is_superuser: boolean;
  is_verified?: boolean;
}

interface ApiError {
  message: string;
  status?: number;
  data?: any;
}

export class AuthStore {
  isAuthenticated = false;
  loading = false;
  error: string | null = null;
  user: User | null = null;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(private rootStore: RootStore) {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  @action
  setLoading(loading: boolean) {
    this.loading = loading;
  }

  @action
  setError(error: string | null) {
    this.error = error;
  }

  @action
  setUser(user: User | null) {
    this.user = user;
    this.isAuthenticated = !!user;
  }

  login = async (email: string, password: string) => {
    try {
      console.log('Starting login process...');
      this.setLoading(true);
      this.setError(null);

      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      console.log('Sending login request to /token...');
      const response = await authApi.post<{ access_token: string, token_type: string }>('/token', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      console.log('Login response:', response.data);
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);

      console.log('Token saved, fetching user info...');
      await new Promise(resolve => setTimeout(resolve, 100));

      const userSuccess = await this.checkAuth();

      if (userSuccess) {
        console.log('User info fetched successfully:', this.user);
        return true;
      } else {
        console.error('Failed to fetch user info after login');
        this.setError('Failed to fetch user information');
        return false;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const apiError = error as ApiError;
      runInAction(() => {
        this.setError(apiError.message || 'Failed to login');
        this.setUser(null);
        localStorage.removeItem('token');
      });
      return false;
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  };

  checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found');
      this.setUser(null);
      return false;
    }

    try {
      console.log('Checking authentication with /users/me/...');
      this.setLoading(true);
      const response = await authApi.get<User>('/users/me/');
      console.log('User info response:', response.data);

      runInAction(() => {
        this.setUser(response.data);
        this.setError(null);
      });

      return true;
    } catch (error: any) {
      console.error('Auth check failed:', error);
      console.error('Error details:', {
        status: error.status,
        message: error.message,
        data: error.data
      });
      runInAction(() => {
        this.setUser(null);
        this.setError(null);
        localStorage.removeItem('token');
      });
      return false;
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  };

  @action
  logout = () => {
    localStorage.removeItem('token');
    this.setUser(null);
    this.setError(null);

    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  };

  changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await authApi.post('/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to change password');
    }
  };
}