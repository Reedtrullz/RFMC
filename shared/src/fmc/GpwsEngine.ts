import { FMCState } from '../types/fmc';

export type GpwsAlert =
  | 'NONE'
  | 'SINK_RATE'
  | 'PULL_UP'
  | 'TERRAIN'
  | 'DONT_SINK'
  | 'TOO_LOW_GEAR'
  | 'TOO_LOW_FLAPS'
  | 'GLIDESLOPE'
  | 'WINDSHEAR';

interface GpwsMode5State {
  active: boolean;
  timer: number;
}

// 2-second hold-off before glideslope alert activates (prevents nuisance on initial capture)
const GS_HOLDOFF = 2.0;
const GS_DEVIATION_THRESHOLD = 1.3; // dots

export class GpwsEngine {
  private lastCalloutAlt: number | null = null;
  private alertCooldowns: Record<GpwsAlert, number> = {
    NONE: 0,
    SINK_RATE: 0,
    PULL_UP: 0,
    TERRAIN: 0,
    DONT_SINK: 0,
    TOO_LOW_GEAR: 0,
    TOO_LOW_FLAPS: 0,
    GLIDESLOPE: 0,
    WINDSHEAR: 0,
  };

  // Mode 3 cumulative-altitude-loss tracker
  private mode3PhaseAlt: number | null = null;
  private mode3PhasePeak = 0;
  private mode3LastPhase: string | null = null;

  // Radio-altitude rate tracker (Mode 1B / Mode 2)
  private prevRadioAlt: number | null = null;

  // Mode 5 (Glideslope) hold-off timer
  private mode5: GpwsMode5State = { active: false, timer: 0 };

  // Mode 7 (Windshear) history buffer
  private wsIasHistory: Array<{ t: number; ias: number }> = [];

  public update(state: FMCState, dt: number): { alert: GpwsAlert; callout?: number } {
    const ac = state.aircraftState;
    if (!ac) return { alert: 'NONE' };

    const alt = ac.altitudeFt;
    const vs = ac.verticalSpeedFpm;
    // Mock radio alt — barometric alt below 2500ft, 5000 otherwise
    const radioAlt = alt < 2500 ? alt : 5000;

    // ---- Radio-alt rate (used by Mode 1B / Mode 2) ----
    let radioAltRateFpm = 0;
    if (this.prevRadioAlt !== null && dt > 0) {
      radioAltRateFpm = ((this.prevRadioAlt - radioAlt) / dt) * 60; // ft/s → fpm
    }
    this.prevRadioAlt = radioAlt;

    // ---- Cooldown decay ----
    for (const key in this.alertCooldowns) {
      const k = key as GpwsAlert;
      if (this.alertCooldowns[k] > 0) this.alertCooldowns[k] -= dt;
    }

    let activeAlert: GpwsAlert = 'NONE';

    // ── Mode 1A: Excessive Sink Rate ──────────────────────────────────
    // Trigger: radio alt < 2500ft, VS steeper than RA-based threshold
    if (radioAlt < 2500 && radioAlt > 50) {
      // Threshold becomes stricter as altitude decreases: -1000fpm at 2500ft,
      // ramping to -1750fpm at 500ft (1.5 fpm/ft factor)
      const vsThreshold = -1000 - radioAlt * 1.5;
      if (vs < vsThreshold) {
        activeAlert = radioAlt < 500 ? 'PULL_UP' : 'SINK_RATE';
      }
    }

    // ── Mode 1B: Excessive Terrain Closure Rate ───────────────────────
    // Trigger: radio alt dropping faster than 3000fpm below 2000ft
    // (differentiates from Mode 1A which uses barometric VS; this uses
    //  radio-alt rate indicating terrain rising)
    if (activeAlert === 'NONE' && radioAlt < 2000 && radioAlt > 100) {
      const terrainClosureThreshold = -3000;
      if (radioAltRateFpm < terrainClosureThreshold) {
        activeAlert = radioAlt < 1000 ? 'PULL_UP' : 'TERRAIN';
      }
    }

    // ── Mode 2: Excessive Terrain Closure (non-takeoff) ───────────────
    // Trigger: radio alt dropping faster than 4000fpm in descent
    // outside takeoff/go-around phases.  More conservative than Mode 1B.
    if (activeAlert === 'NONE') {
      const isClimbPhase =
        state.flightPhase === 'TAKEOFF' || state.flightPhase === 'GO_AROUND' || state.flightPhase === 'CLIMB';
      if (!isClimbPhase && radioAlt < 2500 && radioAlt > 100) {
        if (radioAltRateFpm < -4000 && vs < -500) {
          activeAlert = 'TERRAIN';
        }
      }
    }

    // ── Mode 3: Don't Sink (after takeoff / go-around) ────────────────
    // Uses cumulative altitude loss from phase peak to prevent nuisance.
    if (activeAlert === 'NONE') {
      const isProtectedPhase = state.flightPhase === 'TAKEOFF' || state.flightPhase === 'GO_AROUND';
      if (isProtectedPhase && radioAlt < 1000) {
        if (this.mode3LastPhase !== state.flightPhase) {
          this.mode3PhaseAlt = alt;
          this.mode3PhasePeak = alt;
          this.mode3LastPhase = state.flightPhase;
        }
        if (alt > this.mode3PhasePeak) {
          this.mode3PhasePeak = alt;
        }
        const cumulativeLoss = this.mode3PhasePeak - alt;
        const dynamicMargin = Math.max(50, this.mode3PhasePeak * 0.08);
        if (cumulativeLoss > dynamicMargin) {
          activeAlert = 'DONT_SINK';
        }
      } else {
        this.mode3PhaseAlt = null;
        this.mode3PhasePeak = 0;
        this.mode3LastPhase = null;
      }
    }

    // ── Mode 4A: Too Low Terrain — Gear ───────────────────────────────
    // Trigger: descending below 500ft RA with gear up
    if (activeAlert === 'NONE') {
      const gearUp = ac.gearDown === false;
      if (gearUp && radioAlt < 500 && radioAlt > 50 && vs < -100) {
        activeAlert = 'TOO_LOW_GEAR';
      }
    }

    // ── Mode 4B: Too Low Terrain — Flaps ──────────────────────────────
    // Trigger: descending below 200ft RA with flaps not in landing range (< 15°)
    if (activeAlert === 'NONE') {
      const flapsNotInLanding = ac.flapsPosition !== undefined && ac.flapsPosition < 15;
      if (flapsNotInLanding && radioAlt < 200 && radioAlt > 30 && vs < -100) {
        activeAlert = 'TOO_LOW_FLAPS';
      }
    }

    // ── Mode 5: Glideslope Deviation ───────────────────────────────────
    // Trigger: below 1000ft, GS captured, deviation > 1.3 dots, with 2s hold-off
    if (activeAlert === 'NONE') {
      const gsDev = ac.gsDeviation !== undefined ? Math.abs(ac.gsDeviation) : 99;
      if (ac.hasGs && radioAlt < 1000 && radioAlt > 50) {
        if (gsDev > GS_DEVIATION_THRESHOLD) {
          if (this.mode5.active) {
            this.mode5.timer += dt;
            if (this.mode5.timer >= GS_HOLDOFF) {
              activeAlert = 'GLIDESLOPE';
            }
          } else {
            this.mode5.active = true;
            this.mode5.timer = 0;
          }
        } else {
          this.mode5.active = false;
          this.mode5.timer = 0;
        }
      } else {
        this.mode5.active = false;
        this.mode5.timer = 0;
      }
    }

    // ── Mode 7: Windshear ─────────────────────────────────────────────
    // Simplified detection: IAS drop > 15kt over 3-second window at low altitude
    if (activeAlert === 'NONE') {
      this.wsIasHistory.push({ t: radioAlt, ias: ac.ias ?? ac.indicatedAirspeedKt ?? 0 });
      if (this.wsIasHistory.length > 5) this.wsIasHistory.shift();

      if (this.wsIasHistory.length >= 3 && radioAlt < 1500 && radioAlt > 50 && vs < -100) {
        const first = this.wsIasHistory[0].ias;
        const last = this.wsIasHistory[this.wsIasHistory.length - 1].ias;
        const iasDrop = first - last;
        if (iasDrop > 15) {
          activeAlert = 'WINDSHEAR';
        }
      }
    }

    // ── Mode 6: Radio-altitude Callouts ───────────────────────────────
    let callout: number | undefined;
    const calloutThresholds = [2500, 1000, 500, 400, 300, 200, 100, 50, 40, 30, 20, 10];
    for (const c of calloutThresholds) {
      if (this.lastCalloutAlt !== null && this.lastCalloutAlt > c && radioAlt <= c) {
        callout = c;
        break;
      }
    }
    this.lastCalloutAlt = radioAlt;

    // ── Return ────────────────────────────────────────────────────────
    if (activeAlert !== 'NONE' && this.alertCooldowns[activeAlert] <= 0) {
      this.alertCooldowns[activeAlert] = 2.0;
      return { alert: activeAlert, callout };
    }

    return { alert: 'NONE', callout };
  }
}
