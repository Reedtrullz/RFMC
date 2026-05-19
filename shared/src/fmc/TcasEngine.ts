import { FMCState } from '../types/fmc';
import { TCASTarget } from './ndTypes';

export class TcasEngine {
  private targets: TCASTarget[] = [];
  private alertCooldowns = new Map<string, number>();

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

    // Update alert cooldowns Map
    for (const [id, cooldown] of this.alertCooldowns.entries()) {
      if (cooldown <= dt) {
        this.alertCooldowns.delete(id);
      } else {
        this.alertCooldowns.set(id, cooldown - dt);
      }
    }

    const isCentered = state.efisL?.centered ?? true;
    const maxVisualDist = isCentered ? 34 : 68;
    const rangeNm = state.efisL?.range ?? 40;
    const tcasMode = state.efisL?.tcasMode ?? 'NORMAL';

    let alert = false;
    this.targets = this.targets.map((t) => {
      // Move targets slowly towards us (aircraft is at x=50, y=50)
      const dx = (50 - t.x) * 0.01;
      const dy = (50 - t.y) * 0.01;
      const newX = t.x + dx;
      const newY = t.y + dy;

      // Normalize screen coordinates into real physical NM
      const dxScreen = newX - 50;
      const dyScreen = newY - 50;
      const distScreen = Math.sqrt(dxScreen * dxScreen + dyScreen * dyScreen);
      const distNm = (distScreen / maxVisualDist) * rangeNm;

      // Vertical separation bounds check based on active mode
      const relAltFt = t.relativeAltitude * 100;
      let withinVerticalEnvelope = false;

      if (tcasMode === 'ABOVE') {
        withinVerticalEnvelope = relAltFt >= -2700 && relAltFt <= 9000;
      } else if (tcasMode === 'BELOW') {
        withinVerticalEnvelope = relAltFt >= -9000 && relAltFt <= 2700;
      } else {
        withinVerticalEnvelope = relAltFt >= -2700 && relAltFt <= 2700;
      }

      let threatLevel: TCASTarget['threatLevel'] = 'other';
      if (withinVerticalEnvelope) {
        if (distNm < 1.5) {
          threatLevel = 'resolution';
        } else if (distNm < 3.0) {
          threatLevel = 'traffic';
        } else if (distNm < 6.0) {
          threatLevel = 'proximate';
        }
      }

      // Check alert conditions and cooldowns
      if (threatLevel === 'traffic' || threatLevel === 'resolution') {
        const activeCooldown = this.alertCooldowns.get(t.id) ?? 0;
        if (activeCooldown <= 0) {
          alert = true;
          this.alertCooldowns.set(t.id, 5.0); // 5 seconds cooldown
        }
      }

      return { ...t, x: newX, y: newY, threatLevel };
    });

    return { targets: this.targets, alert };
  }
}
