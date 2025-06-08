// frontend/src/stores/HiveStore.ts
import { makeAutoObservable, action, runInAction } from 'mobx';
import type { Inspection } from '../types/stores';
import { hiveApi } from '../api/requests';
import { getErrorMessage } from '../utils/errorUtils';

interface Hive {
  id: number;
  name: string;
  location: string;
  status: 'healthy' | 'warning' | 'critical';
  lastInspection: string | null;
  user_id: number;
  created_at: string;
  updated_at: string | null;
  queen_year: number;
  frames_count: number;
}

// Remove local Inspection interface, use global type

// Add type for creating inspection
export interface InspectionCreate {
  temperature: number;
  humidity: number;
  weight: number;
  notes: string;
  status: 'healthy' | 'warning' | 'critical';
}

export class HiveStore {
  hives: Hive[] = [];
  selectedHive: Hive | null = null;
  inspections: Inspection[] = [];
  loading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  @action
  setLoading(loading: boolean) {
    this.loading = loading;
  }

  @action
  setError(error: unknown) {
    if (error === null) {
      this.error = null;
    } else {
      this.error = getErrorMessage(error);
    }
  }

  // Fetch all hives
  fetchHives = async () => {
    try {
      this.setLoading(true);
      this.setError(null);
      const response = await hiveApi.get<Hive[]>('hives/');
      runInAction(() => {
        this.hives = response.data;
      });
    } catch (error) {
      console.error('Failed to fetch hives:', error);
      this.setError(error);
    } finally {
      this.setLoading(false);
    }
  };

  // Fetch a specific hive by ID
  fetchHiveById = async (id: number) => {
    try {
      this.setLoading(true);
      this.setError(null);
      const response = await hiveApi.get<Hive>(`hives/${id}`);
      runInAction(() => {
        this.selectedHive = response.data;
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch hive ${id}:`, error);
      this.setError(error);
      return null;
    } finally {
      this.setLoading(false);
    }
  };

  // Create a new hive
  createHive = async (hiveData: Partial<Hive>) => {
    try {
      this.setLoading(true);
      this.setError(null);
      const response = await hiveApi.post<Hive>('hives/', hiveData);
      runInAction(() => {
        this.hives.push(response.data);
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create hive:', error);
      this.setError(error);
      return null;
    } finally {
      this.setLoading(false);
    }
  };

  // Update hive
  updateHive = async (id: number, hiveData: Partial<Hive>) => {
    try {
      this.setLoading(true);
      this.setError(null);
      const response = await hiveApi.put<Hive>(`/hives/${id}`, hiveData);
      runInAction(() => {
        const index = this.hives.findIndex(h => h.id === id);
        if (index !== -1) {
          this.hives[index] = response.data;
        }
        if (this.selectedHive?.id === id) {
          this.selectedHive = response.data;
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to update hive ${id}:`, error);
      this.setError(error);
      return null;
    } finally {
      this.setLoading(false);
    }
  };

  // Delete hive
  deleteHive = async (id: number) => {
    try {
      this.setLoading(true);
      this.setError(null);
      await hiveApi.delete(`/hives/${id}`);
      runInAction(() => {
        this.hives = this.hives.filter(h => h.id !== id);
        if (this.selectedHive?.id === id) {
          this.selectedHive = null;
        }
      });
      return true;
    } catch (error) {
      console.error(`Failed to delete hive ${id}:`, error);
      this.setError(error);
      return false;
    } finally {
      this.setLoading(false);
    }
  };

  // Fetch hive inspections
  fetchHiveInspections = async (hiveId: number) => {
    try {
      this.setLoading(true);
      this.setError(null);
      const response = await hiveApi.get<Inspection[]>(`/hives/${hiveId}/inspections/`); // исправлен путь
      runInAction(() => {
        this.inspections = response.data;
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch inspections for hive ${hiveId}:`, error);
      this.setError(error);
      return [];
    } finally {
      this.setLoading(false);
    }
  };

  // Add new inspection
  createInspection = async (hiveId: number, inspectionData: Omit<InspectionCreate, 'hive_id'>) => {
    try {
      this.setLoading(true);
      this.setError(null);
      // Формируем корректный snake_case объект
      const payload = { ...inspectionData, hive_id: hiveId };
      const response = await hiveApi.post<Inspection>(
        `/inspections/`,
        payload
      );
      runInAction(() => {
        this.inspections.push(response.data);
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create inspection:', error);
      this.setError(error);
      return null;
    } finally {
      this.setLoading(false);
    }
  };
}