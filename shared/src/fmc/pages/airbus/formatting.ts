import type { DisplayLine } from '../../../types/fmc';
import { inferAirbusSemantic } from '../../pageLineSemantics';

const W = 24;

export function fmt(
  text: string,
  left: string = '',
  right: string = '',
  color?: DisplayLine['color'],
  small: boolean = false,
): DisplayLine {
  return {
    text: text.padEnd(W, ' '),
    leftLabel: left,
    rightLabel: right,
    inverse: false,
    color,
    small,
    semantic: inferAirbusSemantic(color),
  };
}

export function inv(text: string, left: string = '', right: string = '', color?: DisplayLine['color']): DisplayLine {
  return {
    text: text.padEnd(W, ' '),
    leftLabel: left,
    rightLabel: right,
    inverse: true,
    color,
    semantic: inferAirbusSemantic(color, true),
  };
}

export function blank(): DisplayLine {
  return fmt('');
}
