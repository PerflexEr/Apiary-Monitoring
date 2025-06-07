import { AuthStore } from './AuthStore';
import { HiveStore } from './HiveStore';
import { MonitoringStore } from './MonitoringStore';
import { NotificationStore } from './NotificationStore';

export class RootStore {
  authStore: AuthStore;
  hiveStore: HiveStore;
  monitoringStore: MonitoringStore;
  notificationStore: NotificationStore;

  constructor() {
    this.authStore = new AuthStore(this);
    this.hiveStore = new HiveStore(this);
    this.monitoringStore = new MonitoringStore(this);
    this.notificationStore = new NotificationStore(this);
  }
}

export const rootStore = new RootStore(); 