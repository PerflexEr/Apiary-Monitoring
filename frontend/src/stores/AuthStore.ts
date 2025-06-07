// frontend/src/stores/AuthStore.ts
import { makeAutoObservable, action, runInAction } from 'mobx';
import { authApi, setAuthToken, createAuthFormData } from '../api/requests';
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
  initialized = false;

  constructor(rootStore: RootStore) {
    makeAutoObservable(this);
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

  @action
  setInitialized(value: boolean) {
    this.initialized = value;
  }

  login = async (email: string, password: string) => {
    try {
      console.log('Starting login process...');
      this.setLoading(true);
      this.setError(null);

      const formData = createAuthFormData(email, password);
      console.log('Sending login request to /token...');
      
      const response = await authApi.post<{ access_token: string, token_type: string }>('/token', formData, {
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
      setAuthToken(access_token);

      const userSuccess = await this.checkAuth();
      if (userSuccess) {
        return { success: true, isAuthenticated: this.isAuthenticated, user: this.user };
      } else {
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
      console.log('Checking authentication with /users/me...');
      this.setLoading(true);
      this.setError(null);
      
      const response = await authApi.get<User>('/users/me');
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
    console.log('Logging out...');
    localStorage.removeItem('token');
    setAuthToken(null);
    
    this.setUser(null);
    this.setError(null);

    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  };

  initialize = async () => {
    if (this.initialized) {
      return;
    }
    
    console.log('Initializing auth store...');
    this.setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (token) {
        setAuthToken(token);
        await this.checkAuth();
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      this.setError('Failed to initialize authentication');
    } finally {
      this.setLoading(false);
      this.setInitialized(true);
    }
  };

  get isAdmin(): boolean {
    return this.user?.is_superuser || false;
  }

  get isActive(): boolean {
    return this.user?.is_active || false;
  }

  get userDisplayName(): string {
    return this.user?.username || this.user?.email || 'User';
  }
}