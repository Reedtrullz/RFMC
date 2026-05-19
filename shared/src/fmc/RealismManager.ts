import { FMCState, NavSensor } from '../types/fmc';

export type RealismMode = 'ASSISTED' | 'TRAINING' | 'LINE' | 'FAILURE';

export class RealismManager {
  private mode: RealismMode = 'TRAINING';

  constructor(mode: RealismMode = 'TRAINING') {
    this.mode = mode;
  }

  /**
   * Applies realism effects to the navigation sensors.
   */
  public applySensorEffects(sensors: NavSensor[]): NavSensor[] {
    if (this.mode === 'LINE' || this.mode === 'FAILURE') {
      return sensors.map((s) => {
        if (s.source === 'IRS') {
          // Add random drift in LINE/FAILURE mode
          return { ...s, positionErrorNm: s.positionErrorNm + Math.random() * 0.001 };
        }
        return s;
      });
    }
    return sensors;
  }

  /**
   * Checks if UI highlights should be shown.
   */
  public shouldShowHighlights(): boolean {
    return this.mode === 'ASSISTED' || this.mode === 'TRAINING';
  }

  /**
   * Simulates a random failure if in FAILURE mode.
   */
  public triggerRandomFailure(state: FMCState): Partial<FMCState> | null {
    if (this.mode !== 'FAILURE') return null;

    const roll = Math.random();
    if (roll < 0.01) {
      return { failureMessage: 'GPS 1 FAILURE' };
    } else if (roll < 0.02) {
      return { failureMessage: 'IRS DRIFT EXCESSIVE' };
    }
    return null;
  }

  public setMode(mode: RealismMode): void {
    this.mode = mode;
  }

  public getMode(): RealismMode {
    return this.mode;
  }
}
