export class AuralAlertService {
  private static context: AudioContext | null = null;

  private static init() {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  public static playChime() {
    this.init();
    if (!this.context) return;

    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, this.context.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(440, this.context.currentTime + 0.5); // A4

    gain.gain.setValueAtTime(0.2, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(this.context.destination);

    osc.start();
    osc.stop(this.context.currentTime + 0.5);
  }

  public static playTripleClick() {
    this.init();
    if (!this.context) return;
    for (let i = 0; i < 3; i++) {
       this.playPulse(1200, 0.05, this.context.currentTime + i * 0.12);
    }
  }

  public static playCavalryCharge() {
    this.init();
    if (!this.context) return;
    // Classic Boeing AP disconnect wailer
    for (let i = 0; i < 10; i++) {
      const t = this.context.currentTime + i * 0.2;
      this.playPulse(880, 0.1, t);
      this.playPulse(1100, 0.1, t + 0.1);
    }
  }

  private static playPulse(freq: number, duration: number, time: number) {
    if (!this.context) return;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(0.15, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
    osc.connect(gain);
    gain.connect(this.context.destination);
    osc.start(time);
    osc.stop(time + duration);
  }
}

