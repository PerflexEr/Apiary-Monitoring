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
      const response = await authApi.post<{ access_token: string, token_type: string, user?: User }>('/token', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      console.log('Login response:', response.data);
      const { access_token } = response.data;
      
      if (!access_token) {
        throw new Error('No access token received');
      }

      localStorage.setItem('token', access_token);
      
      // Устанавливаем токен во все API инстансы
      const { setAuthToken } = await import('../api/requests');
      setAuthToken(access_token);

      console.log('Token saved, fetching user info...');
      
      // Небольшая задержка для обеспечения, что токен сохранился
      await new Promise(resolve => setTimeout(resolve, 100));

      const userSuccess = await this.checkAuth();

      if (userSuccess) {
        console.log('User info fetched successfully:', this.user);
        return { success: true, isAuthenticated: this.isAuthenticated, user: this.user };
      } else {
        console.error('Failed to fetch user info after login');
        this.setError('Failed to fetch user information');
        localStorage.removeItem('token');
        return { success: false, isAuthenticated: false, user: null };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const apiError = error as ApiError;
      
      runInAction(() => {
        this.setError(apiError.message || 'Failed to login');
        this.setUser(null);
        localStorage.removeItem('token');
      });
      
      return { success: false, isAuthenticated: false, user: null };
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
      this.setError(null);
      
      const response = await authApi.get<User>('/users/me/');
      console.log('User info response:', response.data);

      if (!response.data) {
        throw new Error('No user data received');
      }

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
  logout = async () => {
    console.log('Logging out...');
    localStorage.removeItem('token');
    
    // Удаляем токен из всех API инстансов
    const { setAuthToken } = await import('../api/requests');
    setAuthToken(null);
    
    this.setUser(null);
    this.setError(null);

    // Принудительное перенаправление на страницу входа
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  };

  changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      this.setLoading(true);
      this.setError(null);

      await authApi.post('/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });

      return { success: true, message: 'Password changed successfully' };
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to change password';
      this.setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      this.setLoading(false);
    }
  };

  // Вспомогательные методы
  get isAdmin(): boolean {
    return this.user?.is_superuser || false;
  }

  get isActive(): boolean {
    return this.user?.is_active || false;
  }

  get userDisplayName(): string {
    return this.user?.username || this.user?.email || 'User';
  }

  // Метод для принудительного обновления токена в заголовках axios
  refreshAuthHeaders = () => {
    const token = localStorage.getItem('token');
    // Используем новую функцию для установки токена во все API инстансы
    import('../api/requests').then(({ setAuthToken }) => {
      setAuthToken(token);
    });
  };

  // Инициализация при загрузке приложения
  initialize = async () => {
    console.log('Initializing auth store...');
    this.refreshAuthHeaders();
    
    // Проверяем доступность сервисов
    try {
      const { checkServiceHealth } = await import('../api/requests');
      const healthResults = await checkServiceHealth();
      console.log('🏥 Service health check:', healthResults);
      
      // Проверяем, есть ли недоступные сервисы
      const unhealthyServices = healthResults.filter(result => result.status !== 'healthy');
      if (unhealthyServices.length > 0) {
        console.warn('⚠️ Some services are not healthy:', unhealthyServices);
      }
    } catch (error) {
      console.error('❌ Health check failed:', error);
    }
    
    const token = localStorage.getItem('token');
    if (token && !this.user && !this.loading) {
      await this.checkAuth();
    }
  };
}