// frontend/src/stores/NotificationStore.ts
import { makeAutoObservable, action, runInAction } from 'mobx';
import type { RootStore } from './RootStore';
import { notificationsApi } from '../api/requests';

interface NotificationPreference {
  id?: number;
  type: 'email' | 'push' | 'sms';
  enabled: boolean;
  alertTypes: string[];
  minSeverity: 'low' | 'medium' | 'high';
  email_enabled?: boolean;
  sms_enabled?: boolean;
  push_enabled?: boolean;
  email_address?: string;
  phone_number?: string;
  min_priority?: 'low' | 'medium' | 'high';
  user_id?: number;
  created_at?: string;
  updated_at?: string;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  // API поля
  template_id?: number;
  notification_type?: 'email' | 'sms' | 'push';
  priority?: 'low' | 'medium' | 'high';
  subject?: string;
  body?: string;
  user_id?: number;
  is_sent?: boolean;
  sent_at?: string;
  error_message?: string;
  created_at?: string;
  updated_at?: string;
}

interface NotificationTemplate {
  id: number;
  name: string;
  subject: string;
  body: string;
  notification_type: 'email' | 'sms' | 'push';
  created_at: string;
  updated_at: string | null;
}

export class NotificationStore {
  preferences: NotificationPreference | null = null;
  notifications: Notification[] = [];
  templates: NotificationTemplate[] = [];
  loading = false;
  error: string | null = null;

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
  setPreferences(preferences: NotificationPreference | null) {
    this.preferences = preferences;
  }

  @action
  setNotifications(notifications: Notification[]) {
    this.notifications = notifications;
  }

  @action
  setTemplates(templates: NotificationTemplate[]) {
    this.templates = templates;
  }

  fetchPreferences = async () => {
    try {
      this.setLoading(true);
      this.setError(null);

      console.log('Fetching notification preferences...');
      const response = await notificationsApi.get<any>('/settings/me/');

      // Адаптируем структуру данных под наш интерфейс
      const adaptedPreferences: NotificationPreference = {
        id: response.data.id,
        type: response.data.email_enabled ? 'email' : response.data.push_enabled ? 'push' : 'sms',
        enabled: response.data.email_enabled || response.data.push_enabled || response.data.sms_enabled,
        alertTypes: [], // API не предоставляет эту информацию
        minSeverity: response.data.min_priority || 'medium',
        email_enabled: response.data.email_enabled,
        sms_enabled: response.data.sms_enabled,
        push_enabled: response.data.push_enabled,
        email_address: response.data.email_address,
        phone_number: response.data.phone_number,
        min_priority: response.data.min_priority,
        user_id: response.data.user_id,
        created_at: response.data.created_at,
        updated_at: response.data.updated_at
      };

      runInAction(() => {
        this.setPreferences(adaptedPreferences);
        console.log('Notification preferences fetched successfully:', adaptedPreferences);
      });
    } catch (error: any) {
      console.error('Error fetching notification preferences:', error);
      runInAction(() => {
        this.setError(error.message || 'Failed to fetch notification preferences');
      });
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  };

  updatePreferences = async (preferences: Partial<NotificationPreference>) => {
    try {
      this.setLoading(true);
      this.setError(null);

      // Адаптируем данные для API
      const apiData: any = {};
      if (preferences.type === 'email') {
        apiData.email_enabled = preferences.enabled;
      } else if (preferences.type === 'push') {
        apiData.push_enabled = preferences.enabled;
      } else if (preferences.type === 'sms') {
        apiData.sms_enabled = preferences.enabled;
      }

      if (preferences.minSeverity) {
        apiData.min_priority = preferences.minSeverity;
      }

      console.log('Updating notification preferences...', apiData);
      const response = await notificationsApi.put<any>('/settings/me/', apiData);

      // Адаптируем ответ обратно
      const adaptedPreferences: NotificationPreference = {
        id: response.data.id,
        type: response.data.email_enabled ? 'email' : response.data.push_enabled ? 'push' : 'sms',
        enabled: response.data.email_enabled || response.data.push_enabled || response.data.sms_enabled,
        alertTypes: this.preferences?.alertTypes || [],
        minSeverity: response.data.min_priority || 'medium',
        email_enabled: response.data.email_enabled,
        sms_enabled: response.data.sms_enabled,
        push_enabled: response.data.push_enabled,
        email_address: response.data.email_address,
        phone_number: response.data.phone_number,
        min_priority: response.data.min_priority,
        user_id: response.data.user_id,
        created_at: response.data.created_at,
        updated_at: response.data.updated_at
      };

      runInAction(() => {
        this.setPreferences(adaptedPreferences);
        console.log('Notification preferences updated successfully:', adaptedPreferences);
      });
    } catch (error: any) {
      console.error('Error updating notification preferences:', error);
      runInAction(() => {
        this.setError(error.message || 'Failed to update notification preferences');
      });
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  };

  fetchNotifications = async () => {
    try {
      this.setLoading(true);
      this.setError(null);

      console.log('Fetching notifications...');
      const response = await notificationsApi.get<any[]>('/notifications/');

      // Адаптируем структуру данных под наш интерфейс
      const adaptedNotifications: Notification[] = response.data.map(notification => ({
        id: notification.id,
        title: notification.subject || 'Notification',
        message: notification.body || notification.message || '',
        timestamp: notification.created_at,
        isRead: notification.is_sent || false, // Используем is_sent как аналог isRead
        template_id: notification.template_id,
        notification_type: notification.notification_type,
        priority: notification.priority,
        subject: notification.subject,
        body: notification.body,
        user_id: notification.user_id,
        is_sent: notification.is_sent,
        sent_at: notification.sent_at,
        error_message: notification.error_message,
        created_at: notification.created_at,
        updated_at: notification.updated_at
      }));

      runInAction(() => {
        this.setNotifications(adaptedNotifications);
        console.log('Notifications fetched successfully:', adaptedNotifications);
      });
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      runInAction(() => {
        this.setError(error.message || 'Failed to fetch notifications');
      });
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  };

  fetchPendingNotifications = async () => {
    try {
      this.setLoading(true);
      this.setError(null);

      console.log('Fetching pending notifications...');
      const response = await notificationsApi.get<any[]>('/notifications/pending/');

      // Адаптируем структуру данных
      const adaptedNotifications: Notification[] = response.data.map(notification => ({
        id: notification.id,
        title: notification.subject || 'Pending Notification',
        message: notification.body || notification.message || '',
        timestamp: notification.created_at,
        isRead: false, // Pending notifications are not read
        template_id: notification.template_id,
        notification_type: notification.notification_type,
        priority: notification.priority,
        subject: notification.subject,
        body: notification.body,
        user_id: notification.user_id,
        is_sent: notification.is_sent,
        sent_at: notification.sent_at,
        error_message: notification.error_message,
        created_at: notification.created_at,
        updated_at: notification.updated_at
      }));

      runInAction(() => {
        // Добавляем pending уведомления к существующим
        this.notifications = [...this.notifications, ...adaptedNotifications];
        console.log('Pending notifications fetched successfully:', adaptedNotifications);
      });
    } catch (error: any) {
      console.error('Error fetching pending notifications:', error);
      runInAction(() => {
        this.setError(error.message || 'Failed to fetch pending notifications');
      });
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  };

  fetchTemplates = async () => {
    try {
      this.setLoading(true);
      this.setError(null);

      console.log('Fetching notification templates...');
      const response = await notificationsApi.get<NotificationTemplate[]>('/templates/');

      runInAction(() => {
        this.setTemplates(response.data);
        console.log('Notification templates fetched successfully:', response.data);
      });
    } catch (error: any) {
      console.error('Error fetching notification templates:', error);
      runInAction(() => {
        this.setError(error.message || 'Failed to fetch notification templates');
      });
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  };

  createTemplate = async (template: { name: string; subject: string; body: string; notification_type: 'email' | 'sms' | 'push' }) => {
    try {
      this.setLoading(true);
      this.setError(null);

      console.log('Creating notification template...', template);
      const response = await notificationsApi.post<NotificationTemplate>('/templates/', template);

      runInAction(() => {
        this.templates.push(response.data);
        console.log('Notification template created successfully:', response.data);
      });

      return response.data;
    } catch (error: any) {
      console.error('Error creating notification template:', error);
      runInAction(() => {
        this.setError(error.message || 'Failed to create notification template');
      });
      throw error;
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  };

  markAsRead = async (notificationId: number) => {
    try {
      // Поскольку в API нет прямого эндпоинта для отметки как прочитанное,
      // просто обновляем локально
      runInAction(() => {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
          notification.isRead = true;
        }
        console.log(`Notification ${notificationId} marked as read`);
      });
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      runInAction(() => {
        this.setError(error.message || 'Failed to mark notification as read');
      });
    }
  };

  get unreadCount() {
    return this.notifications.filter(n => !n.isRead).length;
  }

  get notificationsByType() {
    return {
      email: this.notifications.filter(n => n.notification_type === 'email'),
      sms: this.notifications.filter(n => n.notification_type === 'sms'),
      push: this.notifications.filter(n => n.notification_type === 'push')
    };
  }

  get notificationsByPriority() {
    return {
      low: this.notifications.filter(n => n.priority === 'low'),
      medium: this.notifications.filter(n => n.priority === 'medium'),
      high: this.notifications.filter(n => n.priority === 'high')
    };
  }
}