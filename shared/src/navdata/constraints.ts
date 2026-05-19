import { AltitudeConstraint, SpeedConstraint } from './navdataTypes';

export function formatAltitudeConstraint(constraint?: AltitudeConstraint): string {
  if (!constraint) return '';
  const val = Math.round(constraint.value / 100)
    .toString()
    .padStart(2, '0');

  switch (constraint.type) {
    case 'AT':
      return `${val}000`;
    case 'ABOVE':
      return `${val}000A`;
    case 'BELOW':
      return `${val}000B`;
    case 'BETWEEN':
      return `${val}000B${Math.round(constraint.value2! / 100)}A`;
    default:
      return '';
  }
}

export function formatSpeedConstraint(constraint?: SpeedConstraint): string {
  if (!constraint) return '';
  const val = constraint.value.toString();

  switch (constraint.type) {
    case 'AT':
      return val;
    case 'ABOVE':
      return `${val}A`;
    case 'BELOW':
      return `${val}B`;
    default:
      return '';
  }
}
