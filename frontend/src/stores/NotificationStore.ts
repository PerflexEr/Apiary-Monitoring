// frontend/src/stores/NotificationStore.ts
import { makeAutoObservable, action, runInAction } from 'mobx';
import type { RootStore } from './RootStore';
import { notificationApi } from '../api/requests';

interface NotificationPreference {
  id?: number;
  type: 'email' | 'push' | 'sms';
  enabled: boolean;
  alertTypes: string[];
  minSeverity: 'low' | 'medium' | 'high';
}

interface Notification {
  id: number;
  type: string;
  message: string;
  severity: string;
  timestamp: string;
  isRead: boolean;
}

interface NotificationTemplate {
  id?: number;
  name: string;
  content: string;
  type: string;
}

export class NotificationStore {
  preferences: NotificationPreference | null = null;
  notifications: Notification[] = [];
  pendingNotifications: Notification[] = [];
  templates: NotificationTemplate[] = [];
  loading = false;
  error: string | null = null;

  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);
  }

  @action
  setLoading(value: boolean) {
    this.loading = value;
  }

  @action
  setError(message: string | null) {
    this.error = message;
  }

  // Получение настроек уведомлений
  fetchPreferences = async () => {
    try {
      this.setLoading(true);
      const response = await notificationApi.get<any>('/settings/me/');
      runInAction(() => {
        this.preferences = response.data;
      });
    } catch (error) {
      console.error('Failed to fetch notification preferences:', error);
      this.setError('Failed to fetch notification preferences');
    } finally {
      this.setLoading(false);
    }
  };

  // Обновление настроек уведомлений
  updatePreferences = async (preferences: NotificationPreference) => {
    try {
      this.setLoading(true);
      const apiData = {
        ...preferences,
        alert_types: preferences.alertTypes,
        min_severity: preferences.minSeverity,
      };
      const response = await notificationApi.put<any>('/settings/me/', apiData);
      runInAction(() => {
        this.preferences = response.data;
      });
      return true;
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      this.setError('Failed to update notification preferences');
      return false;
    } finally {
      this.setLoading(false);
    }
  };

  // Получение всех уведомлений
  fetchNotifications = async () => {
    try {
      this.setLoading(true);
      const response = await notificationApi.get<any[]>('/notifications/');
      const adaptedNotifications: Notification[] = response.data.map((notification: any) => ({
        id: notification.id,
        type: notification.type,
        message: notification.message,
        severity: notification.severity,
        timestamp: notification.timestamp,
        isRead: notification.is_read
      }));
      runInAction(() => {
        this.notifications = adaptedNotifications;
      });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      this.setError('Failed to fetch notifications');
    } finally {
      this.setLoading(false);
    }
  };

  // Получение ожидающих уведомлений
  fetchPendingNotifications = async () => {
    try {
      this.setLoading(true);
      const response = await notificationApi.get<any[]>('/notifications/pending/');
      const adaptedNotifications: Notification[] = response.data.map((notification: any) => ({
        id: notification.id,
        type: notification.type,
        message: notification.message,
        severity: notification.severity,
        timestamp: notification.timestamp,
        isRead: notification.is_read
      }));
      runInAction(() => {
        this.pendingNotifications = adaptedNotifications;
      });
    } catch (error) {
      console.error('Failed to fetch pending notifications:', error);
      this.setError('Failed to fetch pending notifications');
    } finally {
      this.setLoading(false);
    }
  };

  // Получение шаблонов уведомлений
  fetchTemplates = async () => {
    try {
      this.setLoading(true);
      const response = await notificationApi.get<NotificationTemplate[]>('/templates/');
      runInAction(() => {
        this.templates = response.data;
      });
    } catch (error) {
      console.error('Failed to fetch notification templates:', error);
      this.setError('Failed to fetch notification templates');
    } finally {
      this.setLoading(false);
    }
  };

  // Создание нового шаблона
  createTemplate = async (template: NotificationTemplate) => {
    try {
      this.setLoading(true);
      const response = await notificationApi.post<NotificationTemplate>('/templates/', template);
      runInAction(() => {
        this.templates.push(response.data);
      });
      return true;
    } catch (error) {
      console.error('Failed to create notification template:', error);
      this.setError('Failed to create notification template');
      return false;
    } finally {
      this.setLoading(false);
    }
  };
}