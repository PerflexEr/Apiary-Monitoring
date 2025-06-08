// frontend/src/types/stores.ts
export interface User {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  is_superuser: boolean;
  is_verified?: boolean;
}

export interface Hive {
  id: number;
  name: string;
  location: string;
  status: 'healthy' | 'warning' | 'critical';
  lastInspection: string | null;
  user_id: number;
  created_at: string;
  updated_at: string | null;
  queen_year?: number;
  frames_count?: number;
}

export interface Inspection {
  id: number;
  hive_id: number;
  notes: string;
  status: 'healthy' | 'warning' | 'critical';
  temperature: number;
  humidity: number;
  weight: number;
  created_at: string;
}

export interface InspectionCreate {
  hive_id: number;
  temperature: number;
  humidity: number;
  weight: number;
  notes: string;
  status: 'healthy' | 'warning' | 'critical';
}

export interface SensorData {
  id: number;
  hiveId: number;
  timestamp: string;
  temperature: number;
  humidity: number;
  weight: number;
  soundLevel: number;
}

export interface Alert {
  id: number;
  hiveId: number;
  sensorId: number;
  alertType: string;
  message: string;
  isResolved: boolean;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
  isRead: boolean;
  userId: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface SensorResponse {
  id: number;
  name: string;
  sensor_type: string;
  hive_id: number;
  is_active: boolean;
  user_id: number;
  created_at: string;
  updated_at: string | null;
}

export interface MeasurementResponse {
  id: number;
  value: number;
  battery_level: number;
  sensor_id: number;
  created_at: string;
  updated_at: string | null;
}

export interface SensorStats {
  sensor_id: number;
  sensor_name: string;
  sensor_type: string;
  last_value: number | null;
  min_value: number | null;
  max_value: number | null;
  avg_value: number | null;
  battery_level: number | null;
  last_measurement_time: string | null;
}

export interface NotificationPreference {
  id?: number;
  type?: 'email' | 'push' | 'sms';
  enabled?: boolean;
  alertTypes?: string[];
  minSeverity?: 'low' | 'medium' | 'high';
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

export interface Notification {
  id: number;
  template_id?: number;
  notification_type: 'email' | 'sms' | 'push';
  priority: 'low' | 'medium' | 'high';
  subject: string;
  body: string;
  message?: string;
  title?: string;
  timestamp: string;
  isRead: boolean;
  is_sent?: boolean;
  sent_at?: string;
  error_message?: string;
  created_at?: string;
  updated_at?: string;
}

export interface NotificationTemplate {
  id: number;
  name: string;
  subject: string;
  body: string;
  notification_type: 'email' | 'sms' | 'push';
  created_at: string;
  updated_at: string | null;
}