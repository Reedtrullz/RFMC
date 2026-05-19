import { NavFix, Procedure } from './navdataTypes';
import { getFix } from './navdataStore';

export type ValidationWarning = {
  ident: string;
  message: string;
  type: 'WARNING' | 'ERROR';
};

export function validateRoute(origin: string, destination: string, waypoints: string[]): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  if (origin && !getFix(origin)) {
    warnings.push({ ident: origin, message: 'ORIGIN NOT IN DATABASE', type: 'ERROR' });
  }

  if (destination && !getFix(destination)) {
    warnings.push({ ident: destination, message: 'DEST NOT IN DATABASE', type: 'ERROR' });
  }

  for (const ident of waypoints) {
    if (!getFix(ident)) {
      warnings.push({ ident, message: 'FIX NOT IN DATABASE', type: 'WARNING' });
    }
  }

  return warnings;
}
