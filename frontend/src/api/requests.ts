// frontend/src/api/requests.ts
import axios, { AxiosError } from 'axios';

// Base configuration for all services
const baseConfig = {
  headers: {
    'Content-Type': 'application/json',
  }
};

// Create separate instances for each service with correct ports
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

// Function to convert authentication data to FormData
export const createAuthFormData = (username: string, password: string) => {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);
  return formData;
};

// Response interceptors for all instances
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

// Add interceptors to all instances
[authApi, hiveApi, monitoringApi, notificationApi].forEach(api => {
  api.interceptors.response.use(responseInterceptor, errorInterceptor);
  // Add request handler for logging
  api.interceptors.request.use((config) => {
    console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, config);
    console.log('Request headers:', config.headers);
    return config;
  });
});

// Function to set authorization token
export const setAuthToken = (token: string | null) => {
  const authHeader = token ? `Bearer ${token}` : '';
  
  [authApi, hiveApi, monitoringApi, notificationApi].forEach(api => {
    api.defaults.headers.common['Authorization'] = authHeader;
  });
  
  console.log('Auth token updated for all API instances');
};

// Function to check service health
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