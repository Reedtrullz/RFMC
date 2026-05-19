import { FlightDeckAlert, AlertLevel } from '@shared';

export class AlertBus {
  private static instance: AlertBus;
  private alerts: FlightDeckAlert[] = [];
  private listeners: ((alerts: FlightDeckAlert[]) => void)[] = [];

  private constructor() {}

  static getInstance(): AlertBus {
    if (!AlertBus.instance) {
      AlertBus.instance = new AlertBus();
    }
    return AlertBus.instance;
  }

  addAlert(alert: Omit<FlightDeckAlert, 'timestamp'>) {
    const fullAlert: FlightDeckAlert = {
      ...alert,
      timestamp: Date.now(),
    };

    // Remove existing alert with same ID if present
    this.alerts = this.alerts.filter((a) => a.id !== alert.id);

    this.alerts.push(fullAlert);
    this.sortAndNotify();
  }

  removeAlert(id: string) {
    this.alerts = this.alerts.filter((a) => a.id !== id);
    this.sortAndNotify();
  }

  getAlerts(): FlightDeckAlert[] {
    return [...this.alerts];
  }

  subscribe(listener: (alerts: FlightDeckAlert[]) => void) {
    this.listeners.push(listener);
    listener(this.getAlerts());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private sortAndNotify() {
    const priority: Record<AlertLevel, number> = {
      WARNING: 0,
      CAUTION: 1,
      ADVISORY: 2,
      STATUS: 3,
    };

    this.alerts.sort((a, b) => {
      if (priority[a.level] !== priority[b.level]) {
        return priority[a.level] - priority[b.level];
      }
      return b.timestamp - a.timestamp;
    });

    this.listeners.forEach((l) => l(this.getAlerts()));
  }
}

export const alertBus = AlertBus.getInstance();
