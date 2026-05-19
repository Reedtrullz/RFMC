import { useMemo } from 'react';
import { useAircraftStore } from '../../../store/aircraftStore';
import { useAutopilotStore } from '../../../store/autopilotStore';
import { useFMCStore } from '../../../store/useFMCStore';
import { FMA } from '../common/FMA';
import { SpeedTape } from '../common/SpeedTape';
import { AltitudeTape } from '../common/AltitudeTape';
import { AttitudeSphere } from '../common/AttitudeSphere';
import { PfdAlerts } from '../common/PfdAlerts';
import { VerticalSpeedIndicator } from '../common/VerticalSpeedIndicator';
import type { FMCState } from '@shared';
import { buildPfdDisplayModel } from '@shared';
import { useInterpolatedTelemetry } from '../../../hooks/useInterpolatedTelemetry';

export function BoeingPFD() {
  const rawAircraftState = useAircraftStore((s) => s.aircraftState);
  const aircraftState = useInterpolatedTelemetry(rawAircraftState);
  const autopilot = useAutopilotStore(
    (s) => ({
      boeing: s.boeing,
      truth: s.truth,
    }),
    (a, b) => a.boeing === b.boeing && a.truth === b.truth,
  );
  const fmc = useFMCStore(
    (s) => ({
      aircraft: s.aircraft,
      gpwsAlert: s.gpwsAlert,
      tcasAlert: s.tcasAlert,
      position: s.position,
    }),
    (a, b) =>
      a.aircraft === b.aircraft &&
      a.gpwsAlert === b.gpwsAlert &&
      a.tcasAlert === b.tcasAlert &&
      a.position?.irsState === b.position?.irsState,
  );

  // Aggregate state for the builder (legacy compatibility for now)
  const aggregatedState = {
    ...fmc,
    aircraftState,
    autopilot,
  };

  const pfd = useMemo(
    () => buildPfdDisplayModel({ fmcState: aggregatedState as unknown as FMCState }).pfd,
    [aggregatedState],
  );

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-black font-mono" data-testid="boeing-pfd">
      <FMA />

      <div className="flex flex-1 relative overflow-hidden">
        <SpeedTape speed={pfd.speed} targetSpeed={pfd.targetSpeed} trend={pfd.speedTrend} variant="boeing" />

        <div className="flex-1 relative flex items-center justify-center">
          <AttitudeSphere
            pitch={pfd.pitch}
            bank={pfd.bank}
            fd={pfd.flightDirector}
            variant="boeing"
            failed={pfd.failureFlags?.attitude}
          />
          <PfdAlerts text={pfd.alertText} level={pfd.alertLevel} />
        </div>

        <AltitudeTape altitude={pfd.altitude} targetAltitude={pfd.targetAltitude} variant="boeing" />
        <VerticalSpeedIndicator
          verticalSpeed={pfd.verticalSpeed}
          targetVerticalSpeed={pfd.targetVerticalSpeed}
          variant="boeing"
        />
      </div>

      <div className="h-12 flex items-center justify-between px-4 border-t border-white/5 bg-black/40">
        <div className="text-white/60 text-[10px]">
          BARO <span className="text-[#00ff44]">29.92 IN</span>
        </div>
        <div className="flex flex-col items-center leading-none">
          <span className="text-[8px] text-[#ff00ff]">
            HDG SEL {pfd.targetHeading?.toString().padStart(3, '0') ?? '---'}
          </span>
          <span className="text-lg font-bold text-white">{Math.round(pfd.heading).toString().padStart(3, '0')}</span>
        </div>
        <div className="text-white/60 text-[10px]">
          DH <span className="text-[#00ff44]">200</span>
        </div>
      </div>
    </div>
  );
}
