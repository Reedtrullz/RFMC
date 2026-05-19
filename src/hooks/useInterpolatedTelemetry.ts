import { useState, useEffect, useRef } from 'react';
import type { AircraftState } from '@shared';

const mod360 = (val: number) => ((val % 360) + 360) % 360;

export function useInterpolatedTelemetry(rawState: AircraftState | null): AircraftState | null {
  const [interpolatedState, setInterpolatedState] = useState<AircraftState | null>(rawState);

  const rawStateRef = useRef<AircraftState | null>(rawState);
  const currentStateRef = useRef<AircraftState | null>(rawState);
  const animFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  useEffect(() => {
    rawStateRef.current = rawState;
    if (!rawState) {
      currentStateRef.current = null;
      setInterpolatedState(null);
    } else if (!currentStateRef.current) {
      currentStateRef.current = { ...rawState };
      setInterpolatedState({ ...rawState });
    }
  }, [rawState]);

  useEffect(() => {
    const animate = (time: number) => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = time;

      const raw = rawStateRef.current;
      const current = currentStateRef.current;

      if (!raw || !current) {
        return;
      }

      // Check if we need to interpolate (to avoid constant re-renders when telemetry is stationary)
      const targetHeading = raw.heading ?? 0;
      const currentHeading = current.heading ?? 0;
      const headingDiff = mod360(targetHeading - currentHeading + 180) - 180;

      const targetHeadingDeg = raw.headingDeg ?? 0;
      const currentHeadingDeg = current.headingDeg ?? 0;
      const headingDegDiff = mod360(targetHeadingDeg - currentHeadingDeg + 180) - 180;

      const targetPitch = raw.pitchDeg ?? 0;
      const currentPitch = current.pitchDeg ?? 0;
      const pitchDiff = targetPitch - currentPitch;

      const targetBank = raw.bankDeg ?? 0;
      const currentBank = current.bankDeg ?? 0;
      const bankDiff = targetBank - currentBank;

      const targetVs = raw.vs ?? 0;
      const currentVs = current.vs ?? 0;
      const vsDiff = targetVs - currentVs;

      const targetVsFpm = raw.verticalSpeedFpm ?? 0;
      const currentVsFpm = current.verticalSpeedFpm ?? 0;
      const vsFpmDiff = targetVsFpm - currentVsFpm;

      const threshold = 0.001;
      const isHeadingChanging = Math.abs(headingDiff) > threshold || Math.abs(headingDegDiff) > threshold;
      const isPitchChanging = Math.abs(pitchDiff) > threshold;
      const isBankChanging = Math.abs(bankDiff) > threshold;
      const isVsChanging = Math.abs(vsDiff) > threshold || Math.abs(vsFpmDiff) > threshold;

      if (!isHeadingChanging && !isPitchChanging && !isBankChanging && !isVsChanging) {
        if (
          current.heading !== raw.heading ||
          current.headingDeg !== raw.headingDeg ||
          current.pitchDeg !== raw.pitchDeg ||
          current.bankDeg !== raw.bankDeg ||
          current.vs !== raw.vs ||
          current.verticalSpeedFpm !== raw.verticalSpeedFpm
        ) {
          const snapState = {
            ...raw,
            heading: raw.heading,
            headingDeg: raw.headingDeg,
            pitchDeg: raw.pitchDeg,
            bankDeg: raw.bankDeg,
            vs: raw.vs,
            verticalSpeedFpm: raw.verticalSpeedFpm,
          };
          currentStateRef.current = snapState;
          setInterpolatedState(snapState);
        }
        return;
      }

      const alpha = 1 - Math.exp(-12 * dt);

      const nextHeading = mod360(currentHeading + headingDiff * alpha);
      const nextHeadingDeg = mod360(currentHeadingDeg + headingDegDiff * alpha);
      const nextPitch = currentPitch + pitchDiff * alpha;
      const nextBank = currentBank + bankDiff * alpha;
      const nextVs = currentVs + vsDiff * alpha;
      const nextVsFpm = currentVsFpm + vsFpmDiff * alpha;

      const nextState: AircraftState = {
        ...raw,
        heading: nextHeading,
        headingDeg: nextHeadingDeg,
        pitchDeg: nextPitch,
        bankDeg: nextBank,
        vs: nextVs,
        verticalSpeedFpm: nextVsFpm,
      };

      currentStateRef.current = nextState;
      setInterpolatedState(nextState);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, []);

  return interpolatedState;
}
