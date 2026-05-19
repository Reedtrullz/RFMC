export type TrainingEventType =
  | 'PAGE_OPENED'
  | 'DATA_ENTERED'
  | 'INVALID_ENTRY'
  | 'MODE_CHANGED'
  | 'ALERT_TRIGGERED'
  | 'ALERT_CLEARED'
  | 'CHECKLIST_ITEM_COMPLETED'
  | 'PHASE_CHANGED'
  | 'DISCONTINUITY_REACHED';

export interface TrainingEvent {
  timestamp: number;
  eventType: TrainingEventType;
  detail: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

export interface ScenarioScore {
  completed: boolean;
  errors: number;
  hintsUsed: number;
  timeToCompleteSec: number;
  criticalFailures: string[];
  recommendations: string[];
  totalScore: number; // 0-100
}

export class DebriefSystem {
  private events: TrainingEvent[] = [];
  private startTime: number = Date.now();

  public logEvent(type: TrainingEventType, detail: string, severity: 'INFO' | 'WARNING' | 'CRITICAL' = 'INFO'): void {
    this.events.push({
      timestamp: Date.now(),
      eventType: type,
      detail,
      severity,
    });
  }

  public generateScore(): ScenarioScore {
    const criticalFailures = this.events.filter((e) => e.severity === 'CRITICAL').map((e) => e.detail);

    const errors = this.events.filter((e) => e.severity === 'WARNING').length;
    const duration = (Date.now() - this.startTime) / 1000;

    let totalScore = 100;
    totalScore -= criticalFailures.length * 50;
    totalScore -= errors * 10;
    totalScore = Math.max(0, totalScore);

    const recommendations: string[] = [];
    if (criticalFailures.length > 0) recommendations.push('Review critical failure items immediately.');
    if (errors > 3) recommendations.push('Try to minimize manual data entry errors.');

    return {
      completed: criticalFailures.length === 0,
      errors,
      hintsUsed: 0, // Placeholder
      timeToCompleteSec: duration,
      criticalFailures,
      recommendations,
      totalScore,
    };
  }

  public getEvents(): TrainingEvent[] {
    return [...this.events];
  }

  public reset(startTime = Date.now()): void {
    this.events = [];
    this.startTime = startTime;
  }
}
