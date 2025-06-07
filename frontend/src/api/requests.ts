// frontend/src/api/requests.ts
import axios, { AxiosError } from 'axios';

// Базовая конфигурация для всех сервисов
const baseConfig = {
  headers: {
    'Content-Type': 'application/json',
  }
};

// Создаем отдельные инстансы для каждого сервиса с правильными портами
export const authApi = axios.create({
  ...baseConfig,
  baseURL: 'http://localhost:8000',
});

export const hiveApi = axios.create({
  ...baseConfig,
  baseURL: 'http://localhost:8001/',
});

export const monitoringApi = axios.create({
  ...baseConfig,
  baseURL: 'http://localhost:8002',
});

export const notificationApi = axios.create({
  ...baseConfig,
  baseURL: 'http://localhost:8003',
});

// Функция для преобразования данных аутентификации в FormData
export const createAuthFormData = (username: string, password: string) => {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);
  return formData;
};

// Обработчики ответа для всех инстансов
const responseInterceptor = (response: any) => {
  return response;
};

const errorInterceptor = async (error: AxiosError) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('token');
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  }
  return Promise.reject(error);
};

// Добавляем перехватчики ко всем инстансам
[authApi, hiveApi, monitoringApi, notificationApi].forEach(api => {
  api.interceptors.response.use(responseInterceptor, errorInterceptor);
  // Добавляем обработчик запросов для логирования
  api.interceptors.request.use((config) => {
    console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, config);
    console.log('Request headers:', config.headers);
    return config;
  });
});

// Функция для установки токена авторизации
export const setAuthToken = (token: string | null) => {
  const authHeader = token ? `Bearer ${token}` : '';
  
  [authApi, hiveApi, monitoringApi, notificationApi].forEach(api => {
    api.defaults.headers.common['Authorization'] = authHeader;
  });
  
  console.log('Auth token updated for all API instances');
};

// Функция для проверки здоровья сервисов
export const checkServiceHealth = async () => {
  const services = [
    { name: 'auth', api: authApi, path: '/health' },
    { name: 'hive', api: hiveApi, path: '/health' },
    { name: 'monitoring', api: monitoringApi, path: '/health' },
    { name: 'notification', api: notificationApi, path: '/health' }
  ];

  const results = await Promise.all(
    services.map(async ({ name, api, path }) => {
      try {
        const response = await api.get(path);
        console.log(`Service ${name} health check:`, response.status);
        return { service: name, status: 'healthy' };
      } catch (error) {
        console.error(`Health check failed for ${name} service:`, error);
        return { service: name, status: 'unhealthy', error };
      }
    })
  );

  return results;
};