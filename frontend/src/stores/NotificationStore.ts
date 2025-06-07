// frontend/src/stores/NotificationStore.ts
import { makeAutoObservable, action, runInAction } from 'mobx';
import type { RootStore } from './RootStore';
import { notificationApi } from '../api/requests';
import type { Notification, NotificationTemplate, NotificationPreference } from '../types/stores';

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
    } catch (error: any) {
      if (error?.response?.status === 404) {
        runInAction(() => {
          this.preferences = null;
        });
      } else {
        console.error('Failed to fetch notification preferences:', error);
        this.setError('Failed to fetch notification preferences');
      }
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

  // Отметить уведомление как прочитанное
  markAsRead = async (notificationId: number) => {
    try {
      this.setLoading(true);
      await notificationApi.put(`/notifications/${notificationId}/read`);
      runInAction(() => {
        const n = this.notifications.find(n => n.id === notificationId);
        if (n) n.isRead = true;
      });
    } catch (error) {
      this.setError('Failed to mark as read');
    } finally {
      this.setLoading(false);
    }
  };

  // Создать новое уведомление
  createNotification = async (notification: Partial<Notification>) => {
    try {
      this.setLoading(true);
      const response = await notificationApi.post<Notification>('/notifications/', notification);
      runInAction(() => {
        this.notifications.unshift(response.data);
      });
      return true;
    } catch (error) {
      this.setError('Failed to create notification');
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
        template_id: notification.template_id,
        notification_type: notification.notification_type,
        priority: notification.priority,
        subject: notification.subject,
        body: notification.body,
        message: notification.message,
        title: notification.title,
        timestamp: notification.timestamp || notification.created_at,
        isRead: notification.isRead ?? notification.is_read ?? false,
        is_sent: notification.is_sent,
        sent_at: notification.sent_at,
        error_message: notification.error_message,
        created_at: notification.created_at,
        updated_at: notification.updated_at,
      }));
      runInAction(() => {
        this.notifications = adaptedNotifications;
      });
    } catch (error) {
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
        template_id: notification.template_id,
        notification_type: notification.notification_type,
        priority: notification.priority,
        subject: notification.subject,
        body: notification.body,
        message: notification.message,
        title: notification.title,
        timestamp: notification.timestamp || notification.created_at,
        isRead: notification.isRead ?? notification.is_read ?? false,
        is_sent: notification.is_sent,
        sent_at: notification.sent_at,
        error_message: notification.error_message,
        created_at: notification.created_at,
        updated_at: notification.updated_at,
      }));
      runInAction(() => {
        this.pendingNotifications = adaptedNotifications;
      });
    } catch (error) {
      this.setError('Failed to fetch pending notifications');
    } finally {
      this.setLoading(false);
    }
  };

  // Получение шаблонов уведомлений
  fetchTemplates = async () => {
    try {
      this.setLoading(true);
      const response = await notificationApi.get<any[]>('/templates/');
      const adaptedTemplates: NotificationTemplate[] = response.data.map((tpl: any) => ({
        id: tpl.id,
        name: tpl.name,
        subject: tpl.subject,
        body: tpl.body,
        notification_type: tpl.notification_type,
        created_at: tpl.created_at,
        updated_at: tpl.updated_at,
      }));
      runInAction(() => {
        this.templates = adaptedTemplates;
      });
    } catch (error) {
      this.setError('Failed to fetch notification templates');
    } finally {
      this.setLoading(false);
    }
  };

  // Создание нового шаблона
  createTemplate = async (template: Partial<NotificationTemplate>) => {
    try {
      this.setLoading(true);
      const response = await notificationApi.post<NotificationTemplate>('/templates/', template);
      runInAction(() => {
        this.templates.push(response.data);
      });
      return true;
    } catch (error) {
      this.setError('Failed to create notification template');
      return false;
    } finally {
      this.setLoading(false);
    }
  };

  // Создать настройки уведомлений (POST /settings/)
  createPreferences = async (prefs: NotificationPreference) => {
    try {
      this.setLoading(true);
      const response = await notificationApi.post<any>('/settings/', prefs);
      runInAction(() => {
        this.preferences = response.data;
      });
      return true;
    } catch (error) {
      this.setError('Failed to create notification preferences');
      return false;
    } finally {
      this.setLoading(false);
    }
  };

  get unreadCount() {
    return this.notifications.filter(n => !n.isRead).length;
  }
}