import { useRef, useCallback, useEffect } from 'react';

const SOUNDS = {
  keypress: { freq: 800, duration: 0.05, type: 'square' as OscillatorType, volume: 0.03 },
  scratchpad: { freq: 600, duration: 0.03, type: 'square' as OscillatorType, volume: 0.02 },
  exec: { freq: 1000, duration: 0.08, type: 'sine' as OscillatorType, volume: 0.04 },
  warning: { freq: 440, duration: 0.3, type: 'sawtooth' as OscillatorType, volume: 0.05 },
  lsk: { freq: 700, duration: 0.04, type: 'square' as OscillatorType, volume: 0.03 },
  chime: { freq: 554.37, duration: 1.5, type: 'sine' as OscillatorType, volume: 0.08 }, // C#5
};

type SoundName = keyof typeof SOUNDS;

export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const mutedRef = useRef(false);

  useEffect(() => {
    try {
      ctxRef.current = new AudioContext();
    } catch {
      console.error('[Sound] Failed to create AudioContext');
    }
    mutedRef.current = localStorage.getItem('cdu-muted') === 'true';
    return () => { ctxRef.current?.close(); };
  }, []);

  const play = useCallback((name: SoundName) => {
    if (mutedRef.current || !ctxRef.current) return;
    const s = SOUNDS[name];
    const ctx = ctxRef.current;

    // Resume context if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') ctx.resume();

    if (name === 'chime') {
      // High-Low chime
      [554.37, 440.00].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.5);
        gain.gain.setValueAtTime(s.volume, ctx.currentTime + i * 0.5);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.5 + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.5);
        osc.stop(ctx.currentTime + i * 0.5 + 1.2);
      });
      return;
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = s.type;
    osc.frequency.setValueAtTime(s.freq, ctx.currentTime);
    gain.gain.setValueAtTime(s.volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + s.duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + s.duration);
  }, []);

  const toggleMute = useCallback(() => {
    mutedRef.current = !mutedRef.current;
    localStorage.setItem('cdu-muted', String(mutedRef.current));
    return mutedRef.current;
  }, []);

  const isMuted = () => mutedRef.current;

  return { play, toggleMute, isMuted };
}
