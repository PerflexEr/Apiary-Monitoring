// frontend/src/types/api.ts
export interface User {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  is_superuser: boolean;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface ApiError {
  detail?: string | string[];
  message?: string;
  status_code?: number;
}

export interface Hive {
  id: number;
  name: string;
  location: string;
  status: 'healthy' | 'warning' | 'critical';
  queen_year: number;
  frames_count: number;
  description?: string | null;
  user_id: number;
  created_at: string;
  updated_at: string | null;
}

export interface SensorData {
  id: number;
  hive_id: number;
  temperature: number;
  humidity: number;
  weight: number;
  timestamp: string;
}

export interface Alert {
  id: number;
  hive_id: number;
  type: 'temperature' | 'humidity' | 'weight' | 'other';
  severity: 'low' | 'medium' | 'high';
  message: string;
  created_at: string;
  resolved_at: string | null;
}