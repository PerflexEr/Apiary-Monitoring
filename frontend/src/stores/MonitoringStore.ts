// frontend/src/stores/MonitoringStore.ts
import { makeAutoObservable, action, runInAction } from 'mobx';
import { RootStore } from './RootStore';
import { monitoringApi } from '../api/requests';
import type { SensorStats } from '../types/stores';

interface SensorData {
  id: number;
  hiveId: number;
  timestamp: string;
  temperature: number;
  humidity: number;
  weight: number;
  soundLevel: number;
}

interface Alert {
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

interface SensorResponse {
  id: number;
  name: string;
  sensor_type: string;
  hive_id: number;
  is_active: boolean;
  user_id: number;
  created_at: string;
  updated_at: string | null;
}

interface MeasurementResponse {
  id: number;
  value: number;
  battery_level: number;
  sensor_id: number;
  created_at: string;
  updated_at: string | null;
}

export class MonitoringStore {
  sensorData: Record<number, SensorData[]> = {};
  alerts: Alert[] = [];
  sensors: SensorResponse[] = [];
  measurements: MeasurementResponse[] = [];
  loading = false;
  error: string | null = null;

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
  setAlerts(alerts: Alert[]) {
    this.alerts = alerts;
  }

  @action
  setSensors(sensors: SensorResponse[]) {
    this.sensors = sensors;
  }

  @action
  setMeasurements(measurements: MeasurementResponse[]) {
    this.measurements = measurements;
  }

  fetchSensors = async () => {
    try {
      this.setLoading(true);
      this.setError(null);

      console.log('Fetching sensors...');
      const response = await monitoringApi.get<SensorResponse[]>('/sensors/');

      runInAction(() => {
        this.setSensors(response.data);
        console.log('Sensors fetched successfully:', response.data);
      });
    } catch (error: any) {
      console.error('Error fetching sensors:', error);
      runInAction(() => {
        this.setError(error.message || 'Failed to fetch sensors');
      });
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  };

  fetchHiveSensors = async (hiveId: number) => {
    try {
      this.setLoading(true);
      this.setError(null);

      console.log(`Fetching sensors for hive ${hiveId}...`);
      const response = await monitoringApi.get<SensorResponse[]>(`/hives/${hiveId}/sensors/`);

      runInAction(() => {
        this.setSensors(response.data);
        console.log('Hive sensors fetched successfully:', response.data);
      });
    } catch (error: any) {
      console.error('Error fetching hive sensors:', error);
      runInAction(() => {
        this.setError(error.message || 'Failed to fetch hive sensors');
      });
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  };

  fetchSensorMeasurements = async (sensorId: number, startDate?: Date, endDate?: Date, limit: number = 100) => {
    try {
      this.setLoading(true);
      this.setError(null);

      const params: any = { limit };
      if (startDate) params.start_date = startDate.toISOString();
      if (endDate) params.end_date = endDate.toISOString();

      console.log(`Fetching measurements for sensor ${sensorId}...`);
      const response = await monitoringApi.get<MeasurementResponse[]>(`/sensors/${sensorId}/measurements/`, { params });

      runInAction(() => {
        this.setMeasurements(response.data);
        console.log('Sensor measurements fetched successfully:', response.data);
      });
    } catch (error: any) {
      console.error('Error fetching sensor measurements:', error);
      runInAction(() => {
        this.setError(error.message || 'Failed to fetch sensor measurements');
      });
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  };

  fetchAlerts = async (hiveId?: number, sensorId?: number) => {
    try {
      this.setLoading(true);
      this.setError(null);

      const params: any = {};
      if (hiveId) params.hive_id = hiveId;
      if (sensorId) params.sensor_id = sensorId;

      console.log('Fetching alerts...', params);
      const response = await monitoringApi.get<any[]>('/alerts/', { params });

      // Адаптируем структуру данных под наш интерфейс
      const adaptedAlerts: Alert[] = response.data.map(alert => ({
        id: alert.id,
        hiveId: alert.hive_id,
        sensorId: alert.sensor_id,
        alertType: alert.alert_type,
        message: alert.message,
        isResolved: alert.is_resolved || false,
        severity: 'warning' as const, // Устанавливаем дефолтное значение
        timestamp: alert.created_at,
        isRead: false, // Устанавливаем дефолтное значение
        userId: alert.user_id,
        createdAt: alert.created_at,
        updatedAt: alert.updated_at
      }));

      runInAction(() => {
        this.setAlerts(adaptedAlerts);
        console.log('Alerts fetched successfully:', adaptedAlerts);
      });
    } catch (error: any) {
      console.error('Error fetching alerts:', error);
      runInAction(() => {
        this.setError(error.message || 'Failed to fetch alerts');
      });
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  };

  resolveAlert = async (alertId: number) => {
    try {
      this.setLoading(true);
      this.setError(null);

      console.log(`Resolving alert ${alertId}...`);
      const response = await monitoringApi.put(`/alerts/${alertId}/resolve/`);

      runInAction(() => {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
          alert.isResolved = true;
        }
        console.log('Alert resolved successfully:', response.data);
      });
    } catch (error: any) {
      console.error('Error resolving alert:', error);
      runInAction(() => {
        this.setError(error.message || 'Failed to resolve alert');
      });
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  };

  markAlertAsRead = async (alertId: number) => {
    try {
      // Поскольку в API нет эндпоинта для отметки как прочитанное,
      // просто обновляем локально
      runInAction(() => {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
          alert.isRead = true;
        }
      });
    } catch (error: any) {
      console.error('Error marking alert as read:', error);
      runInAction(() => {
        this.setError(error.message || 'Failed to mark alert as read');
      });
    }
  };

  createSensor = async (sensorData: Omit<SensorResponse, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      this.setLoading(true);
      this.setError(null);
      const response = await monitoringApi.post<SensorResponse>('/sensors/', sensorData);
      runInAction(() => {
        this.sensors.push(response.data);
      });
      return response.data;
    } catch (error: any) {
      console.error('Error creating sensor:', error);
      runInAction(() => {
        this.setError(error.message || 'Failed to create sensor');
      });
      return null;
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  };

  updateSensor = async (sensorId: number, sensorData: Partial<SensorResponse>) => {
    try {
      this.setLoading(true);
      this.setError(null);
      const response = await monitoringApi.put<SensorResponse>(`/sensors/${sensorId}/`, sensorData);
      runInAction(() => {
        const idx = this.sensors.findIndex(s => s.id === sensorId);
        if (idx !== -1) this.sensors[idx] = response.data;
      });
      return response.data;
    } catch (error: any) {
      console.error('Error updating sensor:', error);
      runInAction(() => {
        this.setError(error.message || 'Failed to update sensor');
      });
      return null;
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  };

  deleteSensor = async (sensorId: number) => {
    try {
      this.setLoading(true);
      this.setError(null);
      await monitoringApi.delete(`/sensors/${sensorId}/`);
      runInAction(() => {
        this.sensors = this.sensors.filter(s => s.id !== sensorId);
      });
      return true;
    } catch (error: any) {
      console.error('Error deleting sensor:', error);
      runInAction(() => {
        this.setError(error.message || 'Failed to delete sensor');
      });
      return false;
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  };

  selectedSensor: SensorResponse | null = null;
  selectSensor = (sensorId: number) => {
    this.selectedSensor = this.sensors.find(s => s.id === sensorId) || null;
  };

  // Вспомогательные методы для получения данных
  getLatestSensorData = (hiveId: number): SensorData | null => {
    const data = this.sensorData[hiveId];
    return data ? data[data.length - 1] : null;
  };

  getSensorsByHive = (hiveId: number): SensorResponse[] => {
    return this.sensors.filter(sensor => sensor.hive_id === hiveId);
  };

  getAlertsByHive = (hiveId: number): Alert[] => {
    return this.alerts.filter(alert => alert.hiveId === hiveId);
  };

  getUnresolvedAlerts = (): Alert[] => {
    return this.alerts.filter(alert => !alert.isResolved);
  };

  fetchSensorStats = async (sensorId: number): Promise<SensorStats | null> => {
    try {
      this.setLoading(true);
      this.setError(null);
      const response = await monitoringApi.get<SensorStats>(`/sensors/${sensorId}/stats/`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching sensor stats:', error);
      runInAction(() => {
        this.setError(error.message || 'Failed to fetch sensor stats');
      });
      return null;
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  };
}