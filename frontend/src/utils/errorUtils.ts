// frontend/src/utils/errorUtils.ts

/**
 * Извлекает читаемое сообщение об ошибке из различных типов ошибок
 */
export function getErrorMessage(error: unknown, fallback = 'An unexpected error occurred'): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object') {
    // Обработка API ошибок из requests.ts
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }

    // Обработка стандартных Error объектов
    if (error instanceof Error) {
      return error.message;
    }

    // Обработка ошибок от axios/API
    if ('response' in error && error.response && typeof error.response === 'object') {
      const response = error.response as any;
      if (response.data && typeof response.data === 'object') {
        if (response.data.detail) {
          if (Array.isArray(response.data.detail)) {
            return response.data.detail[0] || fallback;
          }
          if (typeof response.data.detail === 'string') {
            return response.data.detail;
          }
        }
        if (response.data.message && typeof response.data.message === 'string') {
          return response.data.message;
        }
      }
    }

    // Попытка stringify для отладки
    try {
      const stringified = JSON.stringify(error);
      console.warn('Unhandled error object:', stringified);
    } catch {
      console.warn('Unhandled error object that cannot be stringified:', error);
    }
  }

  return fallback;
}

/**
 * Проверяет, является ли ошибка сетевой ошибкой
 */
export function isNetworkError(error: unknown): boolean {
  if (error && typeof error === 'object') {
    if ('code' in error && error.code === 'NETWORK_ERROR') {
      return true;
    }
    if ('message' in error && typeof error.message === 'string') {
      return error.message.toLowerCase().includes('network');
    }
  }
  return false;
}

/**
 * Проверяет, является ли ошибка ошибкой аутентификации
 */
export function isAuthError(error: unknown): boolean {
  if (error && typeof error === 'object') {
    if ('status' in error && (error.status === 401 || error.status === 403)) {
      return true;
    }
    if ('response' in error && error.response && typeof error.response === 'object') {
      const response = error.response as any;
      return response.status === 401 || response.status === 403;
    }
  }
  return false;
}