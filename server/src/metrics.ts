/**
 * Basic application metrics tracking
 */
export class MetricsRegistry {
  private activeClients = 0;
  private totalConnections = 0;
  private validationErrors = 0;
  private simErrors = 0;
  private startTime = Date.now();

  clientConnected() {
    this.activeClients++;
    this.totalConnections++;
  }

  clientDisconnected() {
    this.activeClients = Math.max(0, this.activeClients - 1);
  }

  validationError() {
    this.validationErrors++;
  }

  simError() {
    this.simErrors++;
  }

  getMetrics() {
    return {
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      activeClients: this.activeClients,
      totalConnections: this.totalConnections,
      validationErrors: this.validationErrors,
      simErrors: this.simErrors,
      version: process.env.APP_VERSION || '0.1.0',
    };
  }
}

export const metrics = new MetricsRegistry();
