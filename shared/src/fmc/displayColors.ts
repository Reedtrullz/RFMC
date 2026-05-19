export type BoeingColor = 'cyan' | 'green' | 'magenta' | 'white' | 'black' | 'shaded' | 'amber' | 'red';

export type AirbusColor = 'white' | 'blue' | 'green' | 'amber' | 'magenta' | 'cyan';

export type DisplayColor = BoeingColor | AirbusColor;

export const COLOR_CLASSES: Record<DisplayColor, string> = {
  cyan: 'text-cdu-cyan',
  green: 'text-cdu-text',
  magenta: 'text-fuchsia-400',
  white: 'text-white',
  black: 'text-black',
  shaded: 'text-gray-200',
  amber: 'text-cdu-amber',
  red: 'text-cdu-error',
  blue: 'text-blue-400',
};

export const COLOR_HEX: Record<DisplayColor, string> = {
  cyan: '#00d0ff',
  green: '#39ff14',
  magenta: '#e879f9',
  white: '#ffffff',
  black: '#000000',
  shaded: '#e5e5e5',
  amber: '#ffb000',
  red: '#ff3333',
  blue: '#60a5fa',
};

export const BOEING_DEFAULT_COLOR: DisplayColor = 'green';
export const AIRBUS_DEFAULT_COLOR: DisplayColor = 'amber';

export function getColorClass(color: DisplayColor): string {
  return COLOR_CLASSES[color] || COLOR_CLASSES.white;
}

export function getColorHex(color: DisplayColor): string {
  return COLOR_HEX[color] || COLOR_HEX.white;
}

export function isValidColor(color: string): color is DisplayColor {
  return color in COLOR_CLASSES;
}
