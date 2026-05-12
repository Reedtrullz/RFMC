import { useMemo } from 'react';
import {
  buildNavigationDisplayModel,
} from '@shared';
import { useFMCStore } from '../../store/useFMCStore';
import { NDFrame } from './NDFrame';
import { NDControls } from './NDControls';
import { B737ND } from './renderers/B737ND';
import { A320ND } from './renderers/A320ND';

export function NavigationDisplay() {
  const state = useFMCStore(s => s);
  const side = 'L'; // In a multi-display setup, this would be a prop
  const efis = side === 'L' ? state.efisL : state.efisR;
  
  const model = useMemo(
    () => buildNavigationDisplayModel(state, efis),
    [state, efis]
  );

  const Renderer = model.style === 'airbus' ? A320ND : B737ND;

  return (
    <section
      data-testid="navigation-display"
      className={`flex h-full min-h-[300px] w-full max-w-[500px] flex-col rounded-md border-4 border-cdu-bezel bg-[#0a0c0c] p-1 shadow-2xl ${model.style === 'airbus' ? 'border-[#3a3d3d]' : 'border-cdu-bezel'}`}
      aria-label="Navigation Display"
    >
      <NDFrame model={model}>
        <Renderer model={model} />
      </NDFrame>

      <NDControls model={model} side={side} />
    </section>
  );
}
