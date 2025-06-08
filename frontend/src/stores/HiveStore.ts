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

  // Utility to get the latest inspection status for a hive
  getLatestInspectionStatus(hiveId: number): 'healthy' | 'warning' | 'critical' | undefined {
    const inspections = this.inspections.filter(i => i.hive_id === hiveId);
    if (inspections.length === 0) return undefined;
    // Sort by created_at descending
    const sorted = inspections.slice().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return sorted[0].status;
  }

  // Fetch all hives
  fetchHives = async () => {
    try {
      this.setLoading(true);
      this.setError(null);
      const response = await hiveApi.get<Hive[]>('hives/');
      runInAction(() => {
        this.hives = response.data;
        // After loading hives, fetch all inspections for all hives and update their status
        this.updateAllHivesStatusByInspections();
      });
    } catch (error) {
      console.error('Failed to fetch hives:', error);
      this.setError(error);
    } finally {
      this.setLoading(false);
    }
  };

  // Fetch all inspections for all hives and update their status
  updateAllHivesStatusByInspections = async () => {
    try {
      const allInspections: Inspection[] = [];
      for (const hive of this.hives) {
        const response = await hiveApi.get<Inspection[]>(`/hives/${hive.id}/inspections/`);
        allInspections.push(...response.data);
      }
      runInAction(() => {
        this.inspections = allInspections;
        this.hives = this.hives.map(hive => {
          const latestStatus = this.getLatestInspectionStatus(hive.id);
          return latestStatus ? { ...hive, status: latestStatus } : hive;
        });
      });
    } catch (error) {
      console.error('Failed to update hive statuses by inspections:', error);
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
      const response = await hiveApi.get<Inspection[]>(`/hives/${hiveId}/inspections/`);
      runInAction(() => {
        this.inspections = response.data;
        // Update hive status if possible
        const latestStatus = this.getLatestInspectionStatus(hiveId);
        const hiveIdx = this.hives.findIndex(h => h.id === hiveId);
        if (hiveIdx !== -1 && latestStatus) {
          this.hives[hiveIdx].status = latestStatus;
        }
        if (this.selectedHive && this.selectedHive.id === hiveId && latestStatus) {
          this.selectedHive.status = latestStatus;
        }
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
      const payload = { ...inspectionData, hive_id: hiveId };
      const response = await hiveApi.post<Inspection>(
        `/inspections/`,
        payload
      );
      runInAction(() => {
        this.inspections.push(response.data);
        // Update hive status immediately after new inspection
        const latestStatus = this.getLatestInspectionStatus(hiveId);
        const hiveIdx = this.hives.findIndex(h => h.id === hiveId);
        if (hiveIdx !== -1 && latestStatus) {
          this.hives[hiveIdx].status = latestStatus;
        }
        if (this.selectedHive && this.selectedHive.id === hiveId && latestStatus) {
          this.selectedHive.status = latestStatus;
        }
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