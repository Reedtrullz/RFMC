import { useCallback } from 'react';
import { getAudioContext, resumeAudioContext, trackNode } from '../services/audioContext';
import { useCockpitLayoutStore } from '../store/cockpitLayoutStore';

const SOUNDS = {
  keypress: { freq: 800, duration: 0.05, type: 'square' as OscillatorType, volume: 0.03 },
  scratchpad: { freq: 600, duration: 0.03, type: 'square' as OscillatorType, volume: 0.02 },
  exec: { freq: 1000, duration: 0.08, type: 'sine' as OscillatorType, volume: 0.04 },
  warning: { freq: 440, duration: 0.3, type: 'sawtooth' as OscillatorType, volume: 0.05 },
  lsk: { freq: 700, duration: 0.04, type: 'square' as OscillatorType, volume: 0.03 },
  chime: { freq: 554.37, duration: 1.5, type: 'sine' as OscillatorType, volume: 0.08 },
};

type SoundName = keyof typeof SOUNDS;

export function useSound() {
  const soundMuted = useCockpitLayoutStore((state) => state.soundMuted);
  const soundVolume = useCockpitLayoutStore((state) => state.soundVolume);
  const setSoundMuted = useCockpitLayoutStore((state) => state.setSoundMuted);

  const play = useCallback(
    async (name: SoundName) => {
      if (soundMuted) return;

      const ctx = getAudioContext();
      try {
        await resumeAudioContext();
      } catch (e) {
        console.warn('[useSound] Failed to resume audio context:', e);
      }

      const s = SOUNDS[name];
      const volScale = soundVolume / 100;
      const scaledVolume = s.volume * volScale;

      if (name === 'chime') {
        [554.37, 440.0].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.5);
          gain.gain.setValueAtTime(scaledVolume, ctx.currentTime + i * 0.5);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.5 + 1.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          trackNode(osc, gain);
          osc.start(ctx.currentTime + i * 0.5);
          osc.stop(ctx.currentTime + i * 0.5 + 1.2);
        });
        return;
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = s.type;
      osc.frequency.setValueAtTime(s.freq, ctx.currentTime);
      gain.gain.setValueAtTime(scaledVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + s.duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      trackNode(osc, gain);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + s.duration);
    },
    [soundMuted, soundVolume],
  );

  const toggleMute = useCallback(() => {
    const nextMuted = !soundMuted;
    setSoundMuted(nextMuted);
    return nextMuted;
  }, [soundMuted, setSoundMuted]);

  const isMuted = useCallback(() => soundMuted, [soundMuted]);

  return { play, toggleMute, isMuted };
}
