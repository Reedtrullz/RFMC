/**
 * Shared AudioContext singleton for the entire app.
 *
 * - Lazily instantiated on first access.
 * - NEVER closed — lives for the lifetime of the page.
 * - `resume()` returns a Promise so callers can await autoplay-policy unblock.
 * - Tracks active oscillator/gain pairs so they can be aborted on demand.
 */

let context: AudioContext | null = null;
const activeOscillators = new Set<OscillatorNode>();
const activeGains = new Set<GainNode>();

declare global {
  interface Window {
    webkitAudioContext?: AudioContext;
  }
}

function createContext(): AudioContext {
  const Ctor = window.AudioContext ?? window.webkitAudioContext;
  return new Ctor();
}

/** Returns the singleton AudioContext, creating it on first call. */
export function getAudioContext(): AudioContext {
  if (!context) {
    context = createContext();
  }
  return context;
}

/**
 * Ensures the AudioContext is in a 'running' state.
 * Returns a promise that resolves once the context state is 'running'.
 */
export async function resumeAudioContext(): Promise<void> {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
}

/** Register an oscillator + gain pair for lifecycle tracking. */
export function trackNode(osc: OscillatorNode, gain: GainNode): void {
  activeOscillators.add(osc);
  activeGains.add(gain);
  osc.onended = () => {
    activeOscillators.delete(osc);
    activeGains.delete(gain);
    try {
      osc.disconnect();
    } catch {
      /* already disconnected */
    }
    try {
      gain.disconnect();
    } catch {
      /* already disconnected */
    }
  };
}

/** Stop and disconnect all tracked nodes immediately. */
export function stopAll(): void {
  for (const osc of activeOscillators) {
    try {
      osc.stop();
      osc.disconnect();
    } catch {
      /* already stopped */
    }
  }
  for (const gain of activeGains) {
    try {
      gain.disconnect();
    } catch {
      /* already disconnected */
    }
  }
  activeOscillators.clear();
  activeGains.clear();
}
