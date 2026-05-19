import { getAudioContext } from '../services/audioContext';
import { devWarn } from '@shared';

/**
 * Synthesizes a subtle tactile 'click' sound and triggers device vibration.
 */
class TactileEngine {
  private audioCtx: AudioContext | null = null;

  private initAudio() {
    if (!this.audioCtx) {
      this.audioCtx = getAudioContext();
    }
  }

  public playClick() {
    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, this.audioCtx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.1);
    } catch (e) {
      devWarn('Audio feedback failed', e);
    }
  }

  public vibrate(ms = 10) {
    if ('vibrate' in navigator) {
      navigator.vibrate(ms);
    }
  }

  public feedback() {
    this.playClick();
    this.vibrate();
  }
}

export const tactile = new TactileEngine();
