import { FMCState, AircraftState } from '../types/fmc';

export type GpwsAlert = 'NONE' | 'SINK_RATE' | 'PULL_UP' | 'TERRAIN' | 'DONT_SINK' | 'TOO_LOW_GEAR' | 'TOO_LOW_FLAPS' | 'GLIDESLOPE' | 'WINDSHEAR';

export class GpwsEngine {
  private lastAlert: GpwsAlert = 'NONE';
  private lastCalloutAlt: number | null = null;
  private alertCooldowns: Record<GpwsAlert, number> = {
    NONE: 0, SINK_RATE: 0, PULL_UP: 0, TERRAIN: 0, DONT_SINK: 0,
    TOO_LOW_GEAR: 0, TOO_LOW_FLAPS: 0, GLIDESLOPE: 0, WINDSHEAR: 0
  };

  // Cumulative altitude loss tracking for Mode 3 (Don't Sink)
  private mode3PhaseAlt: number | null = null;
  private mode3PhasePeak: number = 0;
  private mode3LastPhase: string | null = null;

  public update(state: FMCState, dt: number): { alert: GpwsAlert; callout?: number } {
    const ac = state.aircraftState;
    if (!ac) return { alert: 'NONE' };

    const alt = ac.altitudeFt;
    const vs = ac.verticalSpeedFpm;
    const radioAlt = ac.altitudeFt < 2500 ? ac.altitudeFt : 5000; // Mock radio alt
    
    let activeAlert: GpwsAlert = 'NONE';

    // 1. Sink Rate (Mode 1)
    if (radioAlt < 2500 && radioAlt > 50) {
      const vsThreshold = -1000 - (radioAlt * 1.5); // Stricter as we get lower
      if (vs < vsThreshold) {
        activeAlert = radioAlt < 500 ? 'PULL_UP' : 'SINK_RATE';
      }
    }

    // 2. Don't Sink (Mode 3 - After takeoff / go-around)
    // Uses cumulative altitude loss rather than instantaneous VS to prevent nuisance alerts
    const isProtectedPhase = state.flightPhase === 'TAKEOFF' || state.flightPhase === 'GO_AROUND';
    if (isProtectedPhase && radioAlt < 1000) {
      // Track phase transitions to reset peak tracking
      if (this.mode3LastPhase !== state.flightPhase) {
        this.mode3PhaseAlt = alt;
        this.mode3PhasePeak = alt;
        this.mode3LastPhase = state.flightPhase;
      }

      // Track peak altitude since phase start
      if (alt > this.mode3PhasePeak) {
        this.mode3PhasePeak = alt;
      }

      // Calculate cumulative altitude loss from peak
      const cumulativeLossFromPeak = this.mode3PhasePeak - alt;
      const dynamicMargin = Math.max(50, this.mode3PhasePeak * 0.08); // 8% of peak or 50ft minimum

      if (cumulativeLossFromPeak > dynamicMargin) {
        activeAlert = 'DONT_SINK';
      }
    } else {
      // Reset tracking when not in a protected phase
      this.mode3PhaseAlt = null;
      this.mode3PhasePeak = 0;
      this.mode3LastPhase = null;
    }

    // 3. Callouts (Mode 6)
    let callout: number | undefined;
    const callouts = [2500, 1000, 500, 400, 300, 200, 100, 50, 40, 30, 20, 10];
    for (const c of callouts) {
      if (this.lastCalloutAlt !== null && this.lastCalloutAlt > c && radioAlt <= c) {
        callout = c;
        break;
      }
    }
    this.lastCalloutAlt = radioAlt;

    // Cooldown logic to prevent chatter
    for (const key in this.alertCooldowns) {
      const k = key as GpwsAlert;
      if (this.alertCooldowns[k] > 0) this.alertCooldowns[k] -= dt;
    }

    if (activeAlert !== 'NONE') {
      if (this.alertCooldowns[activeAlert] <= 0) {
        this.alertCooldowns[activeAlert] = 2.0; // 2s cooldown
        return { alert: activeAlert, callout };
      }
    }

    return { alert: 'NONE', callout };
  }
}
