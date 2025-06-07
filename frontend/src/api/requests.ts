// frontend/src/api/requests.ts
import axios from 'axios';
import type { AxiosError, AxiosRequestConfig } from 'axios';

// Создаем отдельные инстансы для каждого сервиса
const createApiInstance = (servicePath: string) => {
  const api = axios.create({
    baseURL: servicePath,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    timeout: 15000, // Увеличиваем timeout
    // withCredentials убираем - это вызывает CORS проблемы
  });

  // Добавляем перехватчик для добавления токена к запросам
  api.interceptors.request.use(
    (config) => {
      console.log(`🚀 Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
      
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 Added token to request');
      }
      
      // Логируем заголовки для отладки
      console.log('📋 Request headers:', config.headers);
      
      return config;
    },
    (error) => {
      console.error('❌ Request error:', error);
      return Promise.reject(error);
    }
  );

  // Добавляем перехватчик для обработки ответов
  api.interceptors.response.use(
    (response) => {
      console.log('✅ Response:', response.status, response.config.url);
      
      // Логируем CORS заголовки для отладки
      if (response.headers['access-control-allow-origin']) {
        console.log('🌐 CORS Origin:', response.headers['access-control-allow-origin']);
      }
      
      return response;
    },
    (error: AxiosError<{ detail?: string | string[] }>) => {
      console.error('❌ Response error:', error.response?.status, error.response?.data);
      
      // Специальная обработка CORS ошибок
      if (error.code === 'ERR_NETWORK') {
        console.error('🚫 Network error - possible CORS issue or server unavailable');
      }
      
      if (error.response?.status === 0) {
        console.error('🚫 Status 0 - likely CORS preflight failure');
      }

      if (error.response?.status === 401) {
        console.warn('🔒 Unauthorized - removing token and redirecting to login');
        localStorage.removeItem('token');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }

      // Обработка различных типов ошибок
      let errorMessage = 'An error occurred';
      
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Network Error - Please check if the server is running and CORS is configured correctly';
      } else if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail[0];
        } else {
          errorMessage = error.response.data.detail;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      return Promise.reject({
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
        code: error.code
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

// Вспомогательная функция для проверки доступности сервисов
export const checkServiceHealth = async () => {
  const services = [
    { name: 'Auth', api: authApi, endpoint: '/health' },
    { name: 'Hives', api: hivesApi, endpoint: '/health' },
    { name: 'Monitoring', api: monitoringApi, endpoint: '/health' },
    { name: 'Notifications', api: notificationsApi, endpoint: '/health' },
  ];

  const results = await Promise.allSettled(
    services.map(async (service) => {
      try {
        const response = await service.api.get(service.endpoint);
        return { name: service.name, status: 'healthy', data: response.data };
      } catch (error) {
        return { name: service.name, status: 'unhealthy', error };
      }
    })
  );

  return results.map((result, index) => ({
    service: services[index].name,
    ...(result.status === 'fulfilled' ? result.value : { status: 'error', error: result.reason })
  }));
};

// Функция для установки токена во все API инстансы
export const setAuthToken = (token: string | null) => {
  const apis = [authApi, hivesApi, monitoringApi, notificationsApi];
  
  apis.forEach(api => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  });
};