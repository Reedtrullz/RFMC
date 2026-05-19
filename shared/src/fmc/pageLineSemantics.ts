import type { DisplayLine } from '../types/fmc';
import type { DisplaySemantic } from './displaySemantics';

export function inferBoeingSemantic(
  color: DisplayLine['color'] | undefined,
  inverse = false,
): DisplaySemantic | undefined {
  if (inverse) return 'title';
  if (color === 'white') return 'label';
  if (color === 'green') return 'activeData';
  if (color === 'magenta') return 'guidance';
  if (color === 'amber' || color === 'red') return 'warning';
  if (color === 'shaded') return 'modified';
  return undefined;
}

export function inferAirbusSemantic(
  color: DisplayLine['color'] | undefined,
  inverse = false,
): DisplaySemantic | undefined {
  if (inverse) return 'title';
  if (color === 'white') return 'label';
  if (color === 'blue') return 'inactiveData';
  if (color === 'green') return 'activeData';
  if (color === 'magenta') return 'guidance';
  if (color === 'amber' || color === 'red') return 'warning';
  if (color === 'shaded') return 'modified';
  return undefined;
}
