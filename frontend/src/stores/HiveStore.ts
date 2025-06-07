// frontend/src/stores/HiveStore.ts
import { makeAutoObservable, action, runInAction } from 'mobx';
import type { RootStore } from './RootStore';
import { hivesApi } from '../api/requests';
import { getErrorMessage } from '../utils/errorUtils';

interface Hive {
  id: number;
  name: string;
  location: string;
  status: 'good' | 'warning' | 'critical';
  lastInspection: string | null;
  user_id: number;
  created_at: string;
  updated_at: string | null;
}

interface Inspection {
  id: number;
  hiveId: number;
  date: string;
  notes: string;
  health: 'good' | 'warning' | 'critical';
}

export class HiveStore {
  hives: Hive[] = [];
  selectedHive: Hive | null = null;
  inspections: Inspection[] = [];
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
    // Гарантируем, что error всегда строка или null
    if (error && typeof error !== 'string') {
      this.error = getErrorMessage(error);
    } else {
      this.error = error;
    }
  }

  @action
  setHives(hives: Hive[]) {
    this.hives = hives;
  }

  @action
  setInspections(inspections: Inspection[]) {
    this.inspections = inspections;
  }

  fetchHives = async () => {
    try {
      this.setLoading(true);
      this.setError(null);

      console.log('Fetching hives...');
      const response = await hivesApi.get<Hive[]>('/');

      runInAction(() => {
        this.setHives(response.data);
        console.log('Hives fetched successfully:', response.data);
      });
    } catch (error: any) {
      console.error('Error fetching hives:', error);
      runInAction(() => {
        this.setError(getErrorMessage(error, 'Failed to fetch hives'));
      });
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  };

  fetchHiveInspections = async (hiveId: number) => {
    try {
      this.setLoading(true);
      this.setError(null);

      console.log(`Fetching inspections for hive ${hiveId}...`);
      const response = await hivesApi.get<Inspection[]>(`/${hiveId}/inspections`);

      runInAction(() => {
        this.setInspections(response.data);
        console.log('Inspections fetched successfully:', response.data);
      });
    } catch (error: any) {
      console.error('Error fetching inspections:', error);
      runInAction(() => {
        this.setError(getErrorMessage(error, 'Failed to fetch inspections'));
      });
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  };

  addInspection = async (hiveId: number, inspection: Omit<Inspection, 'id' | 'hiveId'>) => {
    try {
      this.setLoading(true);
      this.setError(null);

      console.log(`Adding inspection for hive ${hiveId}:`, inspection);
      const response = await hivesApi.post<Inspection>(`/${hiveId}/inspections`, inspection);

      runInAction(() => {
        this.inspections.push(response.data);
        console.log('Inspection added successfully:', response.data);
      });
    } catch (error: any) {
      console.error('Error adding inspection:', error);
      runInAction(() => {
        this.setError(getErrorMessage(error, 'Failed to add inspection'));
      });
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  };

  @action
  setSelectedHive = (hive: Hive | null) => {
    this.selectedHive = hive;
    if (hive) {
      this.fetchHiveInspections(hive.id);
    }
  };

  createHive = async (hiveData: { name: string; location: string; queen_year: number; frames_count: number }) => {
    try {
      this.setLoading(true);
      this.setError(null);

      console.log('Creating new hive:', hiveData);
      const response = await hivesApi.post<Hive>('/', hiveData);

      runInAction(() => {
        this.hives.push(response.data);
        console.log('Hive created successfully:', response.data);
      });

      return response.data;
    } catch (error: any) {
      console.error('Error creating hive:', error);
      runInAction(() => {
        this.setError(getErrorMessage(error, 'Failed to create hive'));
      });
      throw error;
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  };

  deleteHive = async (hiveId: number) => {
    try {
      this.setLoading(true);
      this.setError(null);

      console.log(`Deleting hive ${hiveId}...`);
      await hivesApi.delete(`/${hiveId}`);

      runInAction(() => {
        this.hives = this.hives.filter(hive => hive.id !== hiveId);
        if (this.selectedHive?.id === hiveId) {
          this.selectedHive = null;
        }
        console.log('Hive deleted successfully');
      });
    } catch (error: any) {
      console.error('Error deleting hive:', error);
      runInAction(() => {
        this.setError(getErrorMessage(error, 'Failed to delete hive'));
      });
      throw error;
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  };
}