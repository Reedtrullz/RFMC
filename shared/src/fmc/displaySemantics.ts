import type { AircraftType, DisplayLine, DisplaySemantic } from '../types/fmc';
export type { DisplaySemantic };
import type { DisplayColor } from './displayColors';

export const BOEING_SEMANTIC_COLORS: Record<DisplaySemantic, DisplayColor> = {
  title: 'cyan',
  label: 'white',
  activeData: 'green',
  inactiveData: 'white',
  modified: 'shaded',
  guidance: 'magenta',
  warning: 'amber',
  caution: 'amber',
  placeholder: 'white',
  scratchpad: 'white',
  inverse: 'white',
  titleBackground: 'cyan',
  pageIndicator: 'white',
};

export const AIRBUS_SEMANTIC_COLORS: Record<DisplaySemantic, DisplayColor> = {
  title: 'white',
  label: 'white',
  activeData: 'green',
  inactiveData: 'blue',
  modified: 'blue',
  guidance: 'magenta',
  warning: 'amber',
  caution: 'amber',
  placeholder: 'amber',
  scratchpad: 'white',
  inverse: 'white',
  titleBackground: 'white',
  pageIndicator: 'white',
};

export function getSemanticColor(aircraft: AircraftType, semantic: DisplaySemantic): DisplayColor {
  return aircraft === 'AIRBUS_A320' ? AIRBUS_SEMANTIC_COLORS[semantic] : BOEING_SEMANTIC_COLORS[semantic];
}

export function withDisplaySemantic(aircraft: AircraftType, semantic: DisplaySemantic, line: DisplayLine): DisplayLine {
  return {
    ...line,
    semantic,
    color: line.color ?? getSemanticColor(aircraft, semantic),
  };
}
