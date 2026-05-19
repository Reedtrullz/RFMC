import { useFMCStore } from '../../../store/useFMCStore';
import { useAircraftStore } from '../../../store/aircraftStore';
import { useAutopilotStore } from '../../../store/autopilotStore';
import { FMA } from '../common/FMA';
import { SpeedTape } from '../common/SpeedTape';
import { AltitudeTape } from '../common/AltitudeTape';
import { AttitudeSphere } from '../common/AttitudeSphere';
import { PfdAlerts } from '../common/PfdAlerts';
import { VerticalSpeedIndicator } from '../common/VerticalSpeedIndicator';
import type { FMCState } from '@shared';
import { buildPfdDisplayModel } from '@shared';
import { useInterpolatedTelemetry } from '../../../hooks/useInterpolatedTelemetry';

export function AirbusPFD() {
  const rawAircraftState = useAircraftStore((s) => s.aircraftState);
  const aircraftState = useInterpolatedTelemetry(rawAircraftState);
  const autopilot = useAutopilotStore(
    (s) => ({
      airbus: s.airbus,
      truth: s.truth,
    }),
    (a, b) => a.airbus === b.airbus && a.truth === b.truth,
  );
  const state = useFMCStore(
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
  const aggregatedState = {
    ...state,
    aircraftState,
    autopilot,
  };
  const pfd = buildPfdDisplayModel({ fmcState: aggregatedState as unknown as FMCState }).pfd;
  const fcu = autopilot.airbus;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#111414] font-mono" data-testid="airbus-pfd">
      <FMA />

      <div className="flex flex-1 relative overflow-hidden">
        <SpeedTape
          speed={pfd.speed}
          targetSpeed={pfd.targetSpeed}
          trend={pfd.speedTrend}
          variant="airbus"
          managed={pfd.managedSpeed}
        />

        <div className="flex-1 relative flex items-center justify-center">
          <AttitudeSphere
            pitch={pfd.pitch}
            bank={pfd.bank}
            fd={pfd.flightDirector}
            variant="airbus"
            failed={pfd.failureFlags?.attitude}
          />
          <PfdAlerts text={pfd.alertText} level={pfd.alertLevel} />
        </div>

        <AltitudeTape
          altitude={pfd.altitude}
          targetAltitude={pfd.targetAltitude}
          variant="airbus"
          managed={pfd.managedAltitude}
        />
        <VerticalSpeedIndicator
          verticalSpeed={pfd.verticalSpeed}
          targetVerticalSpeed={pfd.targetVerticalSpeed}
          variant="airbus"
        />
      </div>

      <div className="h-10 flex items-center justify-center border-t border-white/5 bg-black/50">
        <div className="flex items-center gap-6">
          <span className="text-[9px] font-bold text-[#39ffef]">
            {pfd.managedHeading ? 'HDG MANAGED' : `HDG SEL ${pfd.targetHeading?.toString().padStart(3, '0') ?? '---'}`}
          </span>
          <span className="text-[#00f0ff] text-lg font-bold">
            {Math.round(pfd.heading).toString().padStart(3, '0')}
          </span>
          {fcu.metricAltitude && (
            <span className="text-[#00f0ff] text-[10px] border border-[#00f0ff] px-0.5">METRIC</span>
          )}
        </div>
      </div>
    </div>
  );
}
