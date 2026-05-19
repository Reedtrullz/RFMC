import { useMemo } from 'react';
import { buildNavigationDisplayModel } from '@shared';
import { useFMCStore } from '../../store/useFMCStore';
import { useAircraftStore } from '../../store/aircraftStore';
import { BoeingNDFrame } from './frame/BoeingNDFrame';
import { AirbusNDFrame } from './frame/AirbusNDFrame';
import { NDControls } from './NDControls';
import { B737ND } from './renderers/B737ND';
import { A320ND } from './renderers/A320ND';
import { useInterpolatedTelemetry } from '../../hooks/useInterpolatedTelemetry';

export interface NavigationDisplayProps {
  side?: 'L' | 'R';
}

export function NavigationDisplay({ side = 'L' }: NavigationDisplayProps) {
  const aircraft = useAircraftStore((s) => s.aircraft);
  const rawAircraftState = useAircraftStore((s) => s.aircraftState);
  const aircraftState = useInterpolatedTelemetry(rawAircraftState);
  const position = useAircraftStore((s) => s.position);
  const performance = useAircraftStore((s) => s.performance);
  const radios = useAircraftStore((s) => s.radios);
  const takeoff = useAircraftStore((s) => s.takeoff);
  const landing = useAircraftStore((s) => s.landing);
  const ident = useAircraftStore((s) => s.ident);
  const activeNavSource = useAircraftStore((s) => s.activeNavSource);
  const navPerformance = useAircraftStore((s) => s.navPerformance);

  const fullState = useFMCStore((state) => state);

  const model = useMemo(() => {
    return buildNavigationDisplayModel(fullState, fullState.efisL);
  }, [fullState]);

  return (
    <section
      data-testid="navigation-display"
      className={`cockpit-instrument h-full w-full flex-col rounded-md bg-[#0a0c0c] shadow-[0_32px_64px_rgba(0,0,0,0.8)] ${model.style === 'airbus' ? 'border-airbus-bezel' : 'border-boeing-bezel'}`}
      aria-label="Navigation Display"
    >
      <div className="flex-1 min-h-0 relative overflow-hidden">
        {model.style === 'airbus' ? (
          <AirbusNDFrame model={model}>
            <A320ND model={model} />
          </AirbusNDFrame>
        ) : (
          <BoeingNDFrame model={model} side={side}>
            <B737ND model={model} />
          </BoeingNDFrame>
        )}
      </div>

      {model.style === 'airbus' && <NDControls model={model} side={side} />}
    </section>
  );
}
