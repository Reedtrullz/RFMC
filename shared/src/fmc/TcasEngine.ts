import { FMCState, AircraftState } from '../types/fmc';
import { TCASTarget } from './ndTypes';

export class TcasEngine {
  private targets: TCASTarget[] = [];
  private lastAlertTime: number = 0;

  public update(state: FMCState, dt: number): { targets: TCASTarget[]; alert: boolean } {
    const ac = state.aircraftState;
    if (!ac || (!state.demoMode && !state.tutorialActive)) {
      return { targets: [], alert: false };
    }

    // Generate or update synthetic traffic in demo mode
    if (this.targets.length === 0) {
      this.targets = [
        { id: 'T1', x: 45, y: 30, relativeAltitude: 12, trend: 'climb', threatLevel: 'proximate' },
        { id: 'T2', x: 65, y: 60, relativeAltitude: -5, trend: 'descend', threatLevel: 'traffic' },
        { id: 'T3', x: 50, y: 10, relativeAltitude: 0, trend: 'level', threatLevel: 'other' },
      ];
    }

    // Move targets slowly towards us
    let alert = false;
    this.targets = this.targets.map(t => {
      const dx = (50 - t.x) * 0.01;
      const dy = (50 - t.y) * 0.01;
      const newX = t.x + dx;
      const newY = t.y + dy;
      
      let threatLevel = t.threatLevel;
      const dist = Math.sqrt(Math.pow(50 - newX, 2) + Math.pow(50 - newY, 2));
      
      if (dist < 5) threatLevel = 'resolution';
      else if (dist < 15) threatLevel = 'traffic';
      else if (dist < 30) threatLevel = 'proximate';
      else threatLevel = 'other';

      if (threatLevel === 'traffic' || threatLevel === 'resolution') {
        if (Date.now() - this.lastAlertTime > 5000) {
          alert = true;
          this.lastAlertTime = Date.now();
        }
      }

      return { ...t, x: newX, y: newY, threatLevel };
    });

    return { targets: this.targets, alert };
  }
}
