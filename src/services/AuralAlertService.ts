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
    // Classic AP disconnect wailer
    for (let i = 0; i < 10; i++) {
      const t = this.context.currentTime + i * 0.2;
      this.playPulse(880, 0.1, t);
      this.playPulse(1100, 0.1, t + 0.1);
    }
  }

  public static playSingleChime() {
    this.init();
    if (!this.context) return;
    // Airbus Master Caution (Ding!)
    const t = this.context.currentTime;
    this.playPulse(550, 0.8, t);
  }

  public static playContinuousChime(durationSec: number = 3) {
    this.init();
    if (!this.context) return;
    // Airbus Master Warning (Ding-ding-ding...)
    for (let i = 0; i < durationSec * 2; i++) {
      this.playPulse(550, 0.4, this.context.currentTime + i * 0.5);
    }
  }

  public static playVoice(text: string, rate: number = 1.0) {
    if (!window.speechSynthesis) return;
    
    // Cancel any ongoing speech to prioritize new alerts
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 0.8; // Deeper, more "cockpit" voice
    utterance.volume = 1.0;
    
    // Select a male voice if available
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.name.toLowerCase().includes('male')) || voices[0];
    if (voice) utterance.voice = voice;

    window.speechSynthesis.speak(utterance);
  }

  public static playTerrain() {
    this.playVoice("TERRAIN, TERRAIN", 1.2);
  }

  public static playPullUp() {
    this.playVoice("PULL UP, PULL UP", 1.3);
  }

  public static playSinkRate() {
    this.playVoice("SINK RATE", 1.1);
  }

  public static playDontSink() {
    this.playVoice("DON'T SINK", 1.1);
  }

  public static playGlideslope() {
    this.playVoice("GLIDESLOPE", 0.9);
  }

  public static playTraffic() {
    this.playVoice("TRAFFIC, TRAFFIC", 1.2);
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

