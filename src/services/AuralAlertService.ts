export class AuralAlertService {
  private static context: AudioContext | null = null;

  private static init() {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  /**
   * Boeing Caution Chime (Single Bell/Chime)
   */
  public static playBoeingCaution() {
    this.init();
    if (!this.context) return;
    const t = this.context.currentTime;
    // Boeing caution is a dual-tone chime or a single rich chime
    this.playRichPulse(880, 0.8, t, 0.2);
    this.playRichPulse(440, 0.8, t + 0.05, 0.1);
  }

  /**
   * Boeing Warning (Cavalry Charge / Wailer)
   */
  public static playBoeingWarning() {
    this.init();
    if (!this.context) return;
    // AP Disconnect or high priority warning
    for (let i = 0; i < 6; i++) {
      const t = this.context.currentTime + i * 0.3;
      this.playRichPulse(880, 0.15, t, 0.2);
      this.playRichPulse(1100, 0.15, t + 0.15, 0.2);
    }
  }

  /**
   * Airbus Single Chime (Caution)
   */
  public static playAirbusCaution() {
    this.init();
    if (!this.context) return;
    this.playRichPulse(580, 0.8, this.context.currentTime, 0.25);
  }

  /**
   * Airbus Continuous Chime (Warning)
   */
  public static playAirbusWarning(durationSec: number = 3) {
    this.init();
    if (!this.context) return;
    for (let i = 0; i < durationSec * 2; i++) {
      this.playRichPulse(580, 0.4, this.context.currentTime + i * 0.5, 0.25);
    }
  }

  /**
   * Airbus Triple Click (FMA Change)
   */
  public static playAirbusTripleClick() {
    this.init();
    if (!this.context) return;
    const t = this.context.currentTime;
    for (let i = 0; i < 3; i++) {
      this.playPulse(1400, 0.04, t + i * 0.1, 0.15);
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

  private static playPulse(freq: number, duration: number, time: number, volume: number = 0.15) {
    if (!this.context) return;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    osc.connect(gain);
    gain.connect(this.context.destination);
    osc.start(time);
    osc.stop(time + duration);
  }

  private static playRichPulse(freq: number, duration: number, time: number, volume: number = 0.2) {
    if (!this.context) return;
    
    // Create multiple oscillators for harmonic richness
    const frequencies = [freq, freq * 1.5, freq * 2];
    const gains = [1, 0.4, 0.2];

    const masterGain = this.context.createGain();
    masterGain.gain.setValueAtTime(volume, time);
    masterGain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    masterGain.connect(this.context.destination);

    frequencies.forEach((f, i) => {
      const osc = this.context!.createOscillator();
      const gain = this.context!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, time);
      gain.gain.setValueAtTime(gains[i], time);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(time);
      osc.stop(time + duration);
    });
  }

  // Legacy compatibility
  public static playChime() { this.playBoeingCaution(); }
  public static playTripleClick() { this.playAirbusTripleClick(); }
  public static playCavalryCharge() { this.playBoeingWarning(); }
  public static playSingleChime() { this.playAirbusCaution(); }
  public static playContinuousChime(durationSec: number = 3) { this.playAirbusWarning(durationSec); }
}

