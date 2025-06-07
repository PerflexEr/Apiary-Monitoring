// frontend/src/api/requests.ts
import axios, { AxiosError } from 'axios';

// Создаем отдельные инстансы для каждого сервиса
const createApiInstance = (servicePath: string) => {
  const api = axios.create({
    baseURL: servicePath,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 10000,
    withCredentials: false // Изменено на false для избежания проблем с CORS
  });

  // Добавляем перехватчик для добавления токена к запросам
  api.interceptors.request.use(
    (config) => {
      console.log(`Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Added token to request');
      }
      return config;
    },
    (error) => {
      console.error('Request error:', error);
      return Promise.reject(error);
    }
  );

  // Добавляем перехватчик для обработки ошибок
  api.interceptors.response.use(
    (response) => {
      console.log('Response:', response.status, response.data);
      return response;
    },
    (error: AxiosError<{ detail?: string | string[] }>) => {
      console.error('Response error:', error.response?.status, error.response?.data);

      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }

      const errorMessage = Array.isArray(error.response?.data?.detail)
        ? error.response?.data?.detail[0]
        : error.response?.data?.detail || error.message || 'An error occurred';

      return Promise.reject({
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data
      });
    }
  );

  return api;
};

// Создаем инстансы для каждого сервиса с правильными базовыми URL
export const authApi = createApiInstance(''); // Для auth service (через прокси)
export const hivesApi = createApiInstance('/hives'); // Для hive service (через прокси)
export const monitoringApi = createApiInstance('/monitoring'); // Для monitoring service (через прокси)
export const notificationsApi = createApiInstance('/notifications'); // Для notification service (через прокси)