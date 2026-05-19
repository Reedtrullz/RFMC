import { useCallback } from 'react';
import { buildAirbusFcuDisplayModel, type AirbusFCUState } from '@shared';
import { InstrumentShell } from '../../common/InstrumentShell';
import { FCUDisplay } from './FCUDisplay';
import { FCUButton } from './FCUButton';
import { useAutopilotStore } from '../../../../store/autopilotStore';
import { useFMCStore } from '../../../../store/useFMCStore';
import { PushPullRotary } from '../../common/PushPullRotary';

interface AirbusFCUProps {
  state: AirbusFCUState;
  updateState: (update: Partial<AirbusFCUState>) => void;
  pressButton: (action: string) => void;
}

export function AirbusFCU({ state, updateState, pressButton }: AirbusFCUProps) {
  const truth = useAutopilotStore((s) => s.truth);
  const tutorialHighlight = useFMCStore((s) => s.tutorialHighlight);
  const highlighted = (controlId: string) => tutorialHighlight === controlId;
  const display = buildAirbusFcuDisplayModel(state, truth);

  const sectionClass =
    'relative flex min-w-[136px] flex-col items-center gap-4 rounded-[6px] border border-black/55 bg-[#404849] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-8px_18px_rgba(0,0,0,0.26)]';
  const labelClass = 'text-[9px] font-black uppercase tracking-[0.16em] text-[#d7e2e3]/60';

  const handleSpeedRotate = useCallback(
    (d: number) => updateState({ speed: Math.max(100, Math.min(340, (state.speed || 100) + d)) }),
    [state.speed, updateState],
  );
  const handleSpeedPush = useCallback(() => pressButton('SPD_MANAGED'), [pressButton]);
  const handleSpeedPull = useCallback(() => pressButton('SPD_SELECTED'), [pressButton]);
  const handleHdgTrkToggle = useCallback(
    () => updateState({ hdgTrkMode: state.hdgTrkMode === 'HDG_VS' ? 'TRK_FPA' : 'HDG_VS' }),
    [state.hdgTrkMode, updateState],
  );
  const handleHeadingRotate = useCallback(
    (d: number) => updateState({ heading: ((state.heading || 0) + d + 360) % 360 }),
    [state.heading, updateState],
  );
  const handleHeadingPush = useCallback(() => pressButton('HDG_MANAGED'), [pressButton]);
  const handleHeadingPull = useCallback(() => pressButton('HDG_SELECTED'), [pressButton]);
  const handleAp1 = useCallback(() => pressButton('AP1'), [pressButton]);
  const handleAp2 = useCallback(() => pressButton('AP2'), [pressButton]);
  const handleAthr = useCallback(() => pressButton('ATHR'), [pressButton]);
  const handleLoc = useCallback(() => pressButton('LOC'), [pressButton]);
  const handleMetricToggle = useCallback(
    () => updateState({ metricAltitude: !state.metricAltitude }),
    [state.metricAltitude, updateState],
  );
  const handleAltitudeRotate = useCallback(
    (d: number) => updateState({ altitude: Math.max(0, Math.min(49000, state.altitude + d * 100)) }),
    [state.altitude, updateState],
  );
  const handleAltitudePush = useCallback(() => pressButton('ALT_MANAGED'), [pressButton]);
  const handleAltitudePull = useCallback(() => pressButton('ALT_SELECTED'), [pressButton]);
  const handleVsUp = useCallback(
    () => updateState({ verticalSpeed: (state.verticalSpeed || 0) + 100 }),
    [state.verticalSpeed, updateState],
  );
  const handleVsDown = useCallback(
    () => updateState({ verticalSpeed: (state.verticalSpeed || 0) - 100 }),
    [state.verticalSpeed, updateState],
  );
  const handleAppr = useCallback(() => pressButton('APPR'), [pressButton]);

  return (
    <InstrumentShell variant="airbus-fcu" className="w-full">
      <div className="flex w-full items-stretch justify-between gap-3 overflow-hidden rounded-md border border-white/8 bg-gradient-to-b from-[#596263] via-[#454d4e] to-[#303738] px-3 py-3 shadow-[inset_0_10px_22px_rgba(255,255,255,0.06),inset_0_-14px_26px_rgba(0,0,0,0.3)]">
        {/* SPEED/MACH Section */}
        <div className={sectionClass}>
          <div className="flex items-center gap-2">
            <span className={`text-[8px] font-bold ${state.speedMachMode === 'SPD' ? 'text-white' : 'text-white/24'}`}>
              SPD
            </span>
            <span className="text-[8px] text-white/20">/</span>
            <span className={`text-[8px] font-bold ${state.speedMachMode === 'MACH' ? 'text-white' : 'text-white/24'}`}>
              MACH
            </span>
          </div>
          <FCUDisplay
            value={state.speed || 0}
            label={display.windows.speed.text}
            managed={display.windows.speed.managed}
            highlighted={highlighted('A320_SPEED')}
          />
          <PushPullRotary
            label="Speed"
            value={state.speed || 100}
            onRotate={handleSpeedRotate}
            onPush={handleSpeedPush}
            onPull={handleSpeedPull}
          />
        </div>

        {/* HDG / TRK Section */}
        <div className={sectionClass}>
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-bold text-white/44 uppercase tracking-widest">HDG V/S</span>
            <button
              className="relative h-3 w-7 rounded-full bg-black/50 shadow-[inset_0_1px_3px_rgba(0,0,0,0.9)]"
              onClick={handleHdgTrkToggle}
            >
              <div
                className={`absolute top-0.5 h-2 w-2 rounded-full bg-[#39ffef] shadow-[0_0_7px_rgba(57,255,239,0.75)] transition-all ${state.hdgTrkMode === 'HDG_VS' ? 'left-0.5' : 'left-4'}`}
              />
            </button>
            <span className="text-[8px] font-bold text-white/44 uppercase tracking-widest">TRK FPA</span>
          </div>
          <FCUDisplay
            value={state.heading || 0}
            label={display.windows.heading.text}
            managed={display.windows.heading.managed}
            highlighted={highlighted('A320_HDG')}
          />
          <PushPullRotary
            label="Heading"
            value={state.heading || 0}
            onRotate={handleHeadingRotate}
            onPush={handleHeadingPush}
            onPull={handleHeadingPull}
            highlighted={highlighted('A320_HDG')}
          />
        </div>

        {/* AP ENGAGE / Central Buttons */}
        <div className="relative flex min-w-[142px] flex-col justify-center gap-3 rounded-[6px] border border-black/55 bg-[#3a4243] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-8px_18px_rgba(0,0,0,0.3)]">
          <span className={labelClass}>AUTOPILOT</span>
          <div className="flex gap-2">
            <FCUButton
              label="AP1"
              active={truth.autopilotStatus === 'AP1' || truth.autopilotStatus === 'AP1_AP2'}
              highlighted={highlighted('A320_AP1')}
              onPress={handleAp1}
            />
            <FCUButton
              label="AP2"
              active={truth.autopilotStatus === 'AP2' || truth.autopilotStatus === 'AP1_AP2'}
              highlighted={highlighted('A320_AP2')}
              onPress={handleAp2}
            />
          </div>
          <div className="flex gap-2">
            <FCUButton
              label="A/THR"
              active={truth.thrustActive !== 'OFF'}
              highlighted={highlighted('A320_ATHR')}
              onPress={handleAthr}
            />
            <FCUButton
              label="LOC"
              active={truth.lateralActive === 'LOC' || truth.lateralArmed === 'LOC'}
              highlighted={highlighted('A320_LOC')}
              onPress={handleLoc}
            />
          </div>
        </div>

        {/* ALTITUDE Section */}
        <div className={sectionClass}>
          <div className="flex items-center gap-2">
            <span className={labelClass}>ALTITUDE</span>
            <button
              className={`rounded border px-1 text-[7px] ${state.metricAltitude ? 'border-white bg-white/20 text-white' : 'border-white/20 text-white/40'}`}
              onClick={handleMetricToggle}
            >
              METRIC
            </button>
          </div>
          <FCUDisplay
            value={state.altitude}
            label={display.windows.altitude.text}
            managed={display.windows.altitude.managed}
            highlighted={highlighted('A320_ALT')}
          />
          <PushPullRotary
            label="Altitude"
            value={state.altitude / 100}
            onRotate={handleAltitudeRotate}
            onPush={handleAltitudePush}
            onPull={handleAltitudePull}
            highlighted={highlighted('A320_ALT')}
          />
        </div>

        {/* V/S - FPA Section */}
        <div className={sectionClass}>
          <span className={labelClass}>{state.hdgTrkMode === 'HDG_VS' ? 'V/S' : 'FPA'}</span>
          <FCUDisplay
            value={state.verticalSpeed || 0}
            label={display.windows.verticalSpeed.text}
            managed={display.windows.verticalSpeed.managed}
          />
          <div className="flex flex-col gap-1">
            <button
              className="h-6 w-12 rounded-t-sm border border-white/10 bg-[#1a1a1a] text-[9px] text-white hover:bg-[#2a2a2a]"
              onClick={handleVsUp}
            >
              UP
            </button>
            <button
              className="h-6 w-12 rounded-b-sm border border-white/10 bg-[#1a1a1a] text-[9px] text-white hover:bg-[#2a2a2a]"
              onClick={handleVsDown}
            >
              DN
            </button>
          </div>
          <FCUButton
            label="APPR"
            active={truth.verticalActive === 'G_S' || truth.verticalArmed === 'G_S'}
            highlighted={highlighted('A320_APPR')}
            onPress={handleAppr}
          />
        </div>
      </div>
    </InstrumentShell>
  );
}
