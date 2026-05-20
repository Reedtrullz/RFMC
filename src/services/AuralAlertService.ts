import { getAudioContext, resumeAudioContext, trackNode, stopAll } from './audioContext';
import { useCockpitLayoutStore } from '../store/cockpitLayoutStore';

export class AuralAlertService {
  /**
   * Initialize audio context and resume if suspended by autoplay policy.
   * Safe to call multiple times — the singleton is created once.
   */
  public static async init(): Promise<void> {
    try {
      getAudioContext();
      await resumeAudioContext();
    } catch (e) {
      console.warn('[AuralAlertService] Failed to initialize audio context:', e);
    }
  }

  /**
   * Stop all actively playing sounds immediately.
   */
  public static stopAll(): void {
    stopAll();
  }

  /**
   * Boeing Caution Chime (Single Bell/Chime)
   */
  public static playBoeingCaution() {
    const ctx = getAudioContext();
    const t = ctx.currentTime;
    this.playRichPulse(ctx, 880, 0.8, t, 0.2);
    this.playRichPulse(ctx, 440, 0.8, t + 0.05, 0.1);
  }

  /**
   * Boeing Warning (Cavalry Charge / Wailer)
   */
  public static playBoeingWarning() {
    const ctx = getAudioContext();
    for (let i = 0; i < 6; i++) {
      const t = ctx.currentTime + i * 0.3;
      this.playRichPulse(ctx, 880, 0.15, t, 0.2);
      this.playRichPulse(ctx, 1100, 0.15, t + 0.15, 0.2);
    }
  }

  /**
   * Airbus Single Chime (Caution)
   */
  public static playAirbusCaution() {
    const ctx = getAudioContext();
    this.playRichPulse(ctx, 580, 0.8, ctx.currentTime, 0.25);
  }

  /**
   * Airbus Continuous Chime (Warning)
   */
  public static playAirbusWarning(durationSec: number = 3) {
    const ctx = getAudioContext();
    for (let i = 0; i < durationSec * 2; i++) {
      this.playRichPulse(ctx, 580, 0.4, ctx.currentTime + i * 0.5, 0.25);
    }
  }

  /**
   * Airbus Triple Click (FMA Change)
   */
  public static playAirbusTripleClick() {
    const ctx = getAudioContext();
    const t = ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      this.playPulse(ctx, 1400, 0.04, t + i * 0.1, 0.15);
    }
  }

  public static playVoice(text: string, rate: number = 1.0) {
    const { soundMuted, soundVolume } = useCockpitLayoutStore.getState();
    if (soundMuted) return;
    if (!window.speechSynthesis) return;

    // Cancel any ongoing speech to prioritize new alerts
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 0.8;
    utterance.volume = soundVolume / 100;

    // Select a male voice if available
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find((v) => v.name.toLowerCase().includes('male')) || voices[0];
    if (voice) utterance.voice = voice;

    window.speechSynthesis.speak(utterance);
  }

  public static playTerrain() {
    this.playVoice('TERRAIN, TERRAIN', 1.2);
  }

  public static playPullUp() {
    this.playVoice('PULL UP, PULL UP', 1.3);
  }

  public static playSinkRate() {
    this.playVoice('SINK RATE', 1.1);
  }

  public static playDontSink() {
    this.playVoice("DON'T SINK", 1.1);
  }

  public static playGlideslope() {
    this.playVoice('GLIDESLOPE', 0.9);
  }

  public static playTooLowGear() {
    this.playVoice('TOO LOW, GEAR', 1.1);
  }

  public static playTooLowFlaps() {
    this.playVoice('TOO LOW, FLAPS', 1.1);
  }

  public static playWindshear() {
    this.playVoice('WINDSHEAR, WINDSHEAR', 1.3);
  }

  public static playTraffic() {
    this.playVoice('TRAFFIC, TRAFFIC', 1.2);
  }

  private static playPulse(ctx: AudioContext, freq: number, duration: number, time: number, volume: number = 0.15) {
    const { soundMuted, soundVolume } = useCockpitLayoutStore.getState();
    if (soundMuted) return;

    const scaledVolume = volume * (soundVolume / 100);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(scaledVolume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    trackNode(osc, gain);
    osc.start(time);
    osc.stop(time + duration);
  }

  private static playRichPulse(ctx: AudioContext, freq: number, duration: number, time: number, volume: number = 0.2) {
    const { soundMuted, soundVolume } = useCockpitLayoutStore.getState();
    if (soundMuted) return;

    const scaledVolume = volume * (soundVolume / 100);
    const frequencies = [freq, freq * 1.5, freq * 2];
    const gains = [1, 0.4, 0.2];

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(scaledVolume, time);
    masterGain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    masterGain.connect(ctx.destination);

    let finishedCount = 0;
    frequencies.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, time);
      gain.gain.setValueAtTime(gains[i], time);
      osc.connect(gain);
      gain.connect(masterGain);
      trackNode(osc, gain);
      osc.onended = () => {
        finishedCount++;
        if (finishedCount === frequencies.length) {
          masterGain.disconnect();
        }
      };
      osc.start(time);
      osc.stop(time + duration);
    });
  }

  // Legacy compatibility
  public static playChime() {
    this.playBoeingCaution();
  }
  public static playTripleClick() {
    this.playAirbusTripleClick();
  }
  public static playCavalryCharge() {
    this.playBoeingWarning();
  }
  public static playSingleChime() {
    this.playAirbusCaution();
  }
  public static playContinuousChime(durationSec: number = 3) {
    this.playAirbusWarning(durationSec);
  }
}
